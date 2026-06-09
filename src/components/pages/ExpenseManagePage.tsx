'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Wallet, Plus, Trash2, Calendar, Search, X } from 'lucide-react';
import { getExpensesAction, getExpenseCategoriesAction, addExpenseAction, deleteExpenseAction } from '@/app/actions/expenses';

export default function ExpenseManagePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    customCategory: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const [expRes, catRes] = await Promise.all([
        getExpensesAction(),
        getExpenseCategoriesAction()
      ]);

      if (expRes.success) setExpenses(expRes.data);
      if (catRes.success) {
        // Default standard categories if none exist
        const standardCats = ['Listrik', 'Gaji', 'Air Minum', 'Kebersihan', 'Maintenance Alat'];
        const merged = Array.from(new Set([...standardCats, ...catRes.categories]));
        setCategories(merged);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      const formatted = new Intl.NumberFormat('id-ID').format(Number(val));
      setFormData({ ...formData, amount: formatted });
    } else {
      setFormData({ ...formData, amount: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const finalCategory = formData.category === 'Lainnya' ? formData.customCategory : formData.category;
    if (!finalCategory) {
      alert('Kategori wajib diisi');
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('amount', formData.amount);
    fd.append('category', finalCategory);
    fd.append('date', formData.date);
    fd.append('description', formData.description);
    fd.append('createdBy', user.id);

    const res = await addExpenseAction(fd);
    setSubmitting(false);

    if (res.success) {
      setShowModal(false);
      setFormData({ amount: '', category: '', customCategory: '', date: new Date().toISOString().split('T')[0], description: '' });
      loadData();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
      const res = await deleteExpenseAction(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error);
      }
    }
  };

  const formatRp = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] text-white">
        <DashboardHeader />

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-100 flex items-center gap-3">
              <Wallet className="text-[var(--color-primary)]" size={28} />
              Pengeluaran
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Catat semua pengeluaran operasional gym</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-medium transition-colors"
          >
            <Plus size={20} /> Tambah Pengeluaran
          </button>
        </div>

        <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl overflow-hidden">
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-3 p-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl"></div>
              ))
            ) : expenses.length > 0 ? (
              expenses.map((exp) => (
                <div key={exp.id} className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-1 bg-white/10 rounded-md text-[11px] font-medium text-gray-200 mb-2 inline-block">
                        {exp.category}
                      </span>
                      <div className="text-sm text-gray-300 font-medium line-clamp-2">
                        {exp.description || '-'}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="font-bold text-red-400 text-[15px]">
                        -{formatRp(exp.amount)}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-white/5 mt-1">
                    <button 
                      onClick={() => handleDelete(exp.id)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 text-sm">Belum ada data pengeluaran</div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Keterangan</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Nominal</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-white/5 animate-pulse rounded w-full"></div></td>
                    </tr>
                  ))
                ) : expenses.length > 0 ? (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-200">
                        <span className="px-2 py-1 bg-white/10 rounded-md">{exp.category}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{exp.description || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-400 text-right">
                        -{formatRp(exp.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(exp.id)} className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Belum ada data pengeluaran</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface-1)] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-xl font-semibold text-white">Tambah Pengeluaran</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nominal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="text"
                    required
                    value={formData.amount}
                    onChange={handleAmountChange}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-2)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="150.000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Kategori</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="Lainnya">Lainnya (Ketik sendiri)...</option>
                </select>
              </div>

              {formData.category === 'Lainnya' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nama Kategori Baru</label>
                  <input
                    type="text"
                    required
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="Contoh: Beli Kipas Angin"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Keterangan (Opsional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors min-h-[100px]"
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-[var(--color-surface-2)] hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
