'use client';

import { useState, useEffect } from 'react';
import { openShiftAction, closeShiftAction, getCurrentActiveShiftAction } from '@/app/actions/shifts';
import { Banknote, Lock, Unlock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ShiftManagerProps {
  adminId: string;
  children: React.ReactNode;
}

import { supabase } from '@/lib/supabase';

export function ShiftManager({ adminId, children }: ShiftManagerProps) {
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState<any>(null);
  
  // Open Shift Form
  const [openingCash, setOpeningCash] = useState('');
  const [openingSubmitting, setOpeningSubmitting] = useState(false);

  // Close Shift Form (Modal)
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingCash, setClosingCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [closingSubmitting, setClosingSubmitting] = useState(false);

  // Pos transactions total during shift
  const [salesDuringShift, setSalesDuringShift] = useState(0);
  const [breakdown, setBreakdown] = useState({
    posCash: 0,
    posQris: 0,
    subCash: 0,
    subQris: 0,
    expCash: 0
  });

  const router = useRouter();

  const loadShift = async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await getCurrentActiveShiftAction(adminId);
    if (res.success && res.data) {
      setActiveShift(res.data);
      
      const shiftStartTime = res.data.created_at;
      
      try {
        const [posRes, subRes, expRes] = await Promise.all([
          supabase.from('sales_transactions').select('total_amount, payment_method').eq('admin_id', adminId).gte('created_at', shiftStartTime),
          supabase.from('subscriptions').select('amount, payment_method').gte('created_at', shiftStartTime),
          supabase.from('expenses').select('amount').eq('created_by', adminId).gte('created_at', shiftStartTime)
        ]);

        let totalPosCash = 0;
        let totalPosQris = 0;
        posRes.data?.forEach(tx => {
          if (tx.payment_method === 'Cash') {
            totalPosCash += Number(tx.total_amount) || 0;
          } else if (tx.payment_method === 'QRIS') {
            totalPosQris += Number(tx.total_amount) || 0;
          }
        });

        let totalSubCash = 0;
        let totalSubQris = 0;
        subRes.data?.forEach(sub => {
          if (sub.payment_method === 'Cash') {
            totalSubCash += Number(sub.amount) || 0;
          } else if (sub.payment_method === 'QRIS') {
            totalSubQris += Number(sub.amount) || 0;
          }
        });

        let totalExpCash = 0;
        expRes.data?.forEach(exp => {
          totalExpCash += Number(exp.amount) || 0; // Assuming all expenses are cash taken from drawer
        });

        setBreakdown({
          posCash: totalPosCash,
          posQris: totalPosQris,
          subCash: totalSubCash,
          subQris: totalSubQris,
          expCash: totalExpCash
        });

        // Calculate Expected Physical Cash: POS Cash + Memberships Cash - Expenses Cash
        const netCashSales = totalPosCash + totalSubCash - totalExpCash;
        setSalesDuringShift(netCashSales);
      } catch (err) {
        console.error('Error fetching shift details:', err);
      }
      
    } else {
      setActiveShift(null);
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    if (adminId) {
      loadShift();
    }
  }, [adminId]);

  // Refresh data right before showing the close modal
  useEffect(() => {
    if (showCloseModal && adminId) {
      loadShift(true);
    }
  }, [showCloseModal]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      const formatted = new Intl.NumberFormat('id-ID').format(Number(val));
      setter(formatted);
    } else {
      setter('');
    }
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpeningSubmitting(true);
    const amount = Number(openingCash.replace(/[^0-9]/g, ''));
    const res = await openShiftAction(adminId, amount);
    setOpeningSubmitting(false);
    
    if (res.success) {
      setActiveShift(res.data);
    } else {
      alert(res.error);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    setClosingSubmitting(true);
    const amount = Number(closingCash.replace(/[^0-9]/g, ''));
    
    // Expected cash = starting cash + sales (assuming all sales are cash for simplicity, or we should separate Cash vs QRIS)
    // For now we just use starting_cash as expected if we don't calculate sales here.
    const expected = Number(activeShift.starting_cash) + salesDuringShift;

    const res = await closeShiftAction(activeShift.id, amount, expected, closingNotes);
    setClosingSubmitting(false);

    if (res.success) {
      setShowCloseModal(false);
      setActiveShift(null);
      // Optional: Redirect to dashboard after closing
      router.push('/admin/dashboard');
    } else {
      alert(res.error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!activeShift) {
    // Show "Buka Kasir" screen
    return (
      <div className="max-w-md mx-auto mt-12 bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Unlock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Buka Kasir (Shift)</h2>
        <p className="text-gray-400 mb-8 text-sm">Anda harus membuka kasir dan memasukkan modal awal (uang kembalian) sebelum bisa melakukan transaksi POS.</p>

        <form onSubmit={handleOpenShift} className="text-left space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Modal Awal / Uang Laci (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="text"
                required
                value={openingCash}
                onChange={(e) => handleAmountChange(e, setOpeningCash)}
                className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-2)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholder="100.000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Masukkan nominal uang fisik yang saat ini ada di laci kasir.</p>
          </div>

          <button
            type="submit"
            disabled={openingSubmitting || !openingCash}
            className="w-full mt-4 py-3 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {openingSubmitting ? 'Memproses...' : 'Buka Kasir Sekarang'}
          </button>
        </form>
      </div>
    );
  }

  // Active shift exists -> render POS + injected Tutup Kasir button
  return (
    <>
      <div className="flex justify-between items-center bg-[var(--color-surface-1)] p-4 rounded-xl border border-white/5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Status Shift Kasir</p>
            <p className="font-bold text-green-400">AKTIF / TERBUKA</p>
          </div>
        </div>
        <button
          onClick={() => setShowCloseModal(true)}
          className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg font-medium transition-colors border border-red-500/20"
        >
          Tutup Kasir
        </button>
      </div>

      {children}

      {/* Close Shift Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface-1)] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-white/5 shrink-0">
              <h3 className="text-xl font-semibold text-white">Tutup Kasir</h3>
              <button onClick={() => setShowCloseModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCloseShift} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-white/5 mb-4 text-sm space-y-3">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Modal Awal Laci</span>
                  <span className="font-semibold text-white">Rp {Number(activeShift.starting_cash).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300 pt-2 border-t border-white/5">
                  <span>Pemasukan Tunai (Cash)</span>
                  <span className="font-semibold text-green-400">+ Rp {(breakdown.posCash + breakdown.subCash).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Pemasukan QRIS <span className="text-xs text-gray-500">(Masuk Bank)</span></span>
                  <span className="font-semibold text-blue-400">Rp {(breakdown.posQris + breakdown.subQris).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300 border-b border-white/10 pb-3">
                  <span>Pengeluaran Tunai</span>
                  <span className="font-semibold text-red-400">- Rp {breakdown.expCash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-200 mt-2 pt-2 border-t border-white/10">
                  <span>Target Uang Fisik (Laci)</span>
                  <span className="font-bold text-[var(--color-primary)] text-base">Rp {(Number(activeShift.starting_cash) + breakdown.posCash + breakdown.subCash - breakdown.expCash).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-4">
                <p className="text-xs text-blue-200 leading-relaxed">
                  Hitung seluruh uang fisik yang ada di laci kasir saat ini, pastikan sesuai dengan <b>Target Uang Fisik</b> di atas, lalu masukkan nominalnya di bawah.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Total Uang Fisik (Laci) (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="text"
                    required
                    value={closingCash}
                    onChange={(e) => handleAmountChange(e, setClosingCash)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-2)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="Contoh: 1.500.000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Catatan (Opsional)</label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors min-h-[80px]"
                  placeholder="Misal: Uang receh kurang 2000"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 py-3 px-4 bg-[var(--color-surface-2)] hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={closingSubmitting || !closingCash}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {closingSubmitting ? 'Memproses...' : 'Tutup Kasir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
