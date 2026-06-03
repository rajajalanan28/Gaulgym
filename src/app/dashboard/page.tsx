'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { WelcomeCard } from '@/components/WelcomeCard';
import { MenuItem } from '@/components/MenuItem';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { getOwnerStats } from '@/lib/supabase';

const MapPin = dynamic(() => import('lucide-react').then(m => ({ default: m.MapPin })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const Users = dynamic(() => import('lucide-react').then(m => ({ default: m.Users })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const DollarSign = dynamic(() => import('lucide-react').then(m => ({ default: m.DollarSign })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const UserCheck = dynamic(() => import('lucide-react').then(m => ({ default: m.UserCheck })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const Tag = dynamic(() => import('lucide-react').then(m => ({ default: m.Tag })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalGyms: 0, totalMembers: 0, totalStaff: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (user?.id) {
        try {
          const data = await getOwnerStats(user.id);
          setStats(data);
        } catch (error) {
          console.error("Failed to fetch owner stats:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadStats();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white p-4 pb-28 md:p-[48px]">
        <div className="max-w-[1200px] mx-auto">
          {/* Header Section */}
          <DashboardHeader />

          {/* Welcome Section */}
          <div className="mb-[32px]">
            <WelcomeCard
              title={`Selamat datang kembali, ${user?.name || 'Owner'}!`}
              subtitle="Berikut adalah ringkasan jaringan gym Anda"
            />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] mb-[48px]">
            {[
              { icon: <Users size={20} />, value: loading ? '...' : stats.totalMembers.toLocaleString('id-ID'), label: 'Total Member' },
              { icon: <UserCheck size={20} />, value: loading ? '...' : stats.totalStaff.toLocaleString('id-ID'), label: 'Total Staff' },
              { icon: <DollarSign size={20} />, value: loading ? '...' : formatCurrency(stats.totalRevenue), label: 'Pendapatan' },
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
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <MenuItem
                icon={<Tag size={20} />}
                title="Manajemen Harga"
                subtitle="Atur paket membership"
                onClick={() => router.push('/dashboard/packages')}
              />
              <MenuItem
                icon={<Users size={20} />}
                title="Manajemen Member"
                subtitle="Kelola seluruh member gym"
                onClick={() => router.push('/owner/member')}
              />
              <MenuItem
                icon={<DollarSign size={20} />}
                title="Laporan Keuangan"
                subtitle="Lihat pendapatan dan analitik"
                onClick={() => router.push('/dashboard/reports')}
              />
              <MenuItem
                icon={<UserCheck size={20} />}
                title="Manajemen Admin"
                subtitle="Kelola kasir di semua gym"
                onClick={() => router.push('/owner/admin')}
              />
              <MenuItem
                icon={<span className="text-green-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></span>}
                title="Kasir (POS)"
                subtitle="Jual minuman & suplemen"
                onClick={() => router.push('/admin/pos')}
              />
              <MenuItem
                icon={<span className="text-[var(--color-primary)]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="m3 15 2 2 4-4"/></svg></span>}
                title="Scan Check-in"
                subtitle="Scan QR code kedatangan"
                onClick={() => router.push('/admin/checkin')}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}