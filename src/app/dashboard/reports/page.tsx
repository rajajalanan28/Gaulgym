"use client";

import { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase, getGymsByOwner } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Filter, Users } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Filters
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedAdmin, setSelectedAdmin] = useState<string>('all');
  
  // Chart Data State
  const [chartData, setChartData] = useState<any[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const gyms = await getGymsByOwner(user.id);
        const gymIds = gyms.map(g => g.id);

        if (gymIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch all subscriptions/transactions
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .in('gym_id', gymIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setTransactions(data);
          
          // Extract unique admins for filter
          const uniqueAdmins = Array.from(new Set(data.filter(t => t.created_by_name).map(t => t.created_by_name)));
          setAdmins(uniqueAdmins as string[]);
        }
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  // Derived calculations based on filters
  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (selectedAdmin !== 'all') {
      result = result.filter(t => t.created_by_name === selectedAdmin);
    }
    return result;
  }, [transactions, selectedAdmin]);

  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [filteredTransactions]);

  const totalTransactionsCount = filteredTransactions.length;

  // Process data for charts based on time filter
  useEffect(() => {
    if (filteredTransactions.length === 0) {
      setChartData([]);
      return;
    }

    const groupedData: Record<string, number> = {};

    filteredTransactions.forEach(t => {
      const date = new Date(t.created_at);
      let key = "";
      
      if (timeFilter === 'daily') {
        key = date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }); // e.g. "5 Jun"
      } else if (timeFilter === 'weekly') {
        // Simple week grouping (Year-Week)
        const week = Math.ceil(date.getDate() / 7);
        key = `Minggu ${week} ${date.toLocaleDateString('id-ID', { month: 'short' })}`;
      } else if (timeFilter === 'monthly') {
        key = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }); // e.g. "Jun 2026"
      }

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key] += (t.amount || 0);
    });

    // Convert to array and sort by date chronologically
    // Note: for simplicity in UI, we just sort by key string or rely on creation order reverse
    const chartArr = Object.keys(groupedData).map(key => ({
      name: key,
      Pendapatan: groupedData[key]
    })).reverse(); // Assuming original data was descending

    setChartData(chartArr);
  }, [filteredTransactions, timeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="p-6 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />

        <div className="mb-[32px]">
          <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Laporan Keuangan</h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Analisis pendapatan dan performa kasir (admin)</p>
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

          <div className="flex items-center gap-[8px] bg-[var(--color-surface-1)] px-[16px] py-[8px] rounded-[12px] hairline-border">
            <Filter size={16} className="text-[var(--color-ink-subtle)]" />
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="bg-transparent text-[13px] text-[var(--color-ink)] font-medium outline-none cursor-pointer"
            >
              <option value="all">Semua Admin/Kasir</option>
              {admins.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[32px]">
          <div className="bg-gradient-to-br from-[#1a1c23] to-[#121318] hairline-border rounded-[20px] p-[28px] relative overflow-hidden shadow-xl group">
            <div className="absolute -right-6 -top-6 text-[var(--color-primary)] opacity-10 group-hover:scale-110 transition-transform duration-500">
              <DollarSign size={120} />
            </div>
            <p className="text-[14px] text-[var(--color-ink-subtle)] font-medium mb-[8px] relative z-10">Total Pendapatan (Laba Kotor)</p>
            <h2 className="text-[36px] font-bold text-white tracking-[-0.02em] relative z-10">
              {loading ? '...' : formatCurrency(totalRevenue)}
            </h2>
            <div className="flex items-center gap-[8px] mt-[12px] relative z-10">
              <span className="flex items-center gap-[4px] text-[12px] font-medium text-green-400 bg-green-500/10 px-[8px] py-[4px] rounded-full">
                <TrendingUp size={12} /> Laba Positif
              </span>
              <span className="text-[12px] text-[var(--color-ink-muted)]">Berdasarkan filter aktif</span>
            </div>
          </div>
          
          <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[28px] flex flex-col justify-center">
            <p className="text-[14px] text-[var(--color-ink-subtle)] font-medium mb-[8px]">Total Transaksi</p>
            <h2 className="text-[36px] font-bold text-[var(--color-ink)] tracking-[-0.02em]">
              {loading ? '...' : totalTransactionsCount.toLocaleString('id-ID')} <span className="text-[20px] text-[var(--color-ink-muted)] font-normal">Sales</span>
            </h2>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[24px] mb-[32px]">
          <h3 className="text-[16px] font-semibold text-[var(--color-ink)] mb-[24px] flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--color-primary)]" />
            Grafik Pendapatan
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
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="Pendapatan" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={50} />
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
              Riwayat Transaksi
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  {['Tanggal', 'Paket', 'Member ID', 'Admin/Kasir', 'Nominal'].map(h => (
                    <th key={h} className="px-[24px] py-[16px] text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--color-hairline)]">
                      <td colSpan={5} className="px-[24px] py-[16px]"><div className="h-4 bg-[var(--color-hairline)] animate-pulse rounded w-full"></div></td>
                    </tr>
                  ))
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-[24px] py-[16px]">
                        <span className="text-[14px] text-[var(--color-ink)]">{new Date(t.created_at).toLocaleString('id-ID')}</span>
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-ink)]">{t.package_name}</td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{t.member_id}</td>
                      <td className="px-[24px] py-[16px]">
                        <div className="flex items-center gap-2 text-[14px] text-[var(--color-ink-muted)]">
                          <Users size={14} />
                          {t.created_by_name || 'System'}
                        </div>
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] font-bold text-green-400">
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-[24px] py-[48px] text-center text-[var(--color-ink-muted)]">Tidak ada riwayat transaksi</td>
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
