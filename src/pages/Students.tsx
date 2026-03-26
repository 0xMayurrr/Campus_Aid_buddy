import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllStudents } from '@/services/firestoreService';
import { StudentProfile } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, Search, GraduationCap, TrendingUp, Loader2, ShieldCheck, Mail } from 'lucide-react';

function AttendanceBadge({ pct }: { pct: number }) {
  const style = pct >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : pct >= 60 ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-rose-700 bg-rose-50 border-rose-100';
  return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-widest ${style}`}>{pct}%</span>;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllStudents().then(setStudents).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  const avgCgpa = students.length > 0
    ? (students.reduce((a, s) => a + (s.cgpa || 0), 0) / students.length).toFixed(2)
    : 0;

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-20 text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
         <Loader2 className="w-5 h-5 animate-spin mr-3 text-orange-500" /> Cataloging Student Directory...
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Undergraduate Registry</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              Global student data and academic tracking
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="font-bold text-slate-800">{students.length} verified enrollments</span>
            </p>
          </div>
        </div>

        {/* Global Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Registered Base', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Academic Index (Avg)', value: avgCgpa, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Target Attendance reached', value: students.filter((s) => {
                const avg = Object.values(s.attendance || {}).reduce((a, b) => a + (b as number), 0) / (Object.keys(s.attendance || {}).length || 1);
                return avg >= 75;
              }).length, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
               <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-bl-full opacity-30 -mr-8 -mt-8 group-hover:scale-110 transition-transform`} />
               <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4 transition-transform group-hover:rotate-6`}>
                 <s.icon className={`w-5 h-5 ${s.color}`} />
               </div>
               <div className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{s.value}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex bg-white p-3 rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-slate-400 group">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              placeholder="Query student by identification or full legal name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-bold text-slate-900 placeholder-slate-300 outline-none"
            />
          </div>
        </div>

        {/* Industrial Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profile</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial ID</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Department</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Batch</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CGPA Index</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Compliance</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fiscal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => {
                  const attVals = Object.values(s.attendance || {}) as number[];
                  const avgAtt = attVals.length > 0 ? Math.round(attVals.reduce((a, b) => a + b, 0) / attVals.length) : 0;
                  return (
                    <tr key={s.uid} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-slate-900 group-hover:text-white transition-all">
                            {s.name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 leading-none transition-colors group-hover:text-slate-900">{s.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center gap-1.5"><Mail className="w-2.5 h-2.5" />{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-xs font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{s.rollNo || 'UNASSIGNED'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-[11px] font-bold text-slate-600">{s.dept}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">Y{s.year}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-black text-slate-900">{s.cgpa?.toFixed(2) || '0.00' }</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {attVals.length > 0 ? <AttendanceBadge pct={avgAtt} /> : <span className="text-[9px] font-black text-slate-200 uppercase">NO DATA</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest ${
                          s.billing?.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          s.billing?.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {s.billing?.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <Users className="w-12 h-12 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">No Identity records matched your current Filter</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
