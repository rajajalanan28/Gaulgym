'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { PlusCircle, Loader2, Edit, Trash2, Power, PowerOff, PackageSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  gym_id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
}

export default function ProductManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProducts = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/products/seed', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert('Berhasil membuat produk contoh!');
      fetchProducts();
    } catch (error: any) {
      alert('Gagal membuat produk contoh: ' + error.message);
      setLoading(false);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
        
      if (error) throw error;
      
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal mengupdate status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Gagal menghapus produk');
    }
  };

  const formatRp = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1400px] mx-auto min-h-screen bg-[var(--color-canvas)]">
        <DashboardHeader />
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-ink)] flex items-center gap-3">
              <PackageSearch className="text-[var(--color-primary)]" size={28} />
              Manajemen Produk
            </h1>
            <p className="text-[var(--color-ink-muted)] mt-2 text-[15px]">
              Kelola stok barang dan harga untuk kasir POS
            </p>
          </div>
          
          <div className="flex gap-3">
            {!loading && products.length === 0 && (
              <button
                onClick={handleSeedProducts}
                className="flex items-center gap-2 bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl transition-colors text-sm font-semibold border border-blue-500/20"
              >
                Isi Produk Contoh
              </button>
            )}
            
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-xl transition-colors text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/20"
            >
              <PlusCircle size={18} />
              Tambah Produk
            </button>
          </div>
        </div>

        <div className="bg-[var(--color-surface-1)] hairline-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-2)]">
                  <th className="px-6 py-4 text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Nama Produk</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-hairline)]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 size={24} className="animate-spin mx-auto text-[var(--color-primary)]" />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-ink-muted)]">
                      Belum ada produk. Klik tombol "Isi Produk Contoh" di atas atau tambah manual.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--color-ink)]">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-primary)] font-semibold">
                        {formatRp(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock <= 5 ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-surface-3)] text-[var(--color-ink)]'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(product)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            product.is_active 
                              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                              : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                          }`}
                        >
                          {product.is_active ? <Power size={14} /> : <PowerOff size={14} />}
                          {product.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--color-surface-1)] hairline-border w-full max-w-[400px] rounded-[16px] shadow-2xl overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-[var(--color-hairline)] flex justify-between items-center bg-[var(--color-surface-2)]">
                <h2 className="text-[16px] font-bold text-[var(--color-ink)]">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                </h2>
              </div>
              
              <form id="product-form" onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink)]">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-hairline)] rounded-lg px-3 py-2.5 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="Contoh: Air Mineral"
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink)]">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-hairline)] rounded-lg px-3 py-2.5 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="Contoh: 5000"
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium mb-1.5 text-[var(--color-ink)]">Stok Awal</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-hairline)] rounded-lg px-3 py-2.5 text-[14px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="Contoh: 50"
                  />
                </div>
              </form>
              
              <div className="px-5 py-4 border-t border-[var(--color-hairline)] bg-[var(--color-surface-2)] flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-3)] transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="product-form"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingProduct ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
