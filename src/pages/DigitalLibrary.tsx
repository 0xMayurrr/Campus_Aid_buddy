import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllLibraryItems, getLibraryByDeptYear, createLibraryItem, deleteLibraryItem, uploadFile, uploadToCloudinary,
} from '@/services/firestoreService';
import { LibraryItem } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Video, Upload, Bot, Search, Plus, X, Trash2,
  Loader2, BookOpen, User, PlayCircle, Library, Filter,
  BookMarked, Clock4, Info, ChevronDown, ArrowRight, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
const YEARS = [1, 2, 3, 4];

interface UploadForm {
  title: string;
  type: 'pdf' | 'video' | 'doc';
  dept: string;
  year: number;
  subject: string;
  topic: string;
  description: string;
  file: File | null;
  videoUrl: string;
  videoInputMode: 'file' | 'url';
}

export default function DigitalLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState(user?.dept || '');
  const [filterYear, setFilterYear] = useState<number | ''>(user?.year || '');
  const [filterType, setFilterType] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [useFreeMesh, setUseFreeMesh] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<UploadForm>({
    title: '', type: 'pdf', dept: user?.dept || 'CSE',
    year: user?.year || 1, subject: '', topic: '', description: '', file: null, videoUrl: '', videoInputMode: 'file',
  });

  const canUpload = user?.role === 'faculty' || user?.role === 'hod' || user?.role === 'admin';

  const MOCK_RESOURCES: LibraryItem[] = [
    {
      id: 'mock-1', displayId: '#SVCE-VID-101', title: 'Data Structures & Algorithms - Unit 1',
      type: 'video', dept: user?.dept || 'CSE', year: user?.year || 2, subject: 'DSA',
      topic: 'Binary Search Trees', uploadedBy: 'admin', uploadedByName: 'Dr. Aris',
      url: 'https://vimeo.com/76979871', createdAt: new Date().toISOString()
    },
    {
      id: 'mock-2', displayId: '#SVCE-PDF-304', title: 'Modern Operating Systems - Lecture Notes',
      type: 'pdf', dept: user?.dept || 'CSE', year: user?.year || 2, subject: 'OS',
      topic: 'Process Management', uploadedBy: 'admin', uploadedByName: 'Prof. Miller',
      url: 'https://p.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-3', displayId: '#SVCE-PDF-202', title: 'Cloud Computing Infrastructure',
      type: 'pdf', dept: user?.dept || 'IT', year: user?.year || 3, subject: 'Cloud',
      topic: 'AWS Fundamentals', uploadedBy: 'admin', uploadedByName: 'Dr. Lane',
      url: 'https://p.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      createdAt: new Date().toISOString()
    }
  ];

  const load = async () => {
    setLoading(true);
    try {
      let data: LibraryItem[] = [];
      if (user?.role === 'student' && user.dept && user.year) {
        data = await getLibraryByDeptYear(user.dept, user.year);
      } else {
        data = await getAllLibraryItems();
      }
      setItems(data.length > 0 ? data : (canUpload ? [] : MOCK_RESOURCES));
    } catch (err) {
      setItems(MOCK_RESOURCES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const filtered = items.filter((item) => {
    const s = search.toLowerCase();
    const matchSearch = !search || 
      item.title.toLowerCase().includes(s) ||
      item.subject?.toLowerCase().includes(s) ||
      item.displayId?.toLowerCase().includes(s);
    const matchDept = !filterDept || item.dept === filterDept;
    const matchYear = !filterYear || item.year === filterYear;
    const matchType = !filterType || item.type === filterType;
    return matchSearch && matchDept && matchYear && matchType;
  });

  const handleUpload = async () => {
    if (!form.title || !form.subject) {
      toast.error('Title and Subject are required');
      return;
    }
    if (!form.file && !form.videoUrl) {
      toast.error('Please select a file to upload');
      return;
    }
    if (form.type !== 'video' && !form.file) {
      toast.error('Please select a file to upload');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      let url = form.videoUrl;
      if (form.file) {
        const safeName = form.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `library/${user?.uid || 'anon'}/${Date.now()}_${safeName}`;
        if (useFreeMesh) {
          url = await uploadToCloudinary(form.file, setUploadProgress);
        } else {
          url = await uploadFile(form.file, path, setUploadProgress);
        }
      }
      await createLibraryItem({
        title: form.title, type: form.type, dept: form.dept, year: form.year,
        subject: form.subject, topic: form.topic, description: form.description,
        url, uploadedByName: user?.name || 'Faculty', uploadedBy: user?.uid || '',
      });
      toast.success(`✅ "${form.title}" published! Students in ${form.dept} Year ${form.year} can now see it.`);
      setShowUpload(false);
      setForm({ title: '', type: 'pdf', dept: user?.dept || 'CSE', year: user?.year || 1, subject: '', topic: '', description: '', file: null, videoUrl: '', videoInputMode: 'file' });
      load();
    } catch (err: any) {
      toast.error(`Publication failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await deleteLibraryItem(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 text-[#74aa95] animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Indexing University Repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* ── SOPHISTICATED HERO ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 shadow-sm relative overflow-hidden group">
         <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-50 border border-slate-200">
                  <Library className="w-4 h-4 text-[#74aa95]" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Repository Hub Active</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">
                 Academic <span className="text-[#74aa95] underline decoration-slate-200 underline-offset-8">Repository</span>
               </h1>
               <p className="text-slate-500 font-bold text-base md:text-lg max-w-xl leading-relaxed">
                 Access localized curriculum resources and verified study artifacts for your department.
               </p>
            </div>

            <div className="flex items-center gap-4">
               {canUpload && (
                 <Button 
                   onClick={() => setShowUpload(true)}
                   className="bg-slate-900 text-white hover:bg-black px-8 h-14 rounded-lg font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-black/10 flex gap-3 items-center"
                 >
                   <Plus className="w-5 h-5" />
                   Publish Artifact
                 </Button>
               )}
            </div>
         </div>
      </section>

      {/* ── SEARCH & FILTERS ── */}
      <div className="flex flex-col xl:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search artifacts by ID, subject or topic..."
            className="w-full bg-slate-50 border border-slate-100 rounded-lg py-4 pl-12 pr-5 text-sm font-bold focus:bg-white focus:border-slate-950 transition-all outline-none text-slate-900 placeholder:text-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative group w-full sm:w-auto min-w-[180px]">
             <select 
               className="h-12 bg-slate-50 border border-slate-100 rounded-lg px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest cursor-pointer outline-none focus:bg-white focus:border-slate-950 w-full appearance-none"
               value={filterDept}
               onChange={(e) => setFilterDept(e.target.value)}
             >
               <option value="">All Sectors</option>
               {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none" />
          </div>

          <div className="h-12 bg-slate-100 rounded-lg flex items-center p-1 w-full sm:w-auto">
            {['', 'video', 'pdf'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  "px-5 h-full rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                  filterType === t ? "bg-white text-slate-950 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {t === '' ? 'All' : t === 'video' ? 'Media' : 'Doc'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-slate-950 transition-all duration-300">
              
              <div className="relative aspect-video overflow-hidden bg-slate-50 border-b border-slate-100">
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                    <img 
                      src={`https://img.youtube.com/vi/${item.url.includes('v=') ? item.url.split('v=')[1]?.split('&')[0] : ''}/maxresdefault.jpg`}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format'; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <PlayCircle className="w-12 h-12 text-white/80 group-hover:scale-110 group-hover:text-orange-500 transition-all" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                     <FileText className="w-12 h-12 text-slate-200 group-hover:text-[#74aa95] transition-all" />
                  </div>
                )}
                
                <div className="absolute top-4 left-4">
                   <span className="px-2 py-0.5 bg-slate-900 text-[8px] font-black text-white uppercase tracking-widest rounded">
                     {item.dept}
                   </span>
                </div>

                {canUpload && (user.uid === item.uploadedBy || user.role === 'admin') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex gap-2 mb-4">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.displayId}</span>
                   <span className="text-[9px] font-black text-[#74aa95] uppercase tracking-widest">• {item.subject}</span>
                </div>

                <h3 className="text-lg font-black text-slate-950 mb-2 leading-tight line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-[11px] font-bold text-slate-500 line-clamp-1 mb-6 uppercase tracking-tight opacity-70">
                   {item.topic}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-400" />
                         </div>
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.uploadedByName}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => window.open(item.url, '_blank')}
                        className="bg-slate-900 hover:bg-black text-white rounded-lg font-black text-[9px] uppercase tracking-widest h-10 transition-all border border-slate-800"
                      >
                         Open
                      </Button>
                      <Button 
                        onClick={() => navigate('/campus-ai', { state: { libraryItem: item } })}
                        className="bg-slate-50 hover:bg-white text-slate-950 border border-slate-200 rounded-lg font-black text-[9px] uppercase tracking-widest h-10 flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                         <Bot className="w-3.5 h-3.5" />
                         Insights
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl py-40 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-100" />
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Index Empty</h3>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em]">Try broadening your departmental search protocol</p>
        </div>
      )}

      {/* ── UPLOAD MODAL (SOPHISTICATED) ── */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => !uploading && setShowUpload(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-950 tracking-tight leading-none mb-1.5">Publish Resource</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Formal Repository Upload</p>
              </div>
              <button onClick={() => setShowUpload(false)} className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Classification</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs font-black uppercase tracking-widest outline-none focus:bg-white focus:border-slate-950 transition-all appearance-none cursor-pointer" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any, file: null, videoUrl: '' })}>
                    <option value="pdf">PDF Artifact</option>
                    <option value="video">Interactive Video</option>
                    <option value="doc">General Doc</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Sector</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs font-black uppercase tracking-widest outline-none focus:bg-white focus:border-slate-950 transition-all appearance-none cursor-pointer" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Academic Year</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs font-black uppercase tracking-widest outline-none focus:bg-white focus:border-slate-950 transition-all appearance-none cursor-pointer" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
                    {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Subject Core *</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs font-black uppercase tracking-widest outline-none focus:bg-white focus:border-slate-950 transition-all" placeholder="e.g. DSAX-01" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resource Title *</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm font-bold outline-none focus:bg-white focus:border-slate-950 transition-all" placeholder="e.g. Unit 3 - Memory Management" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Upload File</label>
                <div
                  onClick={() => form.type === 'video' ? videoFileRef.current?.click() : fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-100 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <Upload className="w-6 h-6 text-slate-300" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    {form.file ? form.file.name : 'Click to select file'}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">
                    {form.type === 'video' ? 'MP4, MOV, WEBM — Max 100MB' : 'PDF, DOCX, PPT, TXT — Max 50MB'}
                  </p>
                  <input type="file" ref={fileRef} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
                  <input type="file" ref={videoFileRef} className="hidden" accept="video/*,.mp4,.mov,.webm,.avi" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">High-Speed Free Mesh</p>
                      <p className="text-[8px] font-bold text-orange-600 uppercase tracking-widest leading-none">Bypasts Firebase Storage Blocks</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setUseFreeMesh(!useFreeMesh)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      useFreeMesh ? "bg-orange-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      useFreeMesh ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
                <p className="text-[9px] font-medium text-slate-500 leading-relaxed italic">
                  Enabled by default. Recommended for instant uploads if your university network blocks standard cloud ports.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Topic / Unit</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm font-bold outline-none focus:bg-white focus:border-slate-950 transition-all" placeholder="e.g. Unit 2 - Sorting Algorithms" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Description <span className="text-orange-500">*</span> (AI uses this to answer student questions)</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:bg-white focus:border-slate-950 transition-all min-h-[100px] resize-none"
                  placeholder="Describe what this resource covers in detail. The more you write, the better AI can answer student questions about it..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <p className="text-[9px] font-bold text-[#74aa95] uppercase tracking-widest">💡 AI answers student questions using this description</p>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              {uploading ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Data Transfer: {uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <Button onClick={handleUpload} className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-widest rounded-lg shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2">
                   Publish to Network Library
                   <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
