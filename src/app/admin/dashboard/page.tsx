'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';

export default function AdminDashboard() {
  const stats = [
    { title: 'Check-in Hari Ini', value: '47', change: '+12%', positive: true },
    { title: 'Member Aktif', value: '342', change: '+5%', positive: true },
    { title: 'Member Baru', value: '18', change: '+8', positive: true },
  ];

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-6 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />
        <h1 className="text-[28px] font-semibold mb-[24px] text-[var(--color-ink)] tracking-[-0.02em]">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[var(--color-surface-1)] hairline-border rounded-[12px] p-[24px]">
              <p className="text-[13px] font-medium text-[var(--color-ink-subtle)] mb-[8px]">{stat.title}</p>
              <p className="text-[32px] font-semibold text-[var(--color-ink)] tracking-[-0.02em] leading-[1]">{stat.value}</p>
              <p className={`text-[13px] font-medium mt-[8px] ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}