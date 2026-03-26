import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserRole } from '@/types';
import { 
  GraduationCap, School, ShieldCheck, Shield, ArrowRight,
  Eye, EyeOff, Loader2, Sparkles, Bot, Users, CheckCircle2,
  Lock, Mail, User as UserIcon, Building2, LayoutDashboard,
  Activity, Zap, Globe, MousePointer2, BriefcaseIcon, Terminal
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLES: { value: UserRole; label: string; icon: any; desc: string; color: string; border: string }[] = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Academy Access', color: 'bg-orange-500/10 text-orange-600', border: 'border-orange-500/20' },
  { value: 'faculty', label: 'Faculty', icon: School, desc: 'Console Control', color: 'bg-[#74aa95]/10 text-[#74aa95]', border: 'border-[#74aa95]/20' },
  { value: 'hod', label: 'HOD', icon: ShieldCheck, desc: 'Governance Hub', color: 'bg-blue-500/10 text-blue-600', border: 'border-blue-500/20' },
  { value: 'admin', label: 'Admin', icon: Shield, desc: 'Central Core', color: 'bg-slate-950/10 text-slate-950', border: 'border-slate-950/20' },
];

const DEPTS = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Business', 'Arts'];

export default function Auth() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [dept, setDept] = useState(DEPTS[0]);
  const [year, setYear] = useState('1');
  const [rollNo, setRollNo] = useState('');

  const { login, signup } = useAuth();

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      if (!email || !password) return toast.error('Required fields missing');
      setLoading(true);
      try {
        await login(email, password);
        // navigation handled by AppRoutes once auth state updates
      } catch { }
      finally { setLoading(false); }
    } else {
      if (!email || !password || !name || !rollNo) return toast.error('Full profile required');
      setLoading(true);
      try {
        await signup({ email, password, name, role, dept, year: parseInt(year), rollNo });
        // navigation handled by AppRoutes once auth state updates
      } catch { }
      finally { setLoading(false); }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-950 font-sans antialiased overflow-hidden">
      <main className="flex-grow flex flex-col lg:flex-row min-h-screen">
        
        {/* ── CENTRAL IDENTITY PANEL ── */}
        <section className="w-full lg:w-[50%] flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 relative z-20 bg-white">
          <div className="max-w-md w-full animate-in fade-in slide-in-from-left-4 duration-700">
            
            {/* Minimalist Branding */}
            <div className="mb-12 flex items-center gap-4 group">
               <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center shadow-lg shadow-black/10">
                  <img src="/Campus_Aid_Buddyy_Logo_with_Open_Hand_Icon-removebg-preview.png" alt="CAB" className="h-7 w-auto" />
               </div>
               <div>
                  <h1 className="text-xl font-black tracking-tight leading-none text-slate-950 uppercase">Campus Aid <span className="text-slate-300 ml-1">v4</span></h1>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1 opacity-80 decoration-orange-500/20">University Identity Console</p>
               </div>
            </div>

            {/* Headers */}
            <div className="space-y-4 mb-10">
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] text-slate-950">
                {tab === 'signup' ? 'Start your Journey.' : 'Console Login.'}
              </h1>
              <p className="text-slate-500 font-bold text-base leading-relaxed max-w-sm">
                {tab === 'signup' 
                  ? 'Access over 15k+ artifacts and real-time AI context.'
                  : 'Enter your credentials to synchronize with the campus mesh.'}
              </p>
            </div>

            {/* Modern Switcher (Pill Style) */}
            <div className="inline-flex gap-1 p-1 bg-slate-100 rounded-lg mb-10 border border-slate-200/50">
              <button 
                onClick={() => setTab('login')}
                className={cn(
                  "px-8 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  tab === 'login' ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Sign In
              </button>
              <button 
                onClick={() => setTab('signup')}
                className={cn(
                  "px-8 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  tab === 'signup' ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-5">
              <div className="space-y-3">
                {tab === 'signup' && (
                  <div className="relative">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Full Academic Name" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="h-14 pl-12 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 transition-all font-bold text-sm text-slate-950 placeholder:text-slate-300"
                    />
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="Institutional Email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="h-14 pl-12 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 transition-all font-bold text-sm text-slate-950 placeholder:text-slate-300"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type={showPwd ? 'text' : 'password'} 
                    placeholder="Security Signature" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="h-14 pl-12 pr-12 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 transition-all font-bold text-sm text-slate-950 placeholder:text-slate-300"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-950 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {tab === 'signup' && (
                  <div className="space-y-4 pt-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Protocol</p>
                    <div className="grid grid-cols-2 gap-3">
                      {ROLES.map((r) => {
                        const Icon = r.icon;
                        const isSel = role === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setRole(r.value)}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-lg border transition-all text-left",
                              isSel ? "bg-slate-950 border-slate-950 text-white shadow-lg" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                            )}
                          >
                             <div className={cn("w-8 h-8 rounded flex items-center justify-center shrink-0", isSel ? "bg-white/10 text-white" : "bg-white text-slate-400 border border-slate-100")}>
                                <Icon className="w-4 h-4" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                       <div className="relative">
                          <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 z-10" />
                          <Select value={dept} onValueChange={setDept}>
                            <SelectTrigger className="h-14 pl-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-xs uppercase tracking-widest focus:bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-lg border-slate-200 font-bold shadow-xl">
                              {DEPTS.map(d => <SelectItem key={d} value={d} className="font-bold py-2 text-xs">{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="relative">
                          <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <Input 
                            value={rollNo} 
                            onChange={e => setRollNo(e.target.value)} 
                            placeholder={role === 'student' ? "Roll ID" : "Fac Code"}
                            className="h-14 pl-12 rounded-lg bg-slate-50 border border-slate-200 font-bold text-sm text-slate-950 placeholder:text-slate-300"
                          />
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-16 bg-slate-950 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 mt-6 rounded-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : (
                  <>
                     {tab === 'login' ? 'Mount Console' : 'Initialize Profile'}
                     <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-12 flex items-center justify-between font-black text-[9px] text-slate-300 uppercase tracking-widest opacity-80 border-t border-slate-50 pt-8">
               <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  <span>ENC-CHANNEL-SVCE-01</span>
               </div>
               <span>v4.0.2 STABLE</span>
            </div>
          </div>
        </section>

        {/* ── VISUAL DASHBOARD PREVIEW ── */}
        <section className="hidden lg:flex flex-grow bg-slate-50 items-center justify-center p-20 relative overflow-hidden">
           {/* Sophisticated Gradients */}
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white rounded-full blur-[120px] -mr-96 -mt-96 opacity-60" />
           
           <div className="relative z-10 w-full max-w-2xl">
              
              <div className="bg-white rounded-xl p-12 shadow-2xl border border-slate-200 relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 text-orange-600 mb-8 px-3 py-1 bg-orange-50 border border-orange-100 rounded w-fit">
                       <Zap className="w-3.5 h-3.5 fill-current" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Enterprise Protocol Ready</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none mb-6">
                      Pure Efficiency. <br/> 
                      <span className="text-[#74aa95]">Sophisticated Flow.</span>
                    </h2>

                    <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-md mb-10">
                      Synchronize with the university mesh. High-fidelity analytics, 15k+ artifacts, and persistent AI context.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                       {[
                         { title: 'Data Nodes', icon: Globe, value: 'Integrated', color: 'text-orange-500', bg: 'bg-orange-50' },
                         { title: 'Security', icon: Shield, value: 'Encrypted', color: 'text-[#74aa95]', bg: 'bg-[#74aa95]/5' },
                       ].map((card, i) => (
                         <div key={i} className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:border-slate-950 hover:shadow-xl transition-all cursor-pointer">
                            <div className={cn("w-10 h-10 rounded flex items-center justify-center mb-4 border border-transparent", card.bg)}>
                               <card.icon className={cn("w-5 h-5", card.color)} />
                            </div>
                            <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{card.title}</h4>
                            <p className="text-lg font-black text-slate-950 tracking-tight">{card.value}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Minimal Logo watermark */}
                 <Bot className="absolute -right-16 -bottom-16 w-60 h-60 text-slate-50 opacity-20 group-hover:rotate-6 transition-all duration-1000 ease-out" />
              </div>

              {/* Status Indicator */}
              <div className="absolute -bottom-10 -right-5 bg-slate-950 p-4 rounded-lg shadow-2xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-1000 delay-500">
                 <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-white">
                    <Activity className="w-5 h-5 text-orange-500" />
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Load</p>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Optimal Efficiency</p>
                 </div>
              </div>
           </div>
        </section>

      </main>
    </div>
  );
}