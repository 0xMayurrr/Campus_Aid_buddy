import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { getStudentProfile, getAnnouncements } from '@/services/firestoreService';
import { StudentProfile as SP, Announcement } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Loader2, ChevronRight, FileDown,
  Mail, Phone, Clock, MoreVertical, Filter, History, Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function StudentProfile() {
  const { user } = useAuth();
  const { tickets, fetchTickets } = useTickets();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SP | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const MOCK_PROFILE: SP = {
    uid: user?.uid || 'u1',
    name: user?.name || 'Julian Thorne',
    email: user?.email || 'julian@svce.edu',
    rollNo: 'SVCE-2024-0892',
    dept: user?.dept || 'Bio-Engineering',
    year: user?.year || 2,
    cgpa: 8.82,
    semester: 4,
    phone: '+91 98765 43210',
    attendance: { 'Molecular Genetics': 96, 'Biochemical Engineering': 88, 'Advanced Calculus': 91, 'Ethics': 94 },
    billing: { status: 'paid', amount: 45250, dueDate: '2024-10-12' }
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [_, profData] = await Promise.all([
          fetchTickets(),
          getStudentProfile(user.uid).then(p => p || MOCK_PROFILE),
          getAnnouncements('student').then(setAnnouncements),
        ]);
        if (profData) setProfile(profData);
      } catch (err) {
        console.error('Profile load error:', err);
        setProfile(MOCK_PROFILE);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, fetchTickets]);

  const calculateOverallAttendance = () => {
    if (!profile?.attendance) return 0;
    const values = Object.values(profile.attendance);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const overallAttendance = calculateOverallAttendance();
  const dashOffset = 502.6 - (502.6 * overallAttendance) / 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Student Profile</h2>
          <p className="mt-3 text-slate-500 text-lg font-medium">Academic Year 2023-2024 • Semester {profile?.semester || 'IV'}</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="px-6 py-6 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            onClick={() => toast.info('Exporting student record...')}
          >
            <FileDown className="w-4 h-4" />
            Export Record
          </Button>
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10"
            onClick={() => navigate('/settings')}
          >
            Edit Information
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        
        {/* ── LEFT COLUMN: IDENTITY CARD ── */}
        <section className="col-span-12 lg:col-span-3 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 overflow-hidden relative group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-orange-400/10 to-orange-600/10" />
            <div className="relative z-10 flex flex-col items-center">
              {profile?.photoUrl ? (
                <img 
                  src={profile.photoUrl} 
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105" 
                  alt="Student" 
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-4xl font-black border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  {user?.name?.charAt(0)}
                </div>
              )}
              
              <h3 className="mt-6 text-2xl font-black text-slate-900 tracking-tight text-center">{profile?.name || user?.name}</h3>
              <p className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] mt-2">ID: {profile?.rollNo || '#PENDING'}</p>
              
              <div className="mt-8 w-full space-y-4">
                {[
                  { label: 'GPA', value: profile?.cgpa?.toFixed(2) || '0.00' },
                  { label: 'Semester', value: `${profile?.semester || '—'}th` },
                  { label: 'Department', value: profile?.dept || user?.dept || 'General' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-sm font-black text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 w-full">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Quick Contact</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer group/link">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover/link:bg-orange-600 group-hover/link:text-white transition-all">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer group/link">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover/link:bg-orange-600 group-hover/link:text-white transition-all">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>{profile?.phone || '+91 000 0000 000'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Status Quick Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Status</h4>
              <span className={cn(
                "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter border",
                profile?.billing?.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
              )}>
                {profile?.billing?.status || 'Pending'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">₹{(profile?.billing?.amount || 0).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Next Due: {profile?.billing?.dueDate ? new Date(profile.billing.dueDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <Button variant="ghost" className="mt-6 w-full py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all border border-slate-100">
              View Invoice History
            </Button>
          </div>
        </section>

        {/* ── CENTER/RIGHT COLUMNS: ANALYTICS ── */}
        <section className="col-span-12 lg:col-span-9 space-y-10">
          
          <div className="grid grid-cols-12 gap-8">
            {/* Overall Attendance Circular Chart */}
            <div className="col-span-12 md:col-span-5 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 self-start">Overall Attendance</h4>
              <div className="relative flex items-center justify-center">
                <svg className="w-56 h-56 -rotate-90">
                  <circle className="text-slate-50" cx="112" cy="112" fill="transparent" r="80" stroke="currentColor" strokeWidth="16" />
                  <circle 
                    className="text-orange-500 transition-all duration-1000 ease-out" 
                    cx="112" cy="112" fill="transparent" r="80" 
                    stroke="currentColor" strokeDasharray="502.6" strokeDashoffset={dashOffset} 
                    strokeLinecap="round" strokeWidth="16" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{overallAttendance}%</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] mt-2 px-3 py-1 rounded-full",
                    overallAttendance >= 75 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  )}>
                    {overallAttendance >= 75 ? 'Excellent' : 'Low Attendance'}
                  </span>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-10 w-full pt-8 border-t border-slate-50">
                <div className="text-center group/sub">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover/sub:text-emerald-500 transition-colors">Academic Days</p>
                  <p className="text-2xl font-black text-slate-900">114</p>
                </div>
                <div className="text-center group/sub">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover/sub:text-rose-500 transition-colors">Absences</p>
                  <p className="text-2xl font-black text-slate-900">10</p>
                </div>
              </div>
            </div>

            {/* Subject-wise Analytics */}
            <div className="col-span-12 md:col-span-7 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 group hover:shadow-2xl transition-all duration-500">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Curriculum Tracking</h4>
                </div>
              </div>
              <div className="space-y-8">
                {profile?.attendance && Object.entries(profile.attendance).map(([subject, pct]) => (
                  <div key={subject} className="group/progress">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight group-hover/progress:text-orange-600 transition-colors uppercase">{subject}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Phase II Analytics</p>
                      </div>
                      <span className={cn(
                        "text-sm font-black transition-colors",
                        pct >= 75 ? "text-emerald-600" : "text-rose-600"
                      )}>{pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                          pct >= 75 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-rose-400 to-rose-600"
                        )} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                ))}
                {!profile?.attendance && (
                   <p className="text-slate-400 text-sm font-black text-center py-20 uppercase tracking-widest opacity-30 italic">No Curriculum Analytics Synchronized</p>
                )}
              </div>
            </div>
          </div>

          {/* ── ISSUE HISTORY LIST ── */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                  <History className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Grievance History</h4>
              </div>
              <div className="flex gap-4">
                <button className="p-3 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all"><Filter className="w-5 h-5" /></button>
                <button className="p-3 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-2xl transition-all"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="overflow-x-auto p-4 pt-4">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                    <th className="px-8 py-4 rounded-l-2xl">Issue ID</th>
                    <th className="px-8 py-4">Grievance Core</th>
                    <th className="px-8 py-4">Status Tracking</th>
                    <th className="px-8 py-4">Logged Date</th>
                    <th className="px-8 py-4 rounded-r-2xl"></th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  {tickets.slice(0, 5).map((t) => (
                    <tr key={t.id} className="group/row bg-white hover:bg-slate-50 transition-all cursor-pointer rounded-2xl">
                      <td className="px-8 py-6 text-sm font-black text-slate-900 rounded-l-2xl">#{t.id.slice(-6).toUpperCase()}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-slate-800 leading-tight">{t.title}</span>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{t.category}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full ring-4 shadow-sm",
                            t.status === 'resolved' || t.status === 'closed' ? "bg-emerald-500 ring-emerald-50" :
                            t.status === 'in_progress' ? "bg-blue-500 ring-blue-50" : "bg-orange-500 ring-orange-50 animate-pulse"
                          )} />
                          <span className={cn(
                            "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border",
                            t.status === 'resolved' || t.status === 'closed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                            t.status === 'in_progress' ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-orange-50 border-orange-100 text-orange-600"
                          )}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-right rounded-r-2xl">
                        <Button variant="ghost" className="text-orange-600 font-black text-[10px] uppercase tracking-widest p-0 h-auto hover:bg-transparent">
                          VIEW AUDIT →
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Ticket className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No previous grievances on record</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
