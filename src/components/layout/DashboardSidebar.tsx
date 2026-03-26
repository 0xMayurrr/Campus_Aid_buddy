import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Ticket, Send, Bell, Bot, BookOpen,
  Users, BarChart3, GraduationCap, Settings, LogOut,
  Library, UserCog, ChevronRight, Sparkles
} from 'lucide-react';

const NAV_CONFIG = {
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Send, label: 'Raise Issue', path: '/submit' },
    { icon: Ticket, label: 'My Tickets', path: '/tickets' },
    { icon: Library, label: 'Digital Library', path: '/library' },
    { icon: Bot, label: 'Campus AI', path: '/campus-ai' },
    { icon: GraduationCap, label: 'My Profile', path: '/student-profile' },
    { icon: Bell, label: 'Announcements', path: '/announcements' },
  ],
  faculty: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Ticket, label: 'Dept Tickets', path: '/tickets' },
    { icon: Library, label: 'Digital Library', path: '/library' },
    { icon: Bell, label: 'Announcements', path: '/announcements' },
    { icon: Bot, label: 'Campus AI', path: '/campus-ai' },
  ],
  hod: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Campus Growth', path: '/growth' },
    { icon: Ticket, label: 'Dept Issues', path: '/tickets' },
    { icon: Users, label: 'Students', path: '/students' },
    { icon: Bell, label: 'Announcements', path: '/announcements' },
    { icon: Bot, label: 'Campus AI', path: '/campus-ai' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Campus Growth', path: '/growth' },
    { icon: Ticket, label: 'All Tickets', path: '/tickets' },
    { icon: Users, label: 'All Students', path: '/students' },
    { icon: Bell, label: 'Announcements', path: '/announcements' },
    { icon: UserCog, label: 'Manage Users', path: '/manage-users' },
    { icon: Bot, label: 'Campus AI', path: '/campus-ai' },
  ],
};

const ROLE_COLORS: Record<string, string> = {
  student: 'from-orange-500 to-amber-600',
  faculty: 'from-blue-600 to-cyan-600',
  hod: 'from-indigo-600 to-violet-600',
  admin: 'from-rose-600 to-pink-600',
};

const ROLE_LABELS: Record<string, string> = {
  student: 'Student Portal',
  faculty: 'Faculty Portal',
  hod: 'HOD Portal',
  admin: 'Admin Portal',
};

export function DashboardSidebar({ className, forceExpanded }: { className?: string; forceExpanded?: boolean }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [hovered, setHovered] = React.useState(false);
  if (!user) return null;

  const expanded = forceExpanded || hovered;
  const navItems = NAV_CONFIG[user.role] || [];
  const gradientClass = ROLE_COLORS[user.role] || ROLE_COLORS.student;
  const portalLabel = ROLE_LABELS[user.role] || 'Portal';

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'flex flex-col h-screen bg-slate-950 border-r border-slate-900 shadow-2xl relative z-50 transition-all duration-300 ease-in-out overflow-hidden',
        expanded ? 'w-72' : 'w-[72px]',
        className,
      )}
    >
      {/* Brand Section */}
      <div className="p-4 border-b border-slate-900/50 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 min-w-[40px] bg-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 hover:rotate-12">
            <img src="/Campus_Aid_Buddyy_Logo_with_Open_Hand_Icon-removebg-preview.png" alt="CAB" className="h-7 w-auto" />
          </div>
          <div className={cn('overflow-hidden transition-all duration-300', expanded ? 'w-auto opacity-100' : 'w-0 opacity-0')}>
            <h2 className="font-black text-white text-lg tracking-tighter leading-none whitespace-nowrap">Campus Aid</h2>
            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1 opacity-80 whitespace-nowrap">{portalLabel}</p>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <div className="px-3 py-4 overflow-y-auto flex-1 space-y-1 custom-scrollbar">
        <p className={cn('text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-2 whitespace-nowrap overflow-hidden transition-all duration-300', expanded ? 'opacity-100' : 'opacity-0')}>
          Main Interface
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!expanded ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                )}
              >
                <item.icon className={cn('w-5 h-5 min-w-[20px] relative z-10 transition-colors', isActive ? 'text-white' : 'text-slate-500 group-hover:text-orange-500')} />
                <span className={cn('relative z-10 whitespace-nowrap overflow-hidden transition-all duration-300', expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0')}>
                  {item.label}
                </span>
                {isActive && expanded && (
                  <>
                    <ChevronRight className="w-4 h-4 text-white/40 relative z-10 ml-auto" />
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 z-0"></div>
                  </>
                )}
                {isActive && !expanded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 z-0"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User & Action Zone */}
      <div className="p-3 border-t border-slate-900/50 bg-slate-950 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
            <div className={cn(
              'w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-sm font-black shadow-lg group-hover:scale-110 transition-transform duration-300',
              gradientClass
            )}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className={cn('flex-1 min-w-0 overflow-hidden transition-all duration-300', expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0')}>
              <p className="text-sm font-black text-white truncate tracking-tight whitespace-nowrap">{user.name}</p>
              <p className="text-[9px] text-orange-500 font-black uppercase truncate tracking-widest mt-0.5 opacity-80 whitespace-nowrap">{user.dept || user.role}</p>
            </div>
            {expanded && <Settings className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors min-w-[16px]" />}
          </div>

          <button
            onClick={logout}
            title={!expanded ? 'Logout' : undefined}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4 min-w-[16px]" />
            <span className={cn('whitespace-nowrap overflow-hidden transition-all duration-300', expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0')}>
              End Session
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
