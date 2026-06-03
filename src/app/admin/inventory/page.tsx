'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { PackageSearch, Plus, CheckCircle, XCircle, Image as ImageIcon, Edit2, Check, X } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
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
  const [newProductStock, setNewProductStock] = useState('0');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Stock State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<string>('');

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2MB. Silakan kompres foto Anda terlebih dahulu.");
        e.target.value = '';
        return;
      }
      setNewProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.gymId || user.role !== 'Owner') return;
    
    setSubmitting(true);
    try {
      let imageUrl = null;

      // Upload Image if selected
      if (newProductImage) {
        const fileExt = newProductImage.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.gymId}/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('product-images')
          .upload(filePath, newProductImage);

        if (uploadError) {
          throw new Error('Gagal mengunggah foto: ' + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('products')
        .insert({
          gym_id: user.gymId,
          name: newProductName,
          price: parseInt(newProductPrice.replace(/\D/g, '')),
          stock: parseInt(newProductStock.replace(/\D/g, '')) || 0,
          image_url: imageUrl,
          is_active: true
        });
        
      if (error) throw error;
      
      // Reset & refresh
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('0');
      setNewProductImage(null);
      setImagePreview(null);
      setShowForm(false);
      await fetchProducts();
    } catch (error: any) {
      console.error('Error adding product:', error);
      alert(error.message || 'Gagal menambah barang');
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

  const startEditStock = (id: string, currentStock: number) => {
    setEditingStockId(id);
    setEditStockValue(currentStock.toString());
  };

  const saveStock = async (id: string) => {
    if (user?.role !== 'Owner') return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: parseInt(editStockValue) || 0 })
        .eq('id', id);
      if (error) throw error;
      setEditingStockId(null);
      await fetchProducts();
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Gagal update stok");
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
              Data Barang & Stok
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Kelola daftar produk, harga, dan stok gudang. 
              {user?.role === 'Admin' ? ' (Admin Hanya melihat)' : ''}
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
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                 <div className="w-full md:w-32 flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-[var(--color-surface-2)] overflow-hidden relative group cursor-pointer" onClick={() => document.getElementById('productImage')?.click()}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-500 group-hover:text-[var(--color-primary)] transition-colors" size={32} />
                    )}
                  </div>
                  <label htmlFor="productImage" className="text-xs text-[var(--color-primary)] cursor-pointer text-center font-medium">Opsional (Max 2MB)</label>
                  <input type="file" id="productImage" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex-1 w-full">
                    <label className="block text-sm text-gray-400 mb-2">Nama Barang</label>
                    <input
                      type="text"
                      required
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Misal: Whey Protein 5lbs"
                      className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 w-full">
                      <label className="block text-sm text-gray-400 mb-2">Harga Jual (Rp)</label>
                      <input
                        type="text"
                        required
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        placeholder="Misal: 1500000"
                        className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    <div className="w-full md:w-1/3">
                      <label className="block text-sm text-gray-400 mb-2">Stok Awal</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newProductStock}
                        onChange={(e) => setNewProductStock(e.target.value)}
                        className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end mt-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Barang'}
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
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300 w-24">Foto</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300">Nama Barang</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300">Harga Jual</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300 w-32">Sisa Stok</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-300">Status</th>
                    {user?.role === 'Owner' && (
                      <th className="px-6 py-4 font-semibold text-sm text-gray-300 text-right">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-2)] border border-white/10 overflow-hidden flex items-center justify-center">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="text-gray-600" size={20} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-green-400 font-medium">{formatRp(item.price)}</td>
                      <td className="px-6 py-4">
                        {editingStockId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(e.target.value)}
                              className="w-16 bg-[var(--color-canvas)] border border-[var(--color-primary)] rounded px-2 py-1 text-sm outline-none"
                            />
                            <button onClick={() => saveStock(item.id)} className="text-green-500 hover:text-green-400">
                              <Check size={16} />
                            </button>
                            <button onClick={() => setEditingStockId(null)} className="text-gray-500 hover:text-gray-400">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${item.stock <= 0 ? 'text-red-500' : 'text-white'}`}>
                              {item.stock}
                            </span>
                            {user?.role === 'Owner' && (
                              <button onClick={() => startEditStock(item.id, item.stock)} className="text-gray-500 hover:text-[var(--color-primary)] transition-colors p-1">
                                <Edit2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.is_active ? (
                          item.stock > 0 ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              <CheckCircle size={12} /> Tersedia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              Habis
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle size={12} /> Nonaktif
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
