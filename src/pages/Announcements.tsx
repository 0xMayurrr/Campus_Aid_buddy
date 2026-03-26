import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/services/firestoreService';
import { Announcement, UserRole } from '@/types';
import { Bell, Plus, X, Loader2, Megaphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TARGET_ROLES = [
  { value: 'all', label: 'Global (Everyone)' },
  { value: 'student', label: 'Students Sector' },
  { value: 'faculty', label: 'Academic Staff' },
  { value: 'hod', label: 'Management (HODs)' },
];

const ROLE_BADGE: Record<string, string> = {
  all: 'bg-slate-100 text-slate-500 border-slate-200',
  student: 'bg-blue-50 text-blue-600 border-blue-100',
  faculty: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  hod: 'bg-violet-50 text-violet-600 border-violet-100',
};

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', targetRole: 'all' });

  const canPost = user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'hod';

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements(user?.role);
      setAnnouncements(data);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handlePost = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Please fill in title and body');
      return;
    }
    setSaving(true);
    try {
      await createAnnouncement({
        title: form.title,
        body: form.body,
        targetRole: form.targetRole as UserRole | 'all',
        postedBy: user!.uid,
        postedByName: user!.name,
      });
      toast.success('Announcement posted!');
      setForm({ title: '', body: '', targetRole: 'all' });
      setShowForm(false);
      await load();
    } catch {
      toast.error('Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success('Deleted');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Campus Notices</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Stay informed with global and departmental updates
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="font-bold text-slate-800">{announcements.length} active notifications</span>
          </p>
        </div>
        {canPost && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
          >
            <Plus className="w-4 h-4" />
            Post New Announcement
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
           <Loader2 className="w-5 h-5 animate-spin mr-3 text-orange-500" /> Synchronizing Broadcasts...
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Bell className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-500 font-bold opacity-40">No active broadcasts for your role</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group relative">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-12">
                <Megaphone className="w-7 h-7 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{a.title}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border tracking-widest ${ROLE_BADGE[a.targetRole] || ROLE_BADGE.all}`}>
                      {TARGET_ROLES.find((r) => r.value === a.targetRole)?.label || a.targetRole}
                    </span>
                  </div>
                  {(user?.role === 'admin' || user?.uid === a.postedBy) && (
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-slate-300 hover:text-rose-600 transition-all p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{a.body}</p>
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200 uppercase">{a.postedByName?.charAt(0)}</div>
                      <p className="text-[10px] font-bold text-slate-500 leading-none">Published by <span className="text-slate-900">{a.postedByName}</span></p>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-slate-200" />{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">New Broadcast</h2>
                <p className="text-xs text-slate-500 mt-2 font-medium">Issue a verified campus-wide or departmental notice</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Announcement Heading *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. End Semester Examination Schedule Published"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Audience Sector</label>
                <select
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none appearance-none"
                >
                  {TARGET_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Broadcast Content *</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Provide precise details for the announcement..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all resize-none"
                />
              </div>
              <button
                onClick={handlePost}
                disabled={saving}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                {saving ? 'Transmitting Broadcast...' : 'Publish Official Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
