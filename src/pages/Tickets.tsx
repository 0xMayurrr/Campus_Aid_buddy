import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { Ticket, TicketStatus } from '@/types';
import { analyzeTicket } from '@/services/geminiService';
import { updateTicketAI } from '@/services/firestoreService';
import {
  Ticket as TicketIcon, CheckCircle, Clock, AlertCircle, XCircle,
  Bot, ChevronDown, ChevronUp, Loader2, Search, Plus,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
  submitted: { label: 'New Request', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
  in_progress: { label: 'In Review', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
  closed: { label: 'Finalized', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: XCircle },
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-500 border-slate-200',
  medium: 'bg-blue-50 text-blue-600 border-blue-100',
  high: 'bg-orange-50 text-orange-600 border-orange-200',
  urgent: 'bg-rose-50 text-rose-600 border-rose-200 font-bold animate-pulse',
};

export default function Tickets() {
  const { user } = useAuth();
  const { tickets, fetchTickets, updateTicketStatus, isLoading } = useTickets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [localTickets, setLocalTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { setLocalTickets(tickets); }, [tickets]);

  const filtered = localTickets.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSummarize = async (ticket: Ticket) => {
    setSummarizing(ticket.id);
    try {
      const { summary, priority } = await analyzeTicket(ticket);
      await updateTicketAI(ticket.id, summary, priority);
      setLocalTickets((prev) =>
        prev.map((t) => t.id === ticket.id ? { ...t, aiSummary: summary, aiPriority: priority } : t)
      );
      toast.success('AI analysis complete!');
    } catch {
      toast.error('AI analysis failed');
    } finally {
      setSummarizing(null);
    }
  };

  const canChangeStatus = user?.role === 'faculty' || user?.role === 'hod' || user?.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {user?.role === 'student' ? 'Support Tracker' : 'Incidents Management'}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Monitor and govern campus requests
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="font-bold text-slate-800">{filtered.length} active records</span>
          </p>
        </div>
        {user?.role === 'student' && (
          <Link to="/submit" className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-slate-200">
            <Plus className="w-4 h-4" />
            Raise New Incident
          </Link>
        )}
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: localTickets.length, icon: TicketIcon, color: 'text-slate-400', bg: 'bg-white' },
          { label: 'Unresolved', value: localTickets.filter((t) => t.status === 'submitted').length, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-white' },
          { label: 'In Review', value: localTickets.filter((t) => t.status === 'in_progress').length, icon: Clock, color: 'text-blue-500', bg: 'bg-white' },
          { label: 'Closed Cases', value: localTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-white' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} p-5 rounded-2xl border border-slate-200 shadow-sm`}>
            <div className="flex justify-between items-start mb-2">
               <s.icon className={`w-5 h-5 ${s.color}`} />
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{s.value}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident by title, keyword, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900/40 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none font-bold"
        >
          <option value="">Lifecycle State: All</option>
          <option value="submitted">New Requests</option>
          <option value="in_progress">Active Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Finalized</option>
        </select>
      </div>

      {/* Tickets List (Structured ERP Style) */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Syncing with Server...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
          <CheckCircle className="w-12 h-12 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-500 font-bold italic underline decoration-slate-200 underline-offset-4">No active incidents found in this sector</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ticket) => {
            const isOpen = expanded === ticket.id;
            const config = STATUS_CONFIG[ticket.status];
            const StatusIcon = config.icon;
            return (
              <div key={ticket.id} className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-slate-900/5 shadow-xl' : 'hover:shadow-md'}`}>
                {/* Compact Row */}
                <div
                  className={`flex items-center gap-4 p-5 cursor-pointer transition-colors ${isOpen ? 'bg-slate-50/80 border-b border-slate-100' : 'hover:bg-slate-50'}`}
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                >
                  <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0`}>
                    <StatusIcon className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-black text-slate-400 tracking-tighter shrink-0">{ticket.id.slice(-6).toUpperCase()}</span>
                       <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{ticket.dept}</span>
                    </div>
                    <p className={`text-sm font-bold text-slate-900 truncate leading-none ${isOpen ? '' : ''}`}>{ticket.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border tracking-widest ${PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium}`}>{ticket.priority}</span>
                    <span className={`hidden sm:inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${config.bg} ${config.text} ${config.border}`}>{config.label}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-900" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Technical Details Panel */}
                {isOpen && (
                  <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Matter / Description</p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed italic">
                              "{ticket.description}"
                            </div>
                          </div>
                          
                          {ticket.location && (
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verified Location</p>
                              <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-900" />{ticket.location}</p>
                            </div>
                          )}
                       </div>

                       <div className="space-y-6">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requester Metadata</p>
                              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase">{ticket.raisedByName?.charAt(0)}</div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 leading-none">{ticket.raisedByName}</p>
                                  <p className="text-[10px] text-slate-500 mt-1">{ticket.raisedByEmail}</p>
                                </div>
                              </div>
                            </div>

                            {/* AI Deep Audit */}
                            {ticket.aiSummary ? (
                              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-sm relative group">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center translate-y-[-10px] shadow-lg">
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">AI Audit Report</span>
                                  {ticket.aiPriority && (
                                    <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-black border uppercase ${PRIORITY_STYLES[ticket.aiPriority]}`}>
                                      Audit Priority: {ticket.aiPriority}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-slate-600 leading-relaxed leading-[1.6]">
                                  {ticket.aiSummary}
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSummarize(ticket)}
                                disabled={summarizing === ticket.id}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-30"
                              >
                                {summarizing === ticket.id ? (
                                  <><Loader2 className="w-4 h-4 animate-spin" /> Performing Auditor Sweep...</>
                                ) : (
                                  <><Bot className="w-4 h-4" /> Trigger AI Audit</>
                                )}
                              </button>
                            )}
                       </div>
                    </div>

                    {/* Governance Controls (Status Change) */}
                    {canChangeStatus && (
                      <div className="pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Governance Overrides</p>
                        <div className="flex gap-2 flex-wrap">
                          {(['submitted', 'in_progress', 'resolved', 'closed'] as TicketStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateTicketStatus(ticket.id, status)}
                              disabled={ticket.status === status}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                ticket.status === status
                                  ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text} ${STATUS_CONFIG[status].border} cursor-default`
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                              }`}
                            >
                              Move to {STATUS_CONFIG[status].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
