'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, Filter, Download, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Filters
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  // UI States
  const [chartData, setChartData] = useState<any[]>([]);

  // AbortController for cancelling requests
  const abortRef = useRef<AbortController | null>(null);

  const loadData = async () => {
    if (!user) return;
    
    // Cancel any pending request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);

      // Fetch subscriptions (income for this gym)
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch sales transactions (income)
      const { data: salesData } = await supabase
        .from('sales_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      // Check if aborted
      if (controller.signal.aborted) return;

      // Format & Merge Data (admin sees income only, no expenses)
      const formattedSubs = (subsData || []).map((s: any) => ({
        id: s.id,
        type: 'income' as const,
        amount: Number(s.amount || 0),
        title: s.package_name,
        subtitle: `Member ID: ${s.member_id}`,
        created_at: s.created_at
      }));

      const formattedSales = (salesData || []).map((s: any) => ({
        id: s.id,
        type: 'income' as const,
        amount: Number(s.total_amount || 0),
        title: `Penjualan POS (${s.payment_method})`,
        subtitle: '-',
        created_at: s.created_at
      }));

      const mergedData = [...formattedSubs, ...formattedSales].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTransactions(mergedData);
      
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        console.error("Error loading admin reports:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => { abortRef.current?.abort(); };
  }, [user]);

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Process data for charts based on time filter
  useEffect(() => {
    if (transactions.length === 0) {
      setChartData([]);
      return;
    }

    const groupedData: Record<string, { Pendapatan: number }> = {};

    transactions.forEach(t => {
      const date = new Date(t.created_at);
      let key = "";
      
      if (timeFilter === 'daily') {
        key = date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      } else if (timeFilter === 'weekly') {
        // Use ISO week calculation for proper week boundaries
        const thursday = new Date(date);
        thursday.setDate(date.getDate() + (3 - ((date.getDay() + 6) % 7)));
        const yearStart = new Date(thursday.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((thursday.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        key = `W${weekNo} ${date.toLocaleDateString('id-ID', { month: 'short' })}`;
      } else if (timeFilter === 'monthly') {
        key = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      }

      if (!groupedData[key]) {
        groupedData[key] = { Pendapatan: 0 };
      }
      
      groupedData[key].Pendapatan += (t.amount || 0);
    });

    const chartArr = Object.keys(groupedData).map(key => ({
      name: key,
      Pendapatan: groupedData[key].Pendapatan,
    })).reverse();

    setChartData(chartArr);
  }, [transactions, timeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori/Paket', 'Keterangan', 'Nominal'];
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleString('id-ID').replace(',', ''),
      'Pemasukan',
      `"${t.title}"`,
      `"${t.subtitle}"`,
      t.amount
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Admin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />

        <div className="mb-[32px] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Laporan Pemasukan</h1>
            <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Ringkasan pemasukan dari paket membership dan penjualan kasir</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-medium transition-colors border border-[var(--color-hairline)]"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-[16px] mb-[24px]">
          <div className="flex bg-[var(--color-surface-1)] p-[4px] rounded-[12px] hairline-border w-fit">
            {(['daily', 'weekly', 'monthly'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-[16px] py-[8px] rounded-[8px] text-[13px] font-medium transition-all ${timeFilter === t ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
              >
                {t === 'daily' ? 'Harian' : t === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[32px]">
          <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[24px]">
            <div className="flex items-center gap-3 text-[var(--color-ink-subtle)] mb-2">
              <ArrowUpCircle size={18} className="text-green-500" />
              <p className="text-[13px] font-medium">Total Pemasukan</p>
            </div>
            <h2 className="text-[24px] font-bold text-[var(--color-ink)] tracking-[-0.02em]">
              {loading ? '...' : formatCurrency(totalRevenue)}
            </h2>
          </div>
          
          <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[24px]">
            <div className="flex items-center gap-3 text-[var(--color-ink-subtle)] mb-2">
              <Calendar size={18} className="text-[var(--color-primary)]" />
              <p className="text-[13px] font-medium">Total Transaksi</p>
            </div>
            <h2 className="text-[24px] font-bold text-[var(--color-ink)] tracking-[-0.02em]">
              {loading ? '...' : transactions.length.toLocaleString('id-ID')}
            </h2>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[24px] mb-[32px]">
          <h3 className="text-[16px] font-semibold text-[var(--color-ink)] mb-[24px] flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--color-primary)]" />
            Grafik Pemasukan
          </h3>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[var(--color-ink-muted)]">Memuat grafik...</span>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-ink-subtle)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="var(--color-ink-subtle)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--color-surface-2)' }}
                    contentStyle={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-hairline)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--color-ink)', fontWeight: 500 }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Pendapatan" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[var(--color-ink-muted)]">Tidak ada data untuk ditampilkan</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] overflow-hidden">
          <div className="p-[24px] border-b border-[var(--color-hairline)] flex justify-between items-center">
            <h3 className="text-[16px] font-semibold text-[var(--color-ink)] flex items-center gap-2">
              <Calendar size={18} className="text-[var(--color-primary)]" />
              Riwayat Pemasukan
            </h3>
          </div>
          
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-3 p-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-[var(--color-surface-2)] animate-pulse rounded-xl border border-[var(--color-hairline)]"></div>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((t) => (
                <div key={t.id} className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-hairline)] flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-[14px] font-bold text-[var(--color-ink)] mb-1">{t.title}</div>
                      <div className="text-[12px] text-[var(--color-ink-muted)] line-clamp-2">{t.subtitle}</div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-3">
                      <div className="text-[14px] font-bold text-green-400">+{formatCurrency(t.amount)}</div>
                      <div className="text-[11px] text-[var(--color-ink-muted)] mt-1">{new Date(t.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-[32px] text-center text-[var(--color-ink-muted)] text-[13px]">Tidak ada riwayat pemasukan</div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  {['Tanggal', 'Kategori/Tipe', 'Keterangan', 'Nominal'].map(h => (
                    <th key={h} className="px-[24px] py-[16px] text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--color-hairline)]">
                      <td colSpan={4} className="px-[24px] py-[16px]"><div className="h-4 bg-[var(--color-hairline)] animate-pulse rounded w-full"></div></td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-[24px] py-[16px]">
                        <span className="text-[14px] text-[var(--color-ink)]">{new Date(t.created_at).toLocaleString('id-ID')}</span>
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <span className="text-[14px] font-medium text-[var(--color-ink)]">{t.title}</span>
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{t.subtitle}</td>
                      <td className="px-[24px] py-[16px] text-[14px] font-bold text-green-400">
                        +{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-[24px] py-[48px] text-center text-[var(--color-ink-muted)]">Tidak ada riwayat pemasukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
