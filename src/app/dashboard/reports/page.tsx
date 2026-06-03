"use client";

import { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase, getGymsByOwner } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Filter, Users, Download, Plus, X, Loader2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Operasional",
  "Gaji Karyawan",
  "Listrik & Air",
  "Maintenance Alat",
  "Sewa Tempat",
  "Marketing",
  "Lain-lain"
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gymId, setGymId] = useState('');
  
  // Data States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  
  // Filters
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedAdmin, setSelectedAdmin] = useState<string>('all');
  
  // UI States
  const [chartData, setChartData] = useState<any[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  
  // Expense Modal States
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const gyms = await getGymsByOwner(user.id);
      if (gyms.length === 0) {
        setLoading(false);
        return;
      }
      
      const primaryGymId = gyms[0].id;
      setGymId(primaryGymId);

      // 1. Fetch active members count for ARPM
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', primaryGymId);
      
      setActiveMembersCount(membersCount || 0);

      // 2. Fetch all subscriptions (Income)
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('gym_id', primaryGymId)
        .order('created_at', { ascending: false });

      // 3. Fetch sales transactions (Income)
      const { data: salesData } = await supabase
        .from('sales_transactions')
        .select('*, users(name)')
        .eq('gym_id', primaryGymId)
        .order('created_at', { ascending: false });

      // 4. Fetch expenses (Expense)
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*, auth_users:created_by(raw_user_meta_data)')
        .eq('gym_id', primaryGymId)
        .order('created_at', { ascending: false });

      // Format & Merge Data
      const formattedSubs = (subsData || []).map((s: any) => ({
        id: s.id,
        type: 'income',
        amount: s.amount,
        title: s.package_name,
        subtitle: `Member ID: ${s.member_id}`,
        created_by_name: s.created_by_name || 'System',
        created_at: s.created_at
      }));

      const formattedSales = (salesData || []).map((s: any) => ({
        id: s.id,
        type: 'income',
        amount: s.total_amount,
        title: `Penjualan POS (${s.payment_method})`,
        subtitle: '-',
        created_by_name: s.users?.name || 'Admin',
        created_at: s.created_at
      }));

      const formattedExpenses = (expensesData || []).map((e: any) => ({
        id: e.id,
        type: 'expense',
        amount: e.amount,
        title: `Pengeluaran: ${e.category}`,
        subtitle: e.description || '-',
        // Attempt to get name if possible, else just Owner
        created_by_name: 'Owner', 
        created_at: e.created_at
      }));

      const mergedData = [...formattedSubs, ...formattedSales, ...formattedExpenses].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTransactions(mergedData);
      
      // Extract unique admins for filter
      const uniqueAdmins = Array.from(new Set(mergedData.filter(t => t.created_by_name).map(t => t.created_by_name)));
      setAdmins(uniqueAdmins as string[]);
      
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const { totalRevenue, totalExpenses, netProfit, arpm } = useMemo(() => {
    let rev = 0;
    let exp = 0;
    
    filteredTransactions.forEach(t => {
      if (t.type === 'income') rev += Number(t.amount || 0);
      if (t.type === 'expense') exp += Number(t.amount || 0);
    });

    const profit = rev - exp;
    const avgRevenue = activeMembersCount > 0 ? (rev / activeMembersCount) : 0;

    return { totalRevenue: rev, totalExpenses: exp, netProfit: profit, arpm: avgRevenue };
  }, [filteredTransactions, activeMembersCount]);

  // Process data for charts based on time filter
  useEffect(() => {
    if (filteredTransactions.length === 0) {
      setChartData([]);
      return;
    }

    const groupedData: Record<string, { Pendapatan: number, Pengeluaran: number }> = {};

    filteredTransactions.forEach(t => {
      const date = new Date(t.created_at);
      let key = "";
      
      if (timeFilter === 'daily') {
        key = date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }); // e.g. "5 Jun"
      } else if (timeFilter === 'weekly') {
        const week = Math.ceil(date.getDate() / 7);
        key = `M${week} ${date.toLocaleDateString('id-ID', { month: 'short' })}`;
      } else if (timeFilter === 'monthly') {
        key = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }); // e.g. "Jun 2026"
      }

      if (!groupedData[key]) {
        groupedData[key] = { Pendapatan: 0, Pengeluaran: 0 };
      }
      
      if (t.type === 'income') {
        groupedData[key].Pendapatan += (t.amount || 0);
      } else {
        groupedData[key].Pengeluaran += (t.amount || 0);
      }
    });

    const chartArr = Object.keys(groupedData).map(key => ({
      name: key,
      Pendapatan: groupedData[key].Pendapatan,
      Pengeluaran: groupedData[key].Pengeluaran
    })).reverse();

    setChartData(chartArr);
  }, [filteredTransactions, timeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gymId) return;
    
    try {
      setIsSubmittingExpense(true);
      const { error } = await supabase.from('expenses').insert({
        gym_id: gymId,
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description,
        date: expenseForm.date,
        created_by: user.id
      });

      if (error) throw error;
      
      setShowExpenseModal(false);
      setExpenseForm({ amount: '', category: EXPENSE_CATEGORIES[0], description: '', date: new Date().toISOString().split('T')[0] });
      loadData(); // Reload all data
      
    } catch (err: any) {
      alert("Gagal mencatat pengeluaran: " + err.message);
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori/Paket', 'Keterangan', 'Admin', 'Nominal'];
    const rows = filteredTransactions.map(t => [
      new Date(t.created_at).toLocaleString('id-ID').replace(',', ''),
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.title}"`,
      `"${t.subtitle}"`,
      `"${t.created_by_name}"`,
      t.type === 'income' ? t.amount : `-${t.amount}`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />

        <div className="mb-[32px] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Laporan Keuangan</h1>
            <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Analisis Pemasukan, Pengeluaran, dan Laba Bersih</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-[12px] font-medium transition-colors shadow-sm"
            >
              <Plus size={16} />
              Catat Pengeluaran
            </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[32px]">
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
              <ArrowDownCircle size={18} className="text-red-500" />
              <p className="text-[13px] font-medium">Total Pengeluaran</p>
            </div>
            <h2 className="text-[24px] font-bold text-[var(--color-ink)] tracking-[-0.02em]">
              {loading ? '...' : formatCurrency(totalExpenses)}
            </h2>
          </div>

          <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-[#1a1c23] to-[#121318]' : 'from-red-950 to-red-900'} hairline-border rounded-[20px] p-[24px] shadow-xl relative overflow-hidden group`}>
             <div className="absolute -right-4 -top-4 text-white opacity-5 group-hover:scale-110 transition-transform duration-500">
              <DollarSign size={80} />
            </div>
            <p className="text-[13px] text-white/70 font-medium mb-[8px] relative z-10">Laba Bersih (Net Profit)</p>
            <h2 className="text-[28px] font-bold text-white tracking-[-0.02em] relative z-10">
              {loading ? '...' : formatCurrency(netProfit)}
            </h2>
          </div>

          <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[24px]">
            <div className="flex items-center gap-3 text-[var(--color-ink-subtle)] mb-2">
              <Users size={18} className="text-[var(--color-primary)]" />
              <p className="text-[13px] font-medium">ARPM (Avg Rev/Member)</p>
            </div>
            <h2 className="text-[24px] font-bold text-[var(--color-ink)] tracking-[-0.02em]">
              {loading ? '...' : formatCurrency(arpm)}
            </h2>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] p-[24px] mb-[32px]">
          <h3 className="text-[16px] font-semibold text-[var(--color-ink)] mb-[24px] flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--color-primary)]" />
            Grafik Pemasukan vs Pengeluaran
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
                  <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
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
              Riwayat Arus Kas
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  {['Tanggal', 'Kategori/Tipe', 'Keterangan', 'Admin/User', 'Nominal'].map(h => (
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
                      <td className="px-[24px] py-[16px]">
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-semibold w-fit px-2 py-1 rounded-full mb-1 ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                          <span className="text-[14px] font-medium text-[var(--color-ink)]">{t.title}</span>
                        </div>
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{t.subtitle}</td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">
                        {t.created_by_name}
                      </td>
                      <td className={`px-[24px] py-[16px] text-[14px] font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-[24px] py-[48px] text-center text-[var(--color-ink-muted)]">Tidak ada riwayat kas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--color-surface-1)] w-full max-w-md rounded-[24px] shadow-2xl border border-[var(--color-hairline)] overflow-hidden animate-fade-in">
              <div className="p-[24px] border-b border-[var(--color-hairline)] flex justify-between items-center bg-[var(--color-surface-2)]">
                <h3 className="text-[18px] font-semibold text-[var(--color-ink)] flex items-center gap-2">
                  <ArrowDownCircle className="text-red-500" size={20} />
                  Catat Pengeluaran
                </h3>
                <button onClick={() => setShowExpenseModal(false)} className="text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleExpenseSubmit} className="p-[24px] flex flex-col gap-[16px]">
                <div>
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Nominal Pengeluaran (Rp)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={expenseForm.amount} 
                    onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} 
                    className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" 
                    placeholder="Contoh: 150000" 
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Kategori (Baku)</label>
                  <select 
                    value={expenseForm.category} 
                    onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} 
                    className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px] outline-none"
                  >
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Keterangan Tambahan</label>
                  <input 
                    type="text" 
                    required
                    value={expenseForm.description} 
                    onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} 
                    className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" 
                    placeholder="Contoh: Beli sabun pel, token listrik" 
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Tanggal</label>
                  <input 
                    type="date" 
                    required
                    value={expenseForm.date} 
                    onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} 
                    className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" 
                  />
                </div>

                <div className="flex gap-[12px] pt-[16px] mt-[8px] border-t border-[var(--color-hairline)]">
                  <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-[14px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-semibold transition-colors focus-ring">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmittingExpense} className="flex-1 py-[14px] bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 rounded-[12px] font-semibold transition-colors focus-ring flex justify-center items-center gap-2">
                    {isSubmittingExpense ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {isSubmittingExpense ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
