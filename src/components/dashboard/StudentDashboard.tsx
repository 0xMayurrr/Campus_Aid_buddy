import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { getStudentProfile, getAnnouncements } from '@/services/firestoreService';
import { StudentProfile, Announcement } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Send, Bot, Ticket, TrendingUp, AlertCircle,
  CheckCircle, Clock, CreditCard, ChevronRight, Loader2,
  Bell, GraduationCap, Calendar, Sparkles, User, ArrowRight,
  Search, MessageSquare, HelpCircle, Plus, Zap, Activity, Users,
  BookMarked, Clock4, Filter, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { tickets, fetchTickets } = useTickets();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        await Promise.all([
          fetchTickets(),
          getStudentProfile(user.uid).then(setProfile),
          getAnnouncements('student').then((a) => setAnnouncements(a.slice(0, 5))),
        ]);
      } catch (err) {
        // Fallback for safety
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, fetchTickets]);

  const activeTicketsCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 text-[#74aa95] animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Dashboard Interface...</p>
      </div>
    );
  }

  const todayClasses = [
    { time: '09:30', period: 'AM', subject: 'Data Structures', room: 'Room 402', teacher: 'Dr. Aris', status: 'Ongoing', color: 'bg-[#74aa95]' },
    { time: '01:00', period: 'PM', subject: 'Cloud Computing', room: 'Lab 05', teacher: 'Prof. Miller', status: 'Upcoming', color: 'bg-slate-100' },
    { time: '03:30', period: 'PM', subject: 'Cyber Security', room: 'Hall B', teacher: 'Dr. Lane', status: 'Upcoming', color: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* ── CLEAN SAAS HEADER ── */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 md:p-14 shadow-sm relative overflow-hidden group">
         <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/5 border border-orange-500/10">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Portal Version 4.0 Stable</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                 Welcome Back, <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#74aa95]">
                   {user?.name?.split(' ')[0]}
                 </span>
               </h1>
               <p className="text-slate-500 font-bold text-lg md:text-xl max-w-xl leading-relaxed">
                 You have <span className="text-slate-900">3 ongoing modules</span> and {activeTicketsCount} unresolved system tickets. <br/>
                 Keep tracking your performance below.
               </p>
            </div>

            <div className="flex flex-wrap gap-4">
               <Button 
                 onClick={() => navigate('/library')}
                 className="bg-slate-950 text-white hover:bg-orange-600 px-10 py-7 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95 flex gap-3"
               >
                 <BookMarked className="w-5 h-5" />
                 Open Library
               </Button>
               <Button 
                  onClick={() => navigate('/submit')}
                  variant="outline"
                  className="bg-white text-slate-950 border-slate-200 hover:bg-slate-50 px-10 py-7 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm active:scale-95"
               >
                 New Request
               </Button>
            </div>
         </div>
         
         {/* Subtle pattern background */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </section>

      {/* ── METRICS GRID (CAMU STYLE) ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Academic Performance', value: `${profile?.cgpa || 88}%`, sub: 'Above average in Dept', icon: Activity, color: 'text-[#74aa95]', bg: 'bg-[#74aa95]/10', border: 'border-[#74aa95]/10' },
          { label: 'Attendance Integrity', value: '92%', sub: 'No violations detected', icon: CheckCircle2, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'System Tickets', value: activeTicketsCount, sub: 'Responses pending', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Remaining Credits', value: '42', sub: 'Semester 4 progression', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        ].map((met, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-slate-900 transition-all duration-300">
             <div className="flex items-start justify-between mb-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", met.bg)}>
                   <met.icon className={cn("w-7 h-7", met.color)} />
                </div>
                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Feed</div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{met.label}</p>
                <h3 className="text-3xl font-black text-slate-950 leading-none mb-2">{met.value}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{met.sub}</p>
             </div>
          </div>
        ))}
      </section>

      {/* ── CENTRAL CONSOLE GRID ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Daily Schedule (Camu inspired table/list) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
           <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-slate-400" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-950 tracking-tight">Today's Academic Intake</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mar 25, 2026 · SVCE Campus</p>
                 </div>
              </div>
              <Button variant="ghost" className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest gap-2">
                 Weekly View <ArrowRight className="w-4 h-4" />
              </Button>
           </div>
           
           <div className="p-8">
              <div className="space-y-4">
                 {todayClasses.map((cls, idx) => (
                   <div key={idx} className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[1.5rem] bg-white border border-slate-100 hover:border-slate-900 hover:shadow-2xl transition-all group/item">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                         <div className={cn("w-16 h-16 rounded-2xl shrink-0 flex flex-col items-center justify-center text-white shadow-xl shadow-black/5", cls.color.includes('bg-[#74aa95]') ? 'bg-[#74aa95]' : 'bg-slate-950')}>
                            <span className="text-lg font-black tracking-tighter leading-none">{cls.time}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{cls.period}</span>
                         </div>
                         <div className="min-w-0">
                            <h4 className="text-lg font-black text-slate-950 tracking-tight truncate">{cls.subject}</h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{cls.room} · {cls.teacher}</p>
                         </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-10">
                         <div className="flex flex-col items-end">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border shadow-sm",
                              cls.status === 'Ongoing' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"
                            )}>
                               {cls.status}
                            </span>
                         </div>
                         <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                               <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                  {i === 3 ? '+4' : <User className="w-3.5 h-3.5" />}
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="mt-auto p-4 bg-slate-50/50 border-t border-slate-50">
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Session logs synchronized with department grid</p>
           </div>
        </div>

        {/* Notices/Announcements (Camu Sidebar look) */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
           <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-orange-600 shadow-sm">
                    <Bell className="w-5 h-5 animate-bounce" />
                 </div>
                 <h2 className="text-xl font-black text-slate-950 tracking-tight">University Feed</h2>
              </div>
           </div>
           
           <div className="flex-1 p-8 space-y-8 relative before:absolute before:left-12 before:top-12 before:bottom-12 before:w-[1px] before:bg-slate-100">
              {announcements.slice(0, 4).map((a, i) => (
                <div key={a.id} className="relative pl-14 group/notice">
                   <div className={cn(
                     "absolute left-[-4px] top-1.5 w-2 h-2 rounded-full border-[3px] bg-white transition-all duration-500 group-hover/notice:scale-150 group-hover/notice:bg-slate-900 z-10",
                     i === 0 ? "border-[#74aa95]" : i === 1 ? "border-orange-500" : "border-slate-300"
                   )} />
                   <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">
                        {new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • Internal Notice
                      </p>
                      <h4 className="text-sm font-black text-slate-950 leading-tight mb-2 group-hover/notice:text-orange-600 transition-colors uppercase tracking-tight">{a.title}</h4>
                      <p className="text-[11px] font-bold text-slate-400 line-clamp-2 leading-relaxed">{a.body}</p>
                   </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center space-y-4">
                   <Bell className="w-10 h-10" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Feed Quiet</p>
                </div>
              )}
           </div>

           <Link 
              to="/announcements" 
              className="p-6 text-center text-[10px] font-black text-slate-400 hover:text-orange-600 transition-all border-t border-slate-50 uppercase tracking-[0.2em]"
           >
              Access Bulletin Archive
           </Link>
        </div>
      </section>

      {/* ── FOOTER: SMART BUDDY HELPER ── */}
      <section className="bg-slate-950 rounded-[3rem] p-10 md:p-14 flex flex-col xl:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
         <div className="w-24 h-24 rounded-[2rem] bg-orange-500 flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform shadow-2xl">
            <Bot className="w-12 h-12" />
         </div>
         
         <div className="flex-1 text-center xl:text-left relative z-10">
            <div className="flex items-center justify-center xl:justify-start gap-2 mb-4">
               <span className="text-[10px] font-black text-[#74aa95] uppercase tracking-[0.3em]">AI BUDDY PERSISTENT</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none mb-4">Neural Library Search.</h3>
            <p className="text-slate-400 font-bold text-base md:text-lg max-w-xl leading-relaxed">
              Our AI models are now indexing Mar 25 releases. Query the library using natural language processing protocols.
            </p>
         </div>

         <div className="w-full xl:w-auto mt-6 xl:mt-0 relative z-10">
            <div className="flex gap-4 p-2 bg-white/5 border border-white/10 rounded-[2rem] w-full xl:w-[28rem] group-focus-within:border-[#74aa95]/50 transition-all">
               <input 
                 className="bg-transparent border-none focus:ring-0 text-white flex-1 px-8 py-4 font-bold text-sm placeholder:text-slate-600" 
                 placeholder="Search the neural mesh..." 
                 type="text"
               />
               <button 
                 onClick={() => navigate('/campus-ai')}
                 className="bg-[#74aa95] text-white p-5 rounded-2xl hover:bg-orange-500 transition-all shadow-xl active:scale-95 group/btn"
               >
                 <Send className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </section>

    </div>
  );
}
