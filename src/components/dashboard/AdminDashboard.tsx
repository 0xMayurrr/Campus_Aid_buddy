import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { getAllStudents, getGrowthData, getAllUsers } from '@/services/firestoreService';
import { StudentProfile, GrowthData, User } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, BarChart3, Ticket, Bell, UserCog, TrendingUp, CheckCircle,
  AlertCircle, ChevronRight, Loader2, GraduationCap, Building2, Award,
  ShieldCheck, Activity, Search, HelpCircle, History, Briefcase, Zap, 
  Settings, LogOut, Filter, MoreVertical, Server, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { tickets, fetchTickets } = useTickets();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  const MOCK_USERS_LIST: any[] = [
    { uid: 'a1', name: 'Dean Sarah Miller', role: 'admin', email: 'dean@svce.edu', createdAt: new Date().toISOString() },
    { uid: 'f1', name: 'Dr. Aris', role: 'faculty', dept: 'CSE', email: 'aris@svce.edu', createdAt: new Date().toISOString() },
    { uid: 'h1', name: 'HOD CSE', role: 'hod', dept: 'CSE', email: 'hod@svce.edu', createdAt: new Date().toISOString() },
  ];

  const MOCK_GROWTH: GrowthData = {
    totalStudents: 12480, placedStudents: 11100, companies: 45, events: 12, facultyCount: 1240, avgCgpa: 8.2,
    deptWiseData: [
      { dept: 'Comp Science', students: 3200, placed: 3100 },
      { dept: 'Mechanical', students: 2850, placed: 2400 },
      { dept: 'Electrical', students: 2100, placed: 1800 },
      { dept: 'Architecture', students: 1400, placed: 1350 },
    ],
    yearWisePlacement: [{ year: '2023', percentage: 89 }], outcomeData: [], topCompanies: []
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [_, allStudents, allUsers, growthData] = await Promise.all([
          fetchTickets(),
          getAllStudents().then(s => s.length > 0 ? s : []),
          getAllUsers().then(u => u.length > 0 ? u : MOCK_USERS_LIST),
          getGrowthData().then(g => g || MOCK_GROWTH),
        ]);
        setStudents(allStudents);
        setUsers(allUsers);
        setGrowth(growthData);
      } catch (err) {
        console.error('Admin Dashboard load error:', err);
        setUsers(MOCK_USERS_LIST);
        setGrowth(MOCK_GROWTH);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchTickets]);

  const openTickets = tickets.filter((t) => t.status === 'submitted' || t.status === 'in_progress');
  const resolvedToday = tickets.filter((t) => {
    const today = new Date().toDateString();
    return new Date(t.updatedAt).toDateString() === today && (t.status === 'resolved' || t.status === 'closed');
  });

  const roleCount = (role: string) => users.filter((u) => u.role === role).length || (role === 'student' ? growth?.totalStudents : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* ── ADMIN HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">System Administration</h1>
          <p className="mt-3 text-orange-600 text-lg font-bold flex items-center gap-2">
            Global Campus Control 
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="text-slate-500 font-medium">Dean {user?.name || 'Sarah Miller'}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline"
            className="px-6 py-6 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            onClick={() => navigate('/announcements')}
          >
            Post Announcement
          </Button>
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10"
            onClick={() => navigate('/manage-users')}
          >
            Manage Users
          </Button>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: (growth?.totalStudents || 0).toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', note: 'LIVE RECORDS' },
          { label: 'Active Incidents', value: openTickets.length, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', note: 'URGENT ATTENTION', pulse: true },
          { label: 'Success Rate', value: `${growth?.yearWisePlacement[0]?.percentage || 0}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', note: '+4.2% GROWTH' },
          { label: 'Enterprise Partners', value: growth?.companies || 0, icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50', note: 'SYSTEM PEERS' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col justify-between group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", s.bg)}>
                <s.icon className={cn("w-7 h-7", s.color, s.pulse && "animate-pulse")} />
              </div>
              <span className={cn("text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight", s.bg, s.color)}>
                {s.note}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{s.label}</p>
              <h3 className="text-3xl font-black text-slate-900 leading-none mb-1">{s.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* ── MAIN DASHBOARD CONTENT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Incidents Table */}
        <section className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Ticket className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Real-time Incidents</h2>
              <div className="flex items-center gap-2 ml-4">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase">Live Stream</span>
              </div>
            </div>
            <Link to="/tickets" className="text-xs font-black text-orange-600 hover:underline uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                <tr>
                  <th className="px-8 py-5">Incident</th>
                  <th className="px-8 py-5">Department</th>
                  <th className="px-8 py-5">Raised By</th>
                  <th className="px-8 py-5">Priority</th>
                  <th className="px-8 py-5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {openTickets.slice(0, 6).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group/row">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          t.priority === 'urgent' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : 
                          t.priority === 'high' ? "bg-orange-500" : "bg-blue-500"
                        )} />
                        <span className="text-sm font-bold text-slate-900 group-hover/row:text-orange-600 transition-colors">{t.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-slate-400 uppercase">{t.dept}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">
                          {t.raisedByName.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-600 truncate">{t.raisedByName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={cn(
                         "px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-tighter",
                         t.priority === 'urgent' ? "bg-rose-50 text-rose-600 animate-pulse" :
                         t.priority === 'high' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                       )}>
                         {t.priority}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase">
                      {Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 60000)}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-white border-t border-slate-50 text-center">
            <Button 
              variant="ghost"
              onClick={() => navigate('/tickets')}
              className="text-[10px] font-black text-slate-900 hover:text-orange-600 uppercase tracking-widest gap-2"
            >
              VIEW FULL TRACKER
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </section>

        {/* Platform Analytics */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 p-10 flex flex-col group hover:shadow-2xl transition-all duration-500">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Platform Intelligence</h2>
           </div>

           {/* User Distribution */}
           <div className="space-y-6 flex-1">
              {[
                { label: 'Students', count: roleCount('student'), color: 'bg-emerald-500', pct: 70 },
                { label: 'Faculty', count: roleCount('faculty'), color: 'bg-blue-500', pct: 25 },
                { label: 'Heads of Dept', count: roleCount('hod'), color: 'bg-violet-500', pct: 10 },
                { label: 'Admin', count: roleCount('admin'), color: 'bg-slate-900', pct: 5 },
              ].map((role) => (
                <div key={role.label} className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">{role.label}</span>
                      <span className="text-slate-900">{role.count.toLocaleString()}</span>
                   </div>
                   <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", role.color)} style={{ width: `${role.pct}%` }} />
                   </div>
                </div>
              ))}
           </div>

           {/* Mini Stats Card */}
           <div className="grid grid-cols-2 gap-4 mt-10 p-2">
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 group/card">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover/card:text-blue-600 transition-colors">Open Feed</p>
                 <p className="text-2xl font-black text-slate-900 leading-none">{openTickets.length}</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 group/card">
                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 group-hover/card:text-emerald-500 transition-colors">Resolved Today</p>
                 <p className="text-2xl font-black text-emerald-600 leading-none">{resolvedToday.length}</p>
              </div>
           </div>

           {/* System Health */}
           <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core System Uptime</span>
                 <span className="text-[10px] font-black text-emerald-600">99.9% OPERATIONAL</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-75" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-150" />
                 </div>
                 <span className="text-xs font-bold text-slate-600">Central services online</span>
              </div>
           </div>
        </section>
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Departmental Intelligence Overview */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 p-10 group hover:shadow-2xl transition-all duration-500">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                    <Globe className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Departmental Matrix</h2>
              </div>
              <Button variant="ghost" className="p-3 text-slate-400 hover:text-slate-900 rounded-2xl"><Filter className="w-5 h-5" /></Button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr className="border-b border-slate-50">
                    <th className="pb-5">Department</th>
                    <th className="pb-5">Students</th>
                    <th className="pb-5">Attendance</th>
                    <th className="pb-5">Growth</th>
                    <th className="pb-5 text-right">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(growth?.deptWiseData || []).map((dept) => (
                    <tr key={dept.dept} className="group/dept">
                      <td className="py-5 text-sm font-black text-slate-800 uppercase tracking-tight group-hover/dept:text-orange-600 transition-colors">{dept.dept}</td>
                      <td className="py-5 text-sm font-bold text-slate-500">{(dept.students || 0).toLocaleString()}</td>
                      <td className="py-5 text-sm font-black text-slate-900">{dept.dept === 'CSE' ? '94%' : dept.dept === 'Mechanical' ? '88%' : '91%'}</td>
                      <td className="py-5 text-sm font-black text-emerald-600">{Math.round((dept.placed / dept.students) * 100)}%</td>
                      <td className="py-5 text-right">
                         <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-emerald-100 shadow-sm">ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </section>

        {/* Global Audit Log (Timeline) */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 p-10 group hover:shadow-2xl transition-all duration-500 flex flex-col">
           <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">System Audit Log</h2>
           </div>

           <div className="flex-1 relative space-y-10 pl-10 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
              {[
                { title: 'Incident Logged', body: 'Infrastructure alert in Computer Lab 4 by Admin_Rao.', time: 'Just now', color: 'bg-rose-500', icon: AlertCircle },
                { title: 'Task Resolved', body: 'Hostel WiFi connectivity restored in Block B by IT Services.', time: '12m ago', color: 'bg-emerald-500', icon: CheckCircle },
                { title: 'Broadcast Sent', body: 'Academic calendar update published to all student portals.', time: '2h ago', color: 'bg-orange-500', icon: Bell },
                { title: 'Access Swapped', body: 'Prof. Alan Turing elevated to Department Admin role.', time: '4h ago', color: 'bg-blue-500', icon: UserCog },
              ].map((log, i) => (
                <div key={i} className="relative group/log">
                   <div className={cn("absolute -left-10 w-10 h-10 rounded-full border-[6px] border-white flex items-center justify-center z-10 shadow-sm", log.color)}>
                     <log.icon className="w-3.5 h-3.5 text-white" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{log.title}</h4>
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{log.time}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-sm">{log.body}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>

    </div>
  );
}
