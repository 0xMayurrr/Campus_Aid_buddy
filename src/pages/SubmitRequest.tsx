import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { TicketCategory, TicketPriority } from '@/types';
import { useNavigate } from 'react-router-dom';
import { 
  Send, MapPin, AlertTriangle, Loader2, Info, CheckCircle, 
  Phone, Globe, Shield, Activity, Clock, MessageSquare,
  Sparkles, Zap, Users, GraduationCap, Building2, HelpCircle, Navigation, X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';

const CATEGORIES: { value: TicketCategory; label: string; icon: any }[] = [
  { value: 'academic', label: 'Academic Inquiry', icon: GraduationCap },
  { value: 'facility', label: 'Infrastructure / Facility', icon: Building2 },
  { value: 'complaint', label: 'Official Complaint', icon: AlertTriangle },
  { value: 'service_request', label: 'Service Provisioning', icon: Zap },
  { value: 'hostel', label: 'Residential / Hostel', icon: Users },
  { value: 'transport', label: 'Logistics / Transport', icon: Globe },
  { value: 'other', label: 'Unspecified Category', icon: HelpCircle },
];

const PRIORITIES: { value: TicketPriority; label: string; activeColor: string; bg: string; dot: string }[] = [
  { value: 'low', label: 'Routine', activeColor: 'text-slate-600 border-slate-200 bg-slate-50', bg: 'bg-slate-50', dot: 'bg-slate-300' },
  { value: 'medium', label: 'Standard', activeColor: 'text-blue-600 border-blue-200 bg-blue-50', bg: 'bg-blue-50', dot: 'bg-blue-400' },
  { value: 'high', label: 'Critical', activeColor: 'text-orange-600 border-orange-200 bg-orange-50', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  { value: 'urgent', label: 'Emergency', activeColor: 'text-rose-600 border-rose-300 bg-rose-50 font-black', bg: 'bg-rose-50', dot: 'bg-rose-600' },
];

const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'Library', 'Administration', 'Hostel', 'Other'];

export default function SubmitRequest() {
  const { user } = useAuth();
  const { createTicket, isLoading } = useTickets();
  const navigate = useNavigate();
  const { getLocation, isLoading: geoLoading, location: geoLocation, clearLocation } = useGeolocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('academic');
  const [dept, setDept] = useState(user?.dept || 'CSE');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createTicket({ title, description, category, dept, priority, location: location || undefined });
      navigate('/tickets');
      toast.success('Incident successfully reported to governance.');
    } catch { } 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* ── HEADER (REFINED) ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 shadow-sm relative overflow-hidden group">
         <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Security Protocol Active</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">
                 Raise a Support <span className="text-orange-500 underline decoration-[#74aa95]/30">Request.</span>
               </h1>
               <p className="text-slate-500 font-bold text-base md:text-lg max-w-xl leading-relaxed">
                 Your issue will be auto-routed to the right department for immediate resolution.
               </p>
            </div>

            <div className="hidden xl:flex items-center gap-4 p-6 bg-rose-50 border border-rose-100 rounded-xl">
               <div className="w-12 h-12 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-lg">
                  <Phone className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Emergency Protocol</p>
                  <h4 className="text-lg font-black text-rose-950 leading-none tracking-tight">(555) 0199</h4>
                  <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tight mt-1 truncate">Campus Security Dispatch</p>
               </div>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── MAIN FORM CONSOLE ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Core Details Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm group hover:border-slate-300 transition-all duration-300">
               <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
                  <div className="w-9 h-9 rounded bg-slate-50 flex items-center justify-center text-slate-950 border border-slate-100">
                     <MessageSquare className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-slate-950 tracking-tight">Issue Definition</h2>
               </div>

               <div className="space-y-6">
                  <div className="relative group/field">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Incident Headline *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Briefly summarize the situation..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-slate-950 placeholder-slate-300 text-sm font-black focus:bg-white focus:border-slate-950 transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Classification</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-slate-950 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:bg-white focus:border-slate-950 transition-all"
                      >
                        {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Routing Department</label>
                      <select
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-slate-950 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:bg-white focus:border-slate-950 transition-all"
                      >
                        {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="relative group/field">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Technical Chronology *</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Include temporal context, immediate impact, and any attempted resolutions..."
                      rows={6}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-6 py-5 text-slate-950 placeholder-slate-300 text-sm font-bold focus:bg-white focus:border-slate-950 shadow-inner transition-all outline-none resize-none"
                    />
                    <div className="flex justify-between mt-3 px-1">
                       <div className="flex items-center gap-1.5 opacity-60">
                          <Info className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Formal documentation required</span>
                       </div>
                       <span className="text-[9px] font-black text-slate-400 tracking-widest">{description.length}/500</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Context Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-8">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-9 h-9 rounded bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                        <Activity className="w-5 h-5" />
                     </div>
                     <h2 className="text-lg font-black text-slate-950 tracking-tight">Environmental Context</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PRIORITIES.map((p) => {
                      const isSel = priority === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={cn(
                            "flex flex-col items-center justify-center py-5 px-4 rounded-lg border transition-all",
                            isSel 
                              ? "bg-slate-950 border-slate-950 text-white shadow-lg"
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-950"
                          )}
                        >
                          <div className={cn("w-2 h-2 rounded-full mb-3", isSel ? "bg-orange-500" : p.dot)} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Spatial Identifier (Location)</label>
                 <div className="relative">
                   <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   <input
                     type="text"
                     value={location}
                     onChange={(e) => setLocation(e.target.value)}
                     placeholder="e.g. Block C, Secondary Server Room"
                     className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-950 placeholder-slate-300 text-sm font-black focus:bg-white focus:border-slate-950 transition-all outline-none"
                   />
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                     {location && (
                       <button
                         type="button"
                         onClick={() => { setLocation(''); clearLocation(); }}
                         className="p-2 text-slate-300 hover:text-slate-950 transition-colors"
                       >
                         <X className="w-3.5 h-3.5" />
                       </button>
                     )}
                     <button
                       type="button"
                       onClick={async () => {
                         const loc = await getLocation();
                         if (loc) {
                           setLocation(loc.address);
                           toast.success(`📍 Location captured: ${loc.campusZone}`);
                         } else {
                           toast.error('Could not get location. Please allow browser access.');
                         }
                       }}
                       disabled={geoLoading}
                       className={cn(
                         'flex items-center gap-1.5 px-3 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all',
                         geoLocation
                           ? 'bg-emerald-500 text-white'
                           : 'bg-slate-900 text-white hover:bg-orange-500'
                       )}
                     >
                       {geoLoading
                         ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                         : <Navigation className="w-3.5 h-3.5" />
                       }
                       {geoLoading ? 'Locating...' : geoLocation ? 'Located' : 'Detect'}
                     </button>
                   </div>
                 </div>
                 {geoLocation && (
                   <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                     <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                     <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{geoLocation.campusZone}</span>
                     <span className="text-[10px] text-emerald-500 font-bold ml-auto">±{Math.round(geoLocation.accuracy)}m accuracy</span>
                   </div>
                 )}
               </div>
            </div>

            {/* Submission Button */}
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !description.trim()}
              className="w-full py-8 rounded-xl bg-slate-900 text-white hover:bg-black font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Indexing Incident...</>
              ) : (
                <><Send className="w-5 h-5" /> Transmit Protocol</>
              )}
            </Button>
           </form>
        </div>

        {/* ── SIDEBAR CONTEXT (REFINED) ── */}
        <div className="lg:col-span-4 space-y-6">
           
           <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-950 mb-8 pb-4 border-b border-slate-50 uppercase tracking-widest flex items-center gap-3">
                 <Globe className="w-5 h-5 text-[#74aa95]" />
                 Routing Guide
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Academic Issues', desc: 'Faculty Office', icon: GraduationCap, color: 'text-blue-500' },
                   { label: 'Facilities', desc: 'Maintenance Hub', icon: Building2, color: 'text-orange-500' },
                   { label: 'Safety Protocols', desc: 'Security Dispatch', icon: Shield, color: 'text-rose-500' },
                 ].map((route, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                         <route.icon className={cn("w-5 h-5", route.color)} />
                      </div>
                      <div>
                         <h4 className="text-[11px] font-black text-slate-950 leading-tight uppercase tracking-tight">{route.label}</h4>
                         <p className="text-[10px] font-bold text-slate-400 mt-0.5">{route.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-sm font-black mb-10 border-b border-white/5 pb-4 uppercase tracking-widest flex items-center gap-3">
                 <Sparkles className="w-5 h-5 text-orange-500" />
                 Reporting Tips
              </h3>
              <div className="space-y-6">
                 {[
                   { title: 'Be Specific', desc: 'IDs and timestamps are crucial.' },
                   { title: 'Impact Assessment', desc: 'How does this affect learning?' },
                   { title: 'Visual Evidence', desc: 'Uploads enabled after transmit.' },
                 ].map((tip, i) => (
                   <div key={i} className="flex gap-4">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                         <h4 className="text-[11px] font-black uppercase tracking-widest leading-none mb-1.5">{tip.title}</h4>
                         <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{tip.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-950 mb-8 border-b border-slate-50 pb-4 uppercase tracking-widest">Recent Activity</h3>
              <div className="space-y-4">
                 {[
                   { title: 'Leaking faucet in Lab 4', time: '2 hours ago' },
                   { title: 'Lost ID Card Replacement', time: 'Yesterday' },
                   { title: 'WiFi Outage North Wing', time: '3 days ago' },
                 ].map((act, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-slate-50 last:border-0 pb-3">
                      <div>
                         <h4 className="text-[11px] font-black text-slate-800 group-hover:text-orange-600 transition-colors truncate max-w-[150px]">{act.title}</h4>
                         <p className="text-[9px] font-black text-slate-300 uppercase mt-1">{act.time}</p>
                      </div>
                      <Clock className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-950" />
                   </div>
                 ))}
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
