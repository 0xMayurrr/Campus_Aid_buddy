import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Ticket, TicketStatus, TicketCategory, TicketPriority } from '@/types';
import {
  createTicket as fsCreateTicket,
  getAllTickets,
  getTicketsByUser,
  getTicketsByDept,
  updateTicketStatus as fsUpdateStatus,
  updateTicketAI,
} from '@/services/firestoreService';
import { analyzeTicket } from '@/services/geminiService';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CreateTicketData {
  title: string;
  description: string;
  category: TicketCategory;
  dept: string;
  priority?: TicketPriority;
  location?: string;
}

interface TicketContextType {
  tickets: Ticket[];
  isLoading: boolean;
  fetchTickets: () => Promise<void>;
  createTicket: (data: CreateTicketData) => Promise<void>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<void>;
  summarizeTicketWithAI: (ticket: Ticket) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let data: Ticket[] = [];
      if (user.role === 'admin' || user.role === 'hod' || user.role === 'faculty') {
        // Admin, HOD, Faculty all see all tickets — filter by dept in UI if needed
        data = await getAllTickets();
      } else if (user.role === 'student') {
        data = await getTicketsByUser(user.uid);
      }
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createTicket = useCallback(async (data: CreateTicketData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const ticketId = await fsCreateTicket({
        title: data.title,
        description: data.description,
        category: data.category,
        dept: data.dept || user.dept || 'General',
        status: 'submitted',
        priority: data.priority || 'medium',
        raisedBy: user.uid,
        raisedByName: user.name,
        raisedByEmail: user.email,
        location: data.location,
      });
      toast.success('Ticket submitted successfully!');
      await fetchTickets();
      // Auto-summarize in background — non-blocking
      const draftTicket = {
        id: ticketId,
        title: data.title,
        description: data.description,
        category: data.category,
        dept: data.dept || user.dept || 'General',
        status: 'submitted' as const,
        priority: data.priority || 'medium',
        raisedBy: user.uid,
        raisedByName: user.name,
        raisedByEmail: user.email,
        location: data.location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      analyzeTicket(draftTicket).then(({ summary, priority }) => {
        updateTicketAI(ticketId, summary, priority);
        setTickets((prev) =>
          prev.map((t) => t.id === ticketId ? { ...t, aiSummary: summary, aiPriority: priority } : t)
        );
      }).catch(() => {});
    } catch (err) {
      toast.error('Failed to submit ticket');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchTickets]);

  const updateTicketStatus = useCallback(async (id: string, status: TicketStatus) => {
    try {
      await fsUpdateStatus(id, status);
      setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
      toast.success(`Ticket marked as ${status.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update ticket');
    }
  }, []);

  const summarizeTicketWithAI = useCallback(async (ticket: Ticket) => {
    try {
      toast.info('Analyzing ticket with AI...');
      const { summary, priority } = await analyzeTicket(ticket);
      await updateTicketAI(ticket.id, summary, priority);
      setTickets((prev) =>
        prev.map((t) => t.id === ticket.id ? { ...t, aiSummary: summary, aiPriority: priority } : t)
      );
      toast.success('AI analysis complete!');
    } catch {
      toast.error('AI analysis failed');
    }
  }, []);

  return (
    <TicketContext.Provider value={{ tickets, isLoading, fetchTickets, createTicket, updateTicketStatus, summarizeTicketWithAI }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used within TicketProvider');
  return ctx;
}
