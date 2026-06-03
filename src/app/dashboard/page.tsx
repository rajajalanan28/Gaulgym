'use client';

import dynamic from 'next/dynamic';
import { WelcomeCard } from '@/components/WelcomeCard';
import { MenuItem } from '@/components/MenuItem';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';

const MapPin = dynamic(() => import('lucide-react').then(m => ({ default: m.MapPin })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const Users = dynamic(() => import('lucide-react').then(m => ({ default: m.Users })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const DollarSign = dynamic(() => import('lucide-react').then(m => ({ default: m.DollarSign })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const UserCheck = dynamic(() => import('lucide-react').then(m => ({ default: m.UserCheck })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });

export default function OwnerDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white p-[32px] md:p-[48px]">
        <div className="max-w-[1200px] mx-auto">
          {/* Header Section */}
          <DashboardHeader />

          {/* Welcome Section */}
          <div className="mb-[32px]">
            <WelcomeCard
              title={`Welcome back, ${user?.name || 'Owner'}!`}
              subtitle="Here's an overview of your gym network"
            />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[48px]">
            {[
              { icon: <MapPin size={20} />, value: '12', label: 'Total Gyms' },
              { icon: <Users size={20} />, value: '2,845', label: 'Members' },
              { icon: <UserCheck size={20} />, value: '156', label: 'Staff' },
              { icon: <DollarSign size={20} />, value: '$48,250', label: 'Revenue' },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--color-surface-1)] hairline-border rounded-[12px] p-[20px]">
                <div className="flex items-center gap-[12px] mb-[12px]">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-primary)]">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em] leading-[1]">{stat.value}</p>
                <p className="text-[13px] text-[var(--color-ink-subtle)] mt-[4px]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Menu Navigation Section */}
          <div>
            <h2 className="text-[15px] font-medium text-[var(--color-ink)] mb-[16px]">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <MenuItem
                icon={<MapPin size={20} />}
                title="Manage Gyms"
                subtitle="View and edit your gym locations"
                onClick={() => window.location.href = '/gyms'}
              />
              <MenuItem
                icon={<Users size={20} />}
                title="Member Management"
                subtitle="Manage all gym members"
                onClick={() => window.location.href = '/admin/members'}
              />
              <MenuItem
                icon={<DollarSign size={20} />}
                title="Financial Reports"
                subtitle="View revenue and analytics"
                onClick={() => console.log('Navigate to reports')}
              />
              <MenuItem
                icon={<UserCheck size={20} />}
                title="Staff Management"
                subtitle="Manage employees across gyms"
                onClick={() => window.location.href = '/staff'}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}