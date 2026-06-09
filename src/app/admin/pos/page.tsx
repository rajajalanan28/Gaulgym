'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, CreditCard, Banknote, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

import { ShiftManager } from '@/components/ShiftManager';

export default function POSPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('Cash');
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    const init = async () => {
      if (!user) return;
      fetchProducts();
    };
    init();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.stock) return item; // Cannot exceed stock
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatRp = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const processPayment = async () => {
    if (!user?.id || cart.length === 0) return;
    
    setProcessing(true);
    try {
      // 1. Insert Transaction
      const { data: trxData, error: trxError } = await supabase
        .from('sales_transactions')
        .insert({
          admin_id: user.id,
          total_amount: totalAmount,
          payment_method: paymentMethod
        })
        .select()
        .single();
        
      if (trxError) throw trxError;
      
      // 2. Insert Items
      const itemsToInsert = cart.map(item => ({
        transaction_id: trxData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('sales_items')
        .insert(itemsToInsert);
        
      if (itemsError) throw itemsError;

      // 3. Deduct Stock
      await Promise.all(cart.map(item => {
        const newStock = item.stock - item.quantity;
        return supabase
          .from('products')
          .update({ stock: newStock > 0 ? newStock : 0 })
          .eq('id', item.id);
      }));
      
      // Success
      setCart([]);
      setShowSuccess(true);
      await fetchProducts(); // Refresh products to get new stock
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Gagal memproses pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1400px] mx-auto min-h-screen bg-[var(--color-canvas)] text-white">
        <DashboardHeader />
        
        {user?.id ? (
          <ShiftManager adminId={user.id}>
            <div className="mb-8">
              <h1 className="text-[28px] font-semibold text-gray-100 flex items-center gap-3">
                <ShoppingCart className="text-[var(--color-primary)]" size={28} />
                Kasir Jualan
              </h1>
              <p className="text-gray-400 mt-2 text-sm">
                Klik barang untuk memasukkan ke keranjang belanja
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Barang Kiri */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6 min-h-[600px]">
              <h2 className="text-lg font-semibold mb-6">Pilih Barang</h2>
              
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center p-12">
                  <p className="text-gray-400">Belum ada barang yang aktif.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {products.map((item) => {
                    const isOutOfStock = item.stock <= 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        disabled={isOutOfStock}
                        className={`bg-[var(--color-surface-2)] border ${isOutOfStock ? 'border-red-500/50 opacity-50 cursor-not-allowed' : 'border-white/5 hover:border-[var(--color-primary)] hover:bg-white/5 cursor-pointer'} rounded-xl text-left overflow-hidden transition-all group relative flex flex-col`}
                      >
                        <div className="h-32 w-full bg-[var(--color-surface-1)] flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${isOutOfStock ? 'grayscale' : ''}`} />
                          ) : (
                            <ImageIcon className="text-gray-600" size={32} />
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-medium text-sm text-gray-200 line-clamp-2 leading-tight mb-2 flex-1">{item.name}</h3>
                          <p className="text-[var(--color-primary)] font-bold text-sm">{formatRp(item.price)}</p>
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-bold">
                          {isOutOfStock ? (
                            <span className="text-red-400">Habis</span>
                          ) : (
                            <span className="text-green-400">Sisa {item.stock}</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Keranjang Belanja Kanan */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6 sticky top-8 shadow-2xl flex flex-col max-h-[calc(100vh-200px)] overflow-hidden">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Receipt size={20} className="text-[var(--color-primary)]" />
                Keranjang Belanja
              </h2>
              
              {/* List Keranjang */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                    <ShoppingCart size={48} className="opacity-20" />
                    <p className="text-sm">Belum ada barang dipilih</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="bg-[var(--color-surface-2)] p-3 rounded-xl flex items-center gap-3 group">
                      <div className="w-12 h-12 rounded bg-[var(--color-surface-1)] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-600" size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-200 truncate" title={item.name}>{item.name}</h4>
                        <p className="text-xs text-[var(--color-primary)]">{formatRp(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-[var(--color-surface-1)] rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:text-[var(--color-primary)] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 hover:text-[var(--color-primary)] transition-colors disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total & Checkout */}
              <div className="pt-4 border-t border-white/10 space-y-4 shrink-0">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-green-400">{formatRp(totalAmount)}</span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Metode Pembayaran</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod('Cash')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border ${paymentMethod === 'Cash' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                    >
                      <Banknote size={16} /> Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('QRIS')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border ${paymentMethod === 'QRIS' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                    >
                      <CreditCard size={16} /> QRIS
                    </button>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  disabled={cart.length === 0 || processing}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? 'Memproses...' : 'Selesaikan Pembayaran'}
                </button>
                
                {showSuccess && (
                  <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 py-2 rounded-lg text-sm font-medium animate-fade-in">
                    <CheckCircle size={16} /> Transaksi Berhasil!
                  </div>
                )}
              </div>
            </div>
          </div>
            </div>
          </ShiftManager>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
