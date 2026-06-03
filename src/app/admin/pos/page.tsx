'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

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
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
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
    if (!user?.gymId || !user.id || cart.length === 0) return;
    
    setProcessing(true);
    try {
      // 1. Insert Transaction
      const { data: trxData, error: trxError } = await supabase
        .from('sales_transactions')
        .insert({
          gym_id: user.gymId,
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
      
      // Success
      setCart([]);
      setShowSuccess(true);
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
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center p-12 bg-[var(--color-surface-1)] border border-white/5 rounded-2xl">
                <p className="text-gray-400">Belum ada barang jualan yang aktif.</p>
                {user?.role === 'Owner' && (
                  <button onClick={() => router.push('/admin/inventory')} className="mt-4 text-[var(--color-primary)] hover:underline">
                    Tambah di Data Barang
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] border border-white/5 hover:border-[var(--color-primary)]/50 rounded-2xl p-4 text-left transition-all shadow-lg focus-ring group"
                  >
                    <div className="font-semibold text-gray-100 mb-2 line-clamp-2 min-h-[40px] group-hover:text-[var(--color-primary)] transition-colors">
                      {product.name}
                    </div>
                    <div className="text-green-400 font-bold">
                      {formatRp(product.price)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Keranjang Kanan */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-3xl p-6 shadow-2xl sticky top-[24px]">
              <h2 className="text-xl font-bold flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                Keranjang
                <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-3 py-1 rounded-full text-sm">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item
                </span>
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Keranjang masih kosong</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex flex-col gap-2 p-3 bg-[var(--color-surface-2)] rounded-xl">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-gray-200 line-clamp-1 flex-1">{item.name}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-400 ml-2">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 text-sm font-semibold">{formatRp(item.price * item.quantity)}</span>
                          <div className="flex items-center gap-3 bg-[var(--color-canvas)] rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-400 hover:text-white rounded-md">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-400 hover:text-white rounded-md">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-6">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-gray-400">Total Pembayaran</span>
                      <span className="text-2xl font-bold text-green-400">{formatRp(totalAmount)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button
                        onClick={() => setPaymentMethod('Cash')}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 font-medium border transition-all ${
                          paymentMethod === 'Cash' 
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' 
                            : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <Banknote size={18} /> Cash
                      </button>
                      <button
                        onClick={() => setPaymentMethod('QRIS')}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 font-medium border transition-all ${
                          paymentMethod === 'QRIS' 
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' 
                            : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <CreditCard size={18} /> QRIS
                      </button>
                    </div>

                    <button
                      onClick={processPayment}
                      disabled={processing || showSuccess}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                        showSuccess 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-black hover:bg-gray-200 disabled:opacity-50'
                      }`}
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          Memproses...
                        </>
                      ) : showSuccess ? (
                        <>
                          <CheckCircle size={20} /> Berhasil!
                        </>
                      ) : (
                        <>
                          <Receipt size={20} /> Bayar Sekarang
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
