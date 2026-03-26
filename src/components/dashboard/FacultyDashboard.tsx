import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { getStudentsByDept, getAnnouncements, getAllLibraryItems } from '@/services/firestoreService';
import { StudentProfile, Announcement, LibraryItem } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  Users, Ticket, Upload, Bell, CheckCircle, Clock, AlertCircle,
  ChevronRight, Loader2, TrendingUp, BookOpen, Search, Plus,
  FileText, Video, MoreVertical, LayoutGrid, List, BarChart3,
  Calendar, User, ArrowRight, MessageSquare, HelpCircle, UserCog,
  ShieldCheck, LayoutDashboard, Globe, Activity, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { tickets, fetchTickets } = useTickets();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const MOCK_STUDENTS: StudentProfile[] = [
    { uid: 's1', name: 'Julian Thorne', rollNo: 'SVCE-22-001', dept: user?.dept || 'CSE', year: 2, cgpa: 8.9, email: 'julian@svce.edu', semester: 4, attendance: { 'DSA': 92, 'DBMS': 88, 'OS': 94 }, billing: { status: 'paid', amount: 45000, dueDate: '2024-05-10' } },
    { uid: 's2', name: 'Alara Vane', rollNo: 'SVCE-22-042', dept: user?.dept || 'CSE', year: 2, cgpa: 7.6, email: 'alara@svce.edu', semester: 4, attendance: { 'DSA': 74, 'DBMS': 81, 'OS': 79 }, billing: { status: 'pending', amount: 45000, dueDate: '2024-04-30' } },
    { uid: 's3', name: 'Marcus Lane', rollNo: 'SVCE-22-088', dept: user?.dept || 'CSE', year: 2, cgpa: 9.2, email: 'marcus@svce.edu', semester: 4, attendance: { 'DSA': 96, 'DBMS': 98, 'OS': 92 }, billing: { status: 'paid', amount: 45000, dueDate: '2024-05-10' } },
  ];

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [_, deptStudents] = await Promise.all([
          fetchTickets(),
          user.dept ? getStudentsByDept(user.dept).then(s => s.length > 0 ? s : MOCK_STUDENTS) : Promise.resolve(MOCK_STUDENTS),
          getAnnouncements('faculty').then(setAnnouncements),
          getAllLibraryItems().then((items) => 
            setLibraryItems(items.filter(i => i.uploadedBy === user.uid))
          ),
        ]);
        if (deptStudents) setStudents(deptStudents);
      } catch (err) {
        setStudents(MOCK_STUDENTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, fetchTickets]);

  const pendingTickets = tickets.filter((t) => t.status === 'submitted' || t.status === 'in_progress');
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed');
  const urgentCount = pendingTickets.filter(t => t.priority === 'urgent').length;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 text-[#74aa95] animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Compiling Faculty Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 bg-white rounded-xl border border-slate-200 p-8 shadow-sm group">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <UserCog className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tighter leading-none mb-2">Faculty Console</h1>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-80">{user?.name}</span>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <span className="text-[10px] font-black text-[#74aa95] uppercase tracking-widest leading-none">Sector {user?.dept}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate('/announcements')}
            className="bg-white border border-slate-200 text-slate-950 hover:bg-slate-50 px-6 h-12 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
          >
            Broadcast Notice
          </Button>
          <Button 
            onClick={() => navigate('/library')}
            className="bg-slate-950 hover:bg-black text-white px-6 h-12 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
          >
            Manage Artifacts
          </Button>
        </div>
      </div>

      {/* ── METRICS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Personnel', value: students.length, sub: 'Active Students', icon: Users, color: 'text-slate-950', bg: 'bg-slate-50' },
          { label: 'Incident Tracks', value: pendingTickets.length, sub: `${urgentCount} Emergencies`, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Knowledge Base', value: libraryItems.length, sub: 'Your Publications', icon: BookOpen, color: 'text-[#74aa95]', bg: 'bg-[#74aa95]/5' },
          { label: 'Operational Sync', value: `${tickets.length > 0 ? Math.round((resolvedTickets.length / tickets.length) * 100) : 100}%`, sub: 'Stability Index', icon: ShieldCheck, color: 'text-slate-950', bg: 'bg-slate-100' },
        ].map((met, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-slate-950 transition-all">
             <div className="flex items-center justify-between mb-6">
                <div className={cn("w-10 h-10 rounded flex items-center justify-center", met.bg)}>
                   <met.icon className={cn("w-5 h-5 shadow-sm", met.color)} />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{met.label}</p>
             <h3 className="text-2xl font-black text-slate-950 leading-none mb-1.5 tracking-tight">{met.value}</h3>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{met.sub}</p>
          </div>
        ))}
      </section>

      {/* ── ACTION GRID ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Logs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col group hover:border-slate-300 transition-all">
           <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-50">
              <h2 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-3">
                 <Users className="w-4 h-4 text-slate-400" />
                 Sector Personnel
              </h2>
              <div className="relative group/search">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                 <input 
                   type="text" 
                   className="bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-4 text-[10px] font-black focus:bg-white focus:border-slate-950 transition-all text-slate-950 md:w-48 outline-none" 
                   placeholder="SEARCH INDEX..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
           </div>

           <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50">
                       <th className="px-4 py-4">Identity Protocol</th>
                       <th className="px-4 py-4">Identifier</th>
                       <th className="px-4 py-4 text-center">CGPA</th>
                       <th className="px-4 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map((s) => (
                      <tr key={s.uid} className="hover:bg-slate-50/50 transition-all cursor-pointer group/row">
                         <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover/row:bg-slate-950 group-hover/row:text-white transition-all">
                                  {s.name.charAt(0)}
                               </div>
                               <span className="font-bold text-xs text-slate-900">{s.name}</span>
                            </div>
                         </td>
                         <td className="px-4 py-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.rollNo}</span>
                         </td>
                         <td className="px-4 py-4 text-center">
                            <span className={cn("text-xs font-black", s.cgpa >= 8.5 ? "text-emerald-600" : "text-slate-900")}>
                               {s.cgpa.toFixed(2)}
                            </span>
                         </td>
                         <td className="px-4 py-4 text-right">
                            <ChevronRight className="w-4 h-4 text-slate-100 group-hover/row:text-slate-950 transition-colors ml-auto" />
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Active Tracks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col group hover:border-slate-300 transition-all">
           <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-3">
                 <Activity className="w-4 h-4 text-orange-500" />
                 Active Tracks
              </h2>
              <span className="text-[8px] font-black px-2 py-1 bg-orange-50 border border-orange-100 text-orange-600 rounded uppercase">Live Feed</span>
           </div>

           <div className="p-4 space-y-3 overflow-y-auto h-[400px] custom-scrollbar bg-slate-50/20">
              {pendingTickets.map((t) => (
                <div key={t.id} className="p-5 rounded-lg bg-white border border-slate-100 shadow-sm hover:border-slate-950 transition-all group/item">
                   <div className="flex justify-between items-start mb-3">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shadow-sm",
                        t.priority === 'urgent' ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-400"
                      )}>{t.priority}</span>
                      <span className="text-[9px] font-black text-slate-300">#{t.id.slice(-4).toUpperCase()}</span>
                   </div>
                   <h4 className="text-[11px] font-black text-slate-950 leading-tight mb-2 uppercase tracking-tight line-clamp-1">{t.title}</h4>
                   <p className="text-[10px] font-bold text-slate-400 line-clamp-2 leading-relaxed mb-4">{t.description}</p>
                   <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{t.raisedByName}</span>
                      <Button className="h-6 px-3 bg-slate-950 hover:bg-black text-white text-[8px] font-black uppercase tracking-widest rounded transition-all">Resolve →</Button>
                   </div>
                </div>
              ))}
              {pendingTickets.length === 0 && (
                 <div className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No active tracks detected.</div>
              )}
           </div>
           
           <button onClick={() => navigate('/tickets')} className="p-5 text-center text-[9px] font-black text-slate-400 hover:text-orange-600 border-t border-slate-50 transition-all uppercase tracking-widest group">
              View Audit History <ArrowRight className="inline-block w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

      </section>

    </div>
  );
}
