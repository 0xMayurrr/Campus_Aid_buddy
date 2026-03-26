import React, { ReactNode, useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { Menu, X, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background overflow-hidden text-slate-900">
      {/* Desktop Sidebar */}
      <DashboardSidebar className="hidden lg:flex flex-shrink-0" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <DashboardSidebar className="flex" forceExpanded />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 lg:hidden bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/Campus_Aid_Buddyy_Logo_with_Open_Hand_Icon-removebg-preview.png" alt="CAB" className="h-8 w-auto" />
            <span className="text-sm font-bold text-slate-900">Campus Aid</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
