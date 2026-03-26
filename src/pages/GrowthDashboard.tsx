import React, { useEffect, useState } from 'react';
import { getGrowthData } from '@/services/firestoreService';
import { GrowthData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Users, Award, Building2, Calendar, BookOpen, TrendingUp, Loader2 } from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4'];
const PIE_COLORS = ['#10b981', '#3b82f6', '#f97316'];

function AnimatedStatCard({ label, value, icon: Icon, suffix = '', color, delay = 0 }: {
  label: string; value: number | string; icon: any; suffix?: string; color: string; delay?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const numVal = typeof value === 'number' ? value : parseFloat(String(value));

  useEffect(() => {
    if (isNaN(numVal)) return;
    let start = 0;
    const step = numVal / 60;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        start += step;
        if (start >= numVal) {
          setDisplayed(numVal);
          clearInterval(interval);
        } else {
          setDisplayed(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [numVal, delay]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
        {isNaN(numVal) ? value : displayed.toLocaleString()}{suffix}
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl">
        <p className="text-xs font-black text-slate-900 mb-2 uppercase tracking-widest border-b border-slate-100 pb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <p className="text-[11px] font-bold text-slate-600">
                {p.name}: <span className="text-slate-900">{p.value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function GrowthDashboard() {
  const { user } = useAuth();
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGrowthData().then(setGrowth).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
         <Loader2 className="w-5 h-5 animate-spin mr-3 text-orange-500" /> Aggregating Analytical Insights...
      </div>
    );
  }

  if (!growth) return null;

  const deptData = user?.role === 'hod' && user.dept
    ? growth.deptWiseData.filter((d) => d.dept === user.dept)
    : growth.deptWiseData;

  const stats = user?.role === 'hod' && user.dept
    ? (() => {
        const dept = growth.deptWiseData.find((d) => d.dept === user.dept);
        return {
          totalStudents: dept?.students || 0,
          placedStudents: dept?.placed || 0,
          companies: growth.companies,
          events: growth.events,
          facultyCount: Math.round(growth.facultyCount / 6),
          avgCgpa: growth.avgCgpa,
        };
      })()
    : growth;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Campus Integrity Ledger</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Verification of placement velocity and academic indices
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="font-bold text-slate-800">FY 2024-25 Report</span>
          </p>
        </div>
      </div>

      {/* Industrial Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <AnimatedStatCard label="Total Enrollment" value={stats.totalStudents} icon={Users} color="bg-blue-600" delay={0} />
        <AnimatedStatCard label="Placement Yield" value={stats.placedStudents} icon={Award} color="bg-emerald-600" delay={100} />
        <AnimatedStatCard label="Enterprise Partners" value={stats.companies} icon={Building2} color="bg-slate-900" delay={200} />
        <AnimatedStatCard label="Event Frequency" value={stats.events} icon={Calendar} color="bg-violet-600" delay={300} />
        <AnimatedStatCard label="Academic Faculty" value={stats.facultyCount} icon={BookOpen} color="bg-cyan-600" delay={400} />
        <AnimatedStatCard label="Global Avg CGPA" value={stats.avgCgpa} suffix="" icon={TrendingUp} color="bg-orange-600" delay={500} />
      </div>

      {/* Analytical Visuals Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Departmental Flux</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Comparative Analysis of Intake vs Placement</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              <Bar dataKey="students" name="Aggregate Intake" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="placed" name="Placement Success" fill="#f97316" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Growth Vector</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Temporal Trends in Placement Probability</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growth.yearWisePlacement} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="percentage"
                name="Yield Percentage"
                stroke="#1e293b"
                strokeWidth={4}
                dot={{ fill: '#f97316', r: 6, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Outcome Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-10 text-center">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Structural Outcomes</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Final Status Breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={growth.outcomeData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {growth.outcomeData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
             {growth.outcomeData.map((d, i) => (
               <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Strategic Alliances</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Primary Corporate Acquisitions</p>
            </div>
            <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">Verified Directory</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {growth.topCompanies.slice(0, 8).map((c, i) => (
              <div key={c.name}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-500/20 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shadow-inner transition-transform group-hover:scale-110"
                  style={{ backgroundColor: COLORS[i % COLORS.length] + '15', color: COLORS[i % COLORS.length] }}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">{c.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.hired} Personnel · <span className="text-emerald-600">{c.package}</span></p>
                </div>
                <TrendingUp className="w-4 h-4 text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
