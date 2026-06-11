'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { WelcomeCard } from '@/components/WelcomeCard';
import { MenuItem } from '@/components/MenuItem';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOwnerStatsAction, getOwnerRevenueChartAction } from '@/app/actions/dashboard';

const MapPin = dynamic(() => import('lucide-react').then(m => ({ default: m.MapPin })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const Users = dynamic(() => import('lucide-react').then(m => ({ default: m.Users })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const DollarSign = dynamic(() => import('lucide-react').then(m => ({ default: m.DollarSign })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const UserCheck = dynamic(() => import('lucide-react').then(m => ({ default: m.UserCheck })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const Tag = dynamic(() => import('lucide-react').then(m => ({ default: m.Tag })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });
const Eye = dynamic(() => import('lucide-react').then(m => ({ default: m.Eye })), { ssr: false, loading: () => <span style={{width:20, height:20}} /> });

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalMembers: 0, totalAdmin: 0, totalRevenue: 0 });
  const [chartData, setChartData] = useState<{name: string, Pendapatan: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (user?.id) {
        try {
          const [statsRes, chartRes] = await Promise.all([
            getOwnerStatsAction(),
            getOwnerRevenueChartAction()
          ]);
          
          if (statsRes.error) throw statsRes.error;
          if (statsRes.data) setStats(statsRes.data);
          
          if (chartRes.data) setChartData(chartRes.data);
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
              subtitle="Berikut adalah ringkasan Gaul Gym"
            />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] mb-[48px]">
            {[
              { icon: <Users size={20} />, value: loading ? '...' : stats.totalMembers.toLocaleString('id-ID'), label: 'Total Member' },
              { icon: <UserCheck size={20} />, value: loading ? '...' : stats.totalAdmin.toLocaleString('id-ID'), label: 'Total Admin' },
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

          {/* Revenue Trend Chart Section */}
          <div className="mb-[48px] bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[24px]">
            <h2 className="text-[16px] font-semibold text-[var(--color-ink)] mb-[24px]">Tren Pendapatan (7 Hari Terakhir)</h2>
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="w-full h-full bg-[var(--color-surface-2)] animate-pulse rounded-[12px]"></div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      width={65}
                      tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
                      tickFormatter={(value) => `Rp${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-1)', borderRadius: '8px', border: '1px solid var(--color-hairline)' }}
                      formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Pendapatan']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Pendapatan" 
                      stroke="var(--color-primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPendapatan)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--color-ink-muted)]">
                  <p>Belum ada data transaksi 7 hari terakhir</p>
                </div>
              )}
            </div>
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
                href="/dashboard/packages"
              />
              <MenuItem
                icon={<Users size={20} />}
                title="Manajemen Member"
                subtitle="Kelola seluruh member"
                href="/owner/member"
              />
              <MenuItem
                icon={<Tag size={20} />}
                title="Manajemen Produk"
                subtitle="Atur produk kasir & stok"
                href="/owner/products"
              />
              <MenuItem
                icon={<DollarSign size={20} />}
                title="Laporan Keuangan"
                subtitle="Lihat pendapatan dan analitik"
                href="/owner/reports"
              />
              <MenuItem
                icon={<UserCheck size={20} />}
                title="Manajemen Admin"
                subtitle="Kelola semua akun admin"
                href="/owner/admin"
              />
              <MenuItem
                icon={<Eye size={20} />}
                title="Jejak Audit"
                subtitle="Pantau aktivitas log semua admin"
                href="/owner/audit"
              />
              <MenuItem
                icon={<span className="text-green-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></span>}
                title="Kasir (POS)"
                subtitle="Jual minuman & suplemen"
                href="/admin/pos"
              />
              <MenuItem
                icon={<span className="text-[var(--color-primary)]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="m3 15 2 2 4-4"/></svg></span>}
                title="Scan Check-in"
                subtitle="Scan QR code kedatangan"
                href="/admin/checkin"
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
