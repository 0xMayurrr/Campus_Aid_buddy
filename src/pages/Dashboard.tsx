import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';
import HODDashboard from '@/components/dashboard/HODDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student': return <StudentDashboard />;
      case 'faculty': return <FacultyDashboard />;
      case 'hod': return <HODDashboard />;
      case 'admin': return <AdminDashboard />;
      default: return (
        <div className="text-center py-20">
          <p className="text-slate-400">Unknown role. Please contact admin.</p>
        </div>
      );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}
