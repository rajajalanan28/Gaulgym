'use client';

import { StatCard } from '@/components/StatCard';
import { WelcomeCard } from '@/components/WelcomeCard';
import { MenuItem } from '@/components/MenuItem';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

export default function OwnerDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white p-[32px] md:p-[48px]">
        <div className="max-w-[1200px] mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-[48px]">
            <h1 className="text-[20px] font-semibold text-[var(--color-ink)] tracking-[-0.01em]">
              GAUL GYM
            </h1>
            <button
              onClick={handleLogout}
              className="px-[12px] py-[6px] text-[13px] font-medium text-[var(--color-ink)] hover:text-white bg-[var(--color-surface-1)] hover:bg-red-500 hairline-border rounded-md transition-colors focus-ring"
            >
              Logout
            </button>
          </div>

          {/* Welcome Section */}
          <div className="mb-[32px]">
            <WelcomeCard
              title={`Welcome back, ${user?.name || 'Owner'}!`}
              subtitle="Here's an overview of your gym network"
              icon="💪"
            />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[48px]">
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
              value="12"
              label="Total Gyms"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>}
              value="2,845"
              label="Members"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>}
              value="156"
              label="Staff"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>}
              value="$48,250"
              label="Revenue"
            />
          </div>

          {/* Menu Navigation Section */}
          <div>
            <h2 className="text-[15px] font-medium text-[var(--color-ink)] mb-[16px]">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <MenuItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>}
                title="Manage Gyms"
                subtitle="View and edit your gym locations"
                onClick={() => console.log('Navigate to gyms')}
              />
              <MenuItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>}
                title="Member Management"
                subtitle="Manage all gym members"
                onClick={() => console.log('Navigate to members')}
              />
              <MenuItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>}
                title="Financial Reports"
                subtitle="View revenue and analytics"
                onClick={() => console.log('Navigate to reports')}
              />
              <MenuItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
                title="Staff Management"
                subtitle="Manage employees across gyms"
                onClick={() => console.log('Navigate to staff')}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}