'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { supabase } from '@/lib/supabase';
import { Loader2, TrendingUp, DollarSign, Package, Wallet, Calendar, Download, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'custom';

interface RawTransaction {
  created_at: string;
  amount: number;
  type: 'pos' | 'subscription' | 'expense';
  title: string;
}

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<RawTransaction[]>([]);

  // Filters
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [posRes, subRes, expRes] = await Promise.all([
        supabase.from('sales_transactions').select('created_at, total_amount').order('created_at', { ascending: true }),
        supabase.from('subscriptions').select('created_at, amount, package_name').order('created_at', { ascending: true }),
        supabase.from('expenses').select('date, amount, description').order('date', { ascending: true }),
      ]);

      if (posRes.error) throw posRes.error;
      if (subRes.error) throw subRes.error;
      if (expRes.error) throw expRes.error;

      const merged: RawTransaction[] = [
        ...(posRes.data || []).map((t: any) => ({
          created_at: t.created_at,
          amount: Number(t.total_amount) || 0,
          type: 'pos' as const,
          title: 'Penjualan Kasir',
        })),
        ...(subRes.data || []).map((t: any) => ({
          created_at: t.created_at,
          amount: Number(t.amount) || 0,
          type: 'subscription' as const,
          title: t.package_name || 'Paket Member',
        })),
        ...(expRes.data || []).map((t: any) => ({
          created_at: t.date,
          amount: Number(t.amount) || 0,
          type: 'expense' as const,
          title: t.description || 'Pengeluaran',
        })),
      ];

      setAllTransactions(merged);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Determine date range based on filter
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (timeFilter === 'daily') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); // Last 30 days
    } else if (timeFilter === 'weekly') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 83); // Last 12 weeks
    } else if (timeFilter === 'custom' && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd + 'T23:59:59');
    } else {
      // monthly - last 6 months
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    }

    return { start, end };
  }, [timeFilter, customStart, customEnd]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.created_at);
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [allTransactions, dateRange]);

  // Stats from filtered data
  const stats = useMemo(() => {
    let totalPos = 0, totalSub = 0, totalExpense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'pos') totalPos += t.amount;
      else if (t.type === 'subscription') totalSub += t.amount;
      else if (t.type === 'expense') totalExpense += t.amount;
    });
    const totalAll = totalPos + totalSub;
    const netProfit = totalAll - totalExpense;
    return { totalPos, totalSub, totalAll, totalExpense, netProfit };
  }, [filteredTransactions]);

  // Chart data
  const chartData = useMemo(() => {
    const grouped: Record<string, { posRevenue: number; subscriptionRevenue: number; expense: number; sortKey: string }> = {};

    filteredTransactions.forEach(t => {
      const date = new Date(t.created_at);
      let key = '';
      let sortKey = '';

      if (timeFilter === 'daily') {
        key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        sortKey = date.toISOString().substring(0, 10);
      } else if (timeFilter === 'weekly') {
        const thursday = new Date(date);
        thursday.setDate(date.getDate() + (3 - ((date.getDay() + 6) % 7)));
        const yearStart = new Date(thursday.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((thursday.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        key = `W${weekNo} ${date.toLocaleDateString('id-ID', { month: 'short' })}`;
        sortKey = `${thursday.getFullYear()}-${String(weekNo).padStart(2, '0')}`;
      } else if (timeFilter === 'custom') {
        // For custom, auto-decide granularity based on range
        const diffDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 31) {
          key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          sortKey = date.toISOString().substring(0, 10);
        } else {
          key = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
          sortKey = date.toISOString().substring(0, 7);
        }
      } else {
        // monthly
        key = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        sortKey = date.toISOString().substring(0, 7);
      }

      if (!grouped[key]) {
        grouped[key] = { posRevenue: 0, subscriptionRevenue: 0, expense: 0, sortKey };
      }
      if (t.type === 'pos') grouped[key].posRevenue += t.amount;
      else if (t.type === 'subscription') grouped[key].subscriptionRevenue += t.amount;
      else if (t.type === 'expense') grouped[key].expense += t.amount;
    });

    return Object.entries(grouped)
      .sort(([, a], [, b]) => a.sortKey.localeCompare(b.sortKey))
      .map(([key, val]) => ({
        month: key,
        posRevenue: val.posRevenue,
        subscriptionRevenue: val.subscriptionRevenue,
        totalRevenue: val.posRevenue + val.subscriptionRevenue,
        expense: val.expense,
        netProfit: val.posRevenue + val.subscriptionRevenue - val.expense,
      }));
  }, [filteredTransactions, timeFilter, dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-hairline)] p-3 rounded-lg shadow-xl">
          <p className="font-bold text-[var(--color-ink)] mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex justify-between gap-4 text-[13px] mb-1">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-semibold text-[var(--color-ink)]">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Nominal'];
    const rows = filteredTransactions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(t => [
        new Date(t.created_at).toLocaleString('id-ID').replace(',', ''),
        t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
        `"${t.title}"`,
        t.type === 'expense' ? -t.amount : t.amount,
      ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterLabel = () => {
    if (timeFilter === 'daily') return '30 Hari Terakhir';
    if (timeFilter === 'weekly') return '12 Minggu Terakhir';
    if (timeFilter === 'monthly') return '6 Bulan Terakhir';
    if (timeFilter === 'custom' && customStart && customEnd) {
      return `${new Date(customStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} — ${new Date(customEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return 'Pilih Rentang Tanggal';
  };

  if (authLoading) return <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center"><Loader2 className="animate-spin text-[var(--color-primary)]" size={32} /></div>;

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white p-4 pb-28 md:p-[48px]">
        <div className="max-w-[1200px] mx-auto">
          <DashboardHeader />
          
          <div className="mt-[32px] space-y-6">
            {/* Title & Export */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <TrendingUp className="text-[var(--color-primary)]" />
                  Laporan Keuangan
                </h1>
                <p className="text-sm text-gray-400 mt-1">Ringkasan pendapatan, pengeluaran, dan laba bersih Gym Anda.</p>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-xl font-medium transition-colors border border-[var(--color-hairline)] text-sm shrink-0"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            {/* Time Filter Tabs */}
            <div className="flex flex-col gap-3">
              <div className="flex bg-[var(--color-surface-1)] p-1 rounded-xl border border-[var(--color-hairline)] w-fit">
                {([
                  { key: 'daily', label: 'Harian' },
                  { key: 'weekly', label: 'Mingguan' },
                  { key: 'monthly', label: 'Bulanan' },
                  { key: 'custom', label: 'Custom' },
                ] as { key: TimeFilter; label: string }[]).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTimeFilter(t.key)}
                    className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${timeFilter === t.key ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Custom date range picker */}
              {timeFilter === 'custom' && (
                <div className="flex flex-wrap items-center gap-3 bg-[var(--color-surface-1)] p-4 rounded-xl border border-[var(--color-hairline)]">
                  <Calendar size={16} className="text-[var(--color-primary)] shrink-0" />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="px-3 py-2 bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-lg border border-[var(--color-hairline)] text-sm"
                    />
                    <span className="text-gray-400 text-sm">sampai</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="px-3 py-2 bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-lg border border-[var(--color-hairline)] text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Period Label */}
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Filter size={12} /> Periode: {filterLabel()}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--color-primary)]" size={32} /></div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Package size={20} />
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-400 leading-tight">Transaksi Kasir</p>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold">{formatCurrency(stats.totalPos)}</h3>
                  </div>
                  <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <TrendingUp size={20} />
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-400 leading-tight">Paket Member</p>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold">{formatCurrency(stats.totalSub)}</h3>
                  </div>
                  <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <DollarSign size={20} />
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-400 leading-tight">Total Pemasukan</p>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold">{formatCurrency(stats.totalAll)}</h3>
                  </div>
                  <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <Wallet size={20} />
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-400 leading-tight">Pengeluaran</p>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-red-400">-{formatCurrency(stats.totalExpense)}</h3>
                  </div>
                  <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                        <DollarSign size={20} />
                      </div>
                      <p className="text-[11px] sm:text-xs text-white/80 leading-tight">Laba Bersih</p>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">{formatCurrency(stats.netProfit)}</h3>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-[var(--color-primary)]" />
                    Grafik Keuangan
                  </h3>
                  <div className="w-full h-[350px] sm:h-[400px]">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: '#888', fontSize: 11 }}
                            axisLine={{ stroke: '#333' }}
                            tickLine={false}
                            interval={chartData.length > 15 ? Math.floor(chartData.length / 10) : 0}
                            angle={chartData.length > 10 ? -30 : 0}
                            textAnchor={chartData.length > 10 ? 'end' : 'middle'}
                            height={chartData.length > 10 ? 60 : 30}
                          />
                          <YAxis
                            tickFormatter={(value) => `Rp${value >= 1000000 ? `${(value / 1000000).toFixed(0)}jt` : `${(value / 1000).toFixed(0)}k`}`}
                            tick={{ fill: '#888', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={65}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                          <Bar dataKey="posRevenue" name="Kasir" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="subscriptionRevenue" name="Paket" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                          <Line type="monotone" dataKey="netProfit" name="Laba Bersih" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9' }} activeDot={{ r: 5 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[var(--color-ink-muted)]">
                          {timeFilter === 'custom' && (!customStart || !customEnd) ? 'Pilih rentang tanggal terlebih dahulu' : 'Tidak ada data untuk periode ini'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction List */}
                <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-[var(--color-hairline)] flex justify-between items-center">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Calendar size={18} className="text-[var(--color-primary)]" />
                      Riwayat Transaksi
                    </h3>
                    <span className="text-xs text-gray-500">{filteredTransactions.length} transaksi</span>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden flex flex-col gap-2 p-3">
                    {filteredTransactions
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 50)
                      .map((t, i) => (
                      <div key={i} className="bg-[var(--color-surface-2)] p-3 rounded-xl border border-[var(--color-hairline)] flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'expense' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {t.type === 'expense' ? <Wallet size={14} /> : <TrendingUp size={14} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[var(--color-ink)] truncate">{t.title}</p>
                            <p className="text-[11px] text-gray-500">{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <span className={`text-[13px] font-bold shrink-0 ${t.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                          {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <div className="py-12 text-center text-gray-500 text-sm">Tidak ada transaksi pada periode ini</div>
                    )}
                    {filteredTransactions.length > 50 && (
                      <p className="text-center text-xs text-gray-500 py-2">Menampilkan 50 dari {filteredTransactions.length} transaksi. Export CSV untuk data lengkap.</p>
                    )}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[var(--color-surface-2)]">
                          {['Tanggal', 'Tipe', 'Kategori', 'Nominal'].map(h => (
                            <th key={h} className="px-6 py-4 text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .slice(0, 100)
                            .map((t, i) => (
                            <tr key={i} className="border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-2)] transition-colors">
                              <td className="px-6 py-4 text-sm text-[var(--color-ink)]">
                                {new Date(t.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.type === 'expense' ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'}`}>
                                  {t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-[var(--color-ink)]">{t.title}</td>
                              <td className={`px-6 py-4 text-sm font-bold ${t.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-16 text-center text-gray-500">Tidak ada transaksi pada periode ini</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {filteredTransactions.length > 100 && (
                      <p className="text-center text-xs text-gray-500 py-3 border-t border-[var(--color-hairline)]">Menampilkan 100 dari {filteredTransactions.length} transaksi. Export CSV untuk data lengkap.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
