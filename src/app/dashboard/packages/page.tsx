"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Package, Plus, Edit2, Check, X, Trash2, Tag, Loader2 } from "lucide-react";

interface DbPackage {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  price_display: string;
  features: string[];
  color: string;
  is_active: boolean;
  sort_order: number;
}

const colorOptions = [
  { value: 'blue', label: 'Biru (Standard)' },
  { value: 'amber', label: 'Emas (Premium)' },
  { value: 'green', label: 'Hijau (Basic)' },
  { value: 'purple', label: 'Ungu (VIP)' },
  { value: 'red', label: 'Merah (Harian)' },
];

export default function PackagesManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<DbPackage[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_days: 30,
    price: 150000,
    price_display: '150 Ribu',
    featuresText: '', // Will be split by newline
    color: 'green',
    is_active: true,
    sort_order: 1
  });

  const loadPackages = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [user]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      duration_days: 30,
      price: 150000,
      price_display: '150 Ribu',
      featuresText: 'Akses Semua Alat\nBebas Jam Kunjungan',
      color: 'green',
      is_active: true,
      sort_order: packages.length + 1
    });
    setShowModal(true);
  };

  const openEditModal = (pkg: DbPackage) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      duration_days: pkg.duration_days,
      price: pkg.price,
      price_display: pkg.price_display,
      featuresText: pkg.features ? pkg.features.join('\n') : '',
      color: pkg.color || 'blue',
      is_active: pkg.is_active,
      sort_order: pkg.sort_order
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      name: formData.name,
      description: formData.description,
      duration_days: formData.duration_days,
      price: formData.price,
      price_display: formData.price_display,
      features: formData.featuresText.split('\n').map(f => f.trim()).filter(f => f),
      color: formData.color,
      is_active: formData.is_active,
      sort_order: formData.sort_order
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('packages').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('packages').insert([payload]);
        if (error) throw error;
      }
      
      setShowModal(false);
      loadPackages();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan paket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (pkgId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('packages').update({ is_active: !currentStatus }).eq('id', pkgId);
      if (error) throw error;
      setPackages(packages.map(p => p.id === pkgId ? { ...p, is_active: !currentStatus } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'amber': return 'from-amber-400 to-yellow-600';
      case 'green': return 'from-green-400 to-emerald-600';
      case 'purple': return 'from-purple-400 to-indigo-600';
      case 'red': return 'from-red-400 to-rose-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[32px] gap-[16px]">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Manajemen Harga & Paket</h1>
            <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola jenis membership yang dijual di cabang Anda.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-[20px] py-[12px] rounded-[12px] font-medium transition-colors shadow-lg shadow-[var(--color-primary)]/20 focus-ring"
          >
            <Plus size={18} />
            Tambah Paket
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--color-primary)]" size={32} /></div>
        ) : packages.length === 0 ? (
          <div className="bg-[var(--color-surface-1)] hairline-border rounded-[24px] p-[64px] text-center">
            <Package size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4 opacity-30" />
            <h3 className="text-[18px] font-semibold text-[var(--color-ink)]">Belum Ada Paket</h3>
            <p className="text-[var(--color-ink-muted)] mt-2">Buat paket membership harian atau bulanan pertama Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {packages.map(pkg => (
              <div key={pkg.id} className={`bg-[var(--color-surface-1)] border ${pkg.is_active ? 'border-[var(--color-hairline)]' : 'border-red-500/20 opacity-70'} rounded-[24px] overflow-hidden transition-all hover:shadow-xl group`}>
                {/* Header Card */}
                <div className={`h-[120px] bg-gradient-to-br ${getColorClass(pkg.color)} p-[24px] flex flex-col justify-between relative`}>
                  <div className="flex justify-between items-start">
                    <span className="bg-white/20 text-white px-[12px] py-[4px] rounded-full text-[12px] font-semibold backdrop-blur-sm">
                      {pkg.duration_days} Hari
                    </span>
                    {!pkg.is_active && (
                      <span className="bg-red-500 text-white px-[12px] py-[4px] rounded-full text-[12px] font-bold">Nonaktif</span>
                    )}
                  </div>
                  <h3 className="text-[24px] font-bold text-white tracking-[-0.02em]">{pkg.name}</h3>
                </div>

                {/* Body Card */}
                <div className="p-[24px]">
                  <div className="flex items-end gap-[8px] mb-[16px]">
                    <span className="text-[32px] font-bold text-[var(--color-ink)] tracking-[-0.04em] leading-none">
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>
                  
                  <p className="text-[14px] text-[var(--color-ink-subtle)] mb-[24px] line-clamp-2">
                    {pkg.description || 'Tidak ada deskripsi.'}
                  </p>

                  <div className="space-y-[12px] mb-[32px]">
                    {pkg.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-[12px]">
                        <div className="mt-[2px] w-[16px] h-[16px] rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </div>
                        <span className="text-[14px] text-[var(--color-ink-muted)]">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-[12px] pt-[20px] border-t border-[var(--color-hairline)] mt-auto">
                    <button 
                      onClick={() => openEditModal(pkg)}
                      className="flex-1 py-[10px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[10px] text-[13px] font-semibold transition-colors flex justify-center items-center gap-2"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => toggleStatus(pkg.id, pkg.is_active)}
                      className={`flex-1 py-[10px] rounded-[10px] text-[13px] font-semibold transition-colors flex justify-center items-center gap-2 ${pkg.is_active ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-green-500 bg-green-500/10 hover:bg-green-500/20'}`}
                    >
                      {pkg.is_active ? <X size={14} /> : <Check size={14} />} 
                      {pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[var(--color-surface-1)] w-full max-w-2xl rounded-[24px] border border-[var(--color-hairline)] shadow-2xl my-8">
            <div className="p-[24px] border-b border-[var(--color-hairline)] flex justify-between items-center sticky top-0 bg-[var(--color-surface-1)] rounded-t-[24px] z-10">
              <h3 className="text-[20px] font-bold text-[var(--color-ink)] tracking-[-0.01em]">
                {editingId ? 'Edit Paket Membership' : 'Tambah Paket Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-2)] p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-[24px] space-y-[24px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Nama Paket</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" placeholder="Contoh: Paket 1 Bulan" />
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Harga (Rp)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" />
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Masa Berlaku (Hari)</label>
                  <input type="number" required value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: Number(e.target.value)})} className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" placeholder="Contoh: 30" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Fitur (Pisahkan dengan Enter)</label>
                  <textarea rows={4} value={formData.featuresText} onChange={e => setFormData({...formData, featuresText: e.target.value})} className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]" placeholder="Akses semua alat&#10;Bebas jam kunjung" />
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Status Aktif</label>
                  <div className="flex items-center h-[46px]">
                    <label className="flex items-center gap-[12px] cursor-pointer">
                      <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-[20px] h-[20px] accent-[var(--color-primary)] rounded-[6px]" />
                      <span className="text-[15px] font-medium text-[var(--color-ink)]">Tampilkan untuk Member</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-[12px] pt-[24px] border-t border-[var(--color-hairline)]">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-[14px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-semibold transition-colors focus-ring">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-[14px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 rounded-[12px] font-semibold transition-colors focus-ring flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Tag size={18} />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </ProtectedRoute>
  );
}
