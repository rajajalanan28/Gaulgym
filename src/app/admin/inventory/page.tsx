'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { PackageSearch, Plus, CheckCircle, XCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.gymId) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user?.gymId) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('gym_id', user.gymId)
        .order('name');
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.gymId || user.role !== 'Owner') return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          gym_id: user.gymId,
          name: newProductName,
          price: parseInt(newProductPrice.replace(/\D/g, '')),
          is_active: true
        });
        
      if (error) throw error;
      
      // Reset & refresh
      setNewProductName('');
      setNewProductPrice('');
      setShowForm(false);
      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Gagal menambah barang');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    if (user?.role !== 'Owner') return;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  // Format Rp
  const formatRp = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] text-white">
        <DashboardHeader />
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-100 flex items-center gap-3">
              <PackageSearch className="text-[var(--color-primary)]" size={28} />
              Data Barang Jualan
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Kelola daftar minuman, suplemen, dan aksesoris gym. 
              {user?.role === 'Admin' ? ' (Hanya melihat)' : ''}
            </p>
          </div>
          
          {user?.role === 'Owner' && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={20} /> Tambah Barang
            </button>
          )}
        </div>

        {showForm && user?.role === 'Owner' && (
          <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6 mb-8 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Input Barang Baru</h2>
            <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm text-gray-400 mb-2">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Misal: Air Mineral 600ml"
                  className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm text-gray-400 mb-2">Harga Jual (Rp)</label>
                <input
                  type="text"
                  required
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="Misal: 5000"
                  className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl font-medium text-gray-400 hover:bg-white/5 transition-colors flex-1 md:flex-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex-1 md:flex-none"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-12 bg-[var(--color-surface-1)] border border-white/5 rounded-2xl">
            <PackageSearch size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">Belum ada barang jualan yang terdaftar.</p>
          </div>
        ) : (
          <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-surface-2)]">
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300 w-16">No</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300">Nama Barang</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300">Harga Jual</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300">Status</th>
                    {user?.role === 'Owner' && (
                      <th className="px-6 py-4 font-semibold text-sm text-gray-300 text-right">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((item, index) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-green-400">{formatRp(item.price)}</td>
                      <td className="px-6 py-4">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle size={12} /> Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle size={12} /> Kosong / Nonaktif
                          </span>
                        )}
                      </td>
                      {user?.role === 'Owner' && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleProductStatus(item.id, item.is_active)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              item.is_active 
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            }`}
                          >
                            {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
