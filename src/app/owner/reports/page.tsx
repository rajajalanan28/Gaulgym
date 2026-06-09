'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Sidebar } from '@/components/Sidebar';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { supabase } from '@/lib/supabase';
import { Loader2, TrendingUp, DollarSign, Package, Wallet } from 'lucide-react';

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPos: 0, totalSub: 0, totalAll: 0, totalExpense: 0, netProfit: 0 });

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {

      const { data: posData, error: posError } = await supabase
        .from('sales_transactions')
        .select('created_at, total_amount')
        .order('created_at', { ascending: true });
        
      if (posError) throw posError;

      // Fetch Subscriptions with package price
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          created_at,
          amount
        `)
        .order('created_at', { ascending: true });

      if (subError) throw subError;

      // Fetch Expenses
      const { data: expData, error: expError } = await supabase
        .from('expenses')
        .select('date, amount')
        .order('date', { ascending: true });

      if (expError) throw expError;

      // Aggregate by month (YYYY-MM)
      const monthlyData: Record<string, { posRevenue: number, subscriptionRevenue: number, expense: number }> = {};
      
      // Initialize last 6 months
      const d = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(d.getFullYear(), d.getMonth() - i, 1);
        const monthStr = month.toISOString().substring(0, 7); // YYYY-MM
        monthlyData[monthStr] = { posRevenue: 0, subscriptionRevenue: 0, expense: 0 };
      }

      let totalPos = 0;
      let totalSub = 0;
      let totalExpense = 0;

      posData?.forEach((tx: any) => {
        const monthStr = tx.created_at.substring(0, 7);
        if (monthlyData[monthStr]) {
          monthlyData[monthStr].posRevenue += Number(tx.total_amount) || 0;
        }
        totalPos += Number(tx.total_amount) || 0;
      });

      subData?.forEach((sub: any) => {
        const monthStr = sub.created_at.substring(0, 7);
        if (monthlyData[monthStr]) {
          monthlyData[monthStr].subscriptionRevenue += Number(sub.amount) || 0;
        }
        totalSub += Number(sub.amount) || 0;
      });

      expData?.forEach((exp: any) => {
        const monthStr = exp.date.substring(0, 7);
        if (monthlyData[monthStr]) {
          monthlyData[monthStr].expense += Number(exp.amount) || 0;
        }
        totalExpense += Number(exp.amount) || 0;
      });

      const totalAll = totalPos + totalSub;
      const netProfit = totalAll - totalExpense;

      const formattedData = Object.keys(monthlyData).sort().map(key => {
        const [year, month] = key.split('-');
        const date = new Date(Number(year), Number(month) - 1, 1);
        const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        
        const tr = monthlyData[key].posRevenue + monthlyData[key].subscriptionRevenue;
        const ex = monthlyData[key].expense;

        return {
          month: monthName,
          posRevenue: monthlyData[key].posRevenue,
          subscriptionRevenue: monthlyData[key].subscriptionRevenue,
          totalRevenue: tr,
          expense: ex,
          netProfit: tr - ex
        };
      });

      // Show only last 6 months
      setData(formattedData.slice(-6));
      setStats({ totalPos, totalSub, totalAll, totalExpense, netProfit });

    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  if (authLoading) return <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center"><Loader2 className="animate-spin text-[var(--color-primary)]" size={32} /></div>;

  return (
    <div className="flex h-screen bg-[var(--color-canvas)] overflow-hidden text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-[32px]">
          <div className="max-w-[1200px] mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="text-[var(--color-primary)]" />
                Laporan Keuangan
              </h1>
              <p className="text-sm text-gray-400 mt-2">Ringkasan pendapatan, pengeluaran, dan laba bersih (Net Profit) Gym Anda.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--color-primary)]" size={32} /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Transaksi Kasir</p>
                        <h3 className="text-lg font-bold">{formatCurrency(stats.totalPos)}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Paket Member</p>
                        <h3 className="text-lg font-bold">{formatCurrency(stats.totalSub)}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                        <Wallet size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Pengeluaran</p>
                        <h3 className="text-lg font-bold text-red-400">-{formatCurrency(stats.totalExpense)}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-2xl p-6 border border-white/10 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Laba Bersih (Net Profit)</p>
                        <h3 className="text-xl font-bold text-white">{formatCurrency(stats.netProfit)}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold mb-6">Grafik Laba Bersih (6 Bulan Terakhir)</h3>
                  <RevenueChart data={data} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
