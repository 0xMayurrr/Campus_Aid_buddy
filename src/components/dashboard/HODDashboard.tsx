import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { getStudentsByDept, getGrowthData, getAnnouncements } from '@/services/firestoreService';
import { StudentProfile, GrowthData, Announcement } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, Ticket, Award, AlertCircle, BarChart3,
  ChevronRight, Loader2, GraduationCap, CheckCircle, PieChart,
  ShieldAlert, Activity, ArrowUpRight, Zap, Target, History, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HODDashboard() {
  const { user } = useAuth();
  const { tickets, fetchTickets } = useTickets();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const MOCK_STUDENTS: StudentProfile[] = [
    { uid: 'h1', name: 'Julian Thorne', rollNo: 'SVCE-22-001', dept: user?.dept || 'CSE', year: 2, cgpa: 8.9, semester: 4, attendance: { 'DSA': 92, 'DBMS': 88, 'OS': 94 }, billing: { status: 'paid', amount: 45000, dueDate: '2024-05-10' }, email: 'j@s.com' },
    { uid: 'h2', name: 'Alara Vane', rollNo: 'SVCE-22-042', dept: user?.dept || 'CSE', year: 2, cgpa: 7.6, semester: 4, attendance: { 'DSA': 74, 'DBMS': 81, 'OS': 79 }, billing: { status: 'pending', amount: 45000, dueDate: '2024-04-30' }, email: 'a@s.com' },
  ];

  const MOCK_GROWTH: GrowthData = {
    totalStudents: 1200, placedStudents: 850, companies: 45, events: 12, facultyCount: 85, avgCgpa: 8.2,
    deptWiseData: [{ dept: user?.dept || 'CSE', students: 120, placed: 102 }],
    yearWisePlacement: [{ year: '2023', percentage: 88 }], outcomeData: [], topCompanies: []
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [_, deptStudents, growthData] = await Promise.all([
          fetchTickets(),
          user.dept ? getStudentsByDept(user.dept).then(s => s.length > 0 ? s : MOCK_STUDENTS) : Promise.resolve(MOCK_STUDENTS),
          getGrowthData().then(g => g || MOCK_GROWTH),
          getAnnouncements('faculty').then(setAnnouncements),
        ]);
        if (deptStudents) setStudents(deptStudents);
        if (growthData) setGrowth(growthData);
      } catch (err) {
        console.error('HOD Dashboard load error:', err);
        setStudents(MOCK_STUDENTS);
        setGrowth(MOCK_GROWTH);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, fetchTickets]);

  const escalated = tickets.filter((t) => t.priority === 'urgent' || t.priority === 'high');
  
  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((acc, s) => {
        const vals = Object.values(s.attendance || {});
        return acc + (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);
      }, 0) / students.length)
    : 0;

  const avgCgpa = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length).toFixed(1)
    : "0.0";

  const deptGrowth = growth?.deptWiseData?.find((d) => d.dept === user?.dept);
  const placementPct = deptGrowth ? Math.round((deptGrowth.placed / deptGrowth.students) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* ── HOD HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-violet-100 flex items-center justify-center border-2 border-white shadow-xl shadow-violet-500/10">
            <GraduationCap className="w-8 h-8 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Departmental Intelligence</h1>
            <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
              HOD Governance Terminal
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              Dept: <span className="text-violet-600 font-black">{user?.dept}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate('/growth')}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-violet-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Growth Analytics
          </Button>
        </div>
      </div>

      {/* ── ANALYTIC CARDS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrollment', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', note: 'Registered Students' },
          { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+2.4%', up: true },
          { label: 'Avg Academic Score', value: avgCgpa, icon: Target, color: 'text-violet-600', bg: 'bg-violet-50', note: 'Department Average' },
          { label: 'Placement Success', value: `${placementPct}%`, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Target: 85%', up: false },
        ].map((s, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col justify-between group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", s.bg)}>
                <s.icon className={cn("w-7 h-7", s.color)} />
              </div>
              {s.trend && (
                <span className={cn("text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tight", s.up ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400")}>
                  {s.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{s.label}</p>
              <h3 className="text-3xl font-black text-slate-900 leading-none mb-3">{s.value}</h3>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{s.note || ''}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── GOVERNANCE GRID ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Ticket Lifecycle Panel */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Ticket className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Ticket Lifecycle</h2>
            </div>
            <Link to="/tickets" className="text-xs font-black text-slate-400 hover:text-orange-600 uppercase tracking-widest">Full Audit Log</Link>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {[
                { label: 'New Requests', count: tickets.filter((t) => t.status === 'submitted').length, color: 'bg-amber-500' },
                { label: 'Under Review', count: tickets.filter((t) => t.status === 'in_progress').length, color: 'bg-blue-500' },
                { label: 'Successfully Resolved', count: tickets.filter((t) => t.status === 'resolved').length, color: 'bg-emerald-500' },
                { label: 'Finalized & Closed', count: tickets.filter((t) => t.status === 'closed').length, color: 'bg-slate-500' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={cn("w-3 h-3 rounded-full shrink-0", s.color)} />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest flex-1">{s.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">{s.count}</span>
                    <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <div className={cn("h-full rounded-full", s.color)} style={{ width: `${tickets.length > 0 ? (s.count / tickets.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Resolution Rate</p>
                <h4 className="text-2xl font-black text-slate-900">
                  {tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length / tickets.length) * 100) : 100}%
                </h4>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center">
                 <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Critical Escalations Monitor */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 text-animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Escalation Monitor</h2>
            </div>
            <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-rose-500/20">
              {escalated.length} Urgent Issues
            </span>
          </div>
          
          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[500px] hide-scrollbar">
            {escalated.length > 0 ? (
              escalated.map((t) => (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-slate-50 hover:border-rose-100 hover:shadow-xl hover:shadow-rose-500/5 transition-all group/card cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg uppercase tracking-widest border border-rose-100 shadow-sm">
                      {t.priority}
                    </span>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mb-2 leading-tight">{t.title}</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-black text-[9px] text-slate-500">
                      {t.raisedByName.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAISED BY {t.raisedByName}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Operational Calm</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1">No department escalations requiring HOD intervention.</p>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-50">
             <Button 
               onClick={() => navigate('/tickets')}
               className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl"
             >
               ENTER GOVERNANCE MODE
             </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
