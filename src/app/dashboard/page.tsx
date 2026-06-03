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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[48px]">
            {[
              { icon: <MapPin size={20} />, value: loading ? '...' : stats.totalGyms.toString(), label: 'Total Gym' },
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
                icon={<MapPin size={20} />}
                title="Kelola Gym"
                subtitle="Lihat dan edit lokasi gym Anda"
                onClick={() => router.push('/gyms')}
              />
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
                onClick={() => router.push('/admin/members')}
              />
              <MenuItem
                icon={<DollarSign size={20} />}
                title="Laporan Keuangan"
                subtitle="Lihat pendapatan dan analitik"
                onClick={() => router.push('/dashboard/reports')}
              />
              <MenuItem
                icon={<UserCheck size={20} />}
                title="Manajemen Staff"
                subtitle="Kelola karyawan di semua gym"
                onClick={() => router.push('/staff')}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}