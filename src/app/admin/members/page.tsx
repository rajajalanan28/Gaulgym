"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { PlusCircle, X, Loader2 } from "lucide-react";

interface MemberData {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  joinDate: string;
  status: "active" | "inactive" | "expired";
  photoUrl: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<MemberData[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    if (!user) return;
    const gymId = user.gymId || 'dummy-gym-id';

    try {
      // 1. Ambil data members
      const { data: membersData, error: memError } = await supabase
        .from('members')
        .select('*')
        .eq('gym_id', gymId);
        
      if (memError) throw memError;

      // 2. Ambil data subscriptions
      const { data: subsData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('gym_id', gymId)
        .in('status', ['active', 'expired']);
        
      if (subError) throw subError;

      // 3. Ambil data packages
      const { data: pkgData, error: pkgError } = await supabase
        .from('packages')
        .select('*')
        .eq('gym_id', gymId);

      if (pkgError) throw pkgError;
      if (pkgData) setPackages(pkgData);

      // Map data ke UI
      if (membersData) {
        const mappedMembers: MemberData[] = membersData.map((m) => {
          const subs = subsData?.filter(s => s.member_id === m.id) || [];
          const activeSubs = subs.filter((s: any) => s.status === 'active');
          const expiredSub = subs.find((s: any) => s.status === 'expired');

          return {
            id: m.id,
            name: m.name || '-',
            email: m.email || '-',
            phone: m.phone || '-',
            membershipType: activeSubs.length > 0 ? activeSubs.map((s:any) => s.package_name).join(', ') : (expiredSub?.package_name || '-'),
            joinDate: new Date(m.created_at).toLocaleDateString('id-ID'),
            status: activeSubs.length > 0 ? 'active' : (expiredSub ? 'expired' : 'inactive'),
            photoUrl: m.photo_url || null,
          };
        });

        setMembers(mappedMembers);
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePerpanjang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedPackageId || !user) return;

    setIsSubmitting(true);
    try {
      const selectedPkg = packages.find(p => p.id === selectedPackageId);
      if (!selectedPkg) throw new Error("Paket tidak valid");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPkg.duration_days);

      // Biarkan subscription lama tetap aktif karena 1 member bisa punya beberapa layanan (misal: Bulanan + PT)
      // Tidak ada update status expired di sini.

      // Insert new subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          member_id: selectedMember.id,
          gym_id: user.gymId || 'dummy-gym-id',
          package_id: selectedPkg.id,
          package_name: selectedPkg.name,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          payment_method: paymentMethod
        });

      if (error) throw error;

      // Close modal & Refresh Data
      setSelectedMember(null);
      setSelectedPackageId("");
      fetchData();
      
    } catch (err) {
      console.error("Gagal memperpanjang paket:", err);
      alert("Terjadi kesalahan saat memperpanjang paket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusStyle = (status: MemberData["status"]) => {
    switch (status) {
      case "active": return { background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
      case "inactive": return { background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' };
      case "expired": return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] relative">
        <DashboardHeader />

        <div className="mb-[24px] flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Members</h1>
            <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola data member dan perpanjang keanggotaan (Offline Kasir)</p>
          </div>
          <a
            href="/admin/members/new"
            className="inline-flex items-center justify-center bg-[var(--color-primary)] text-white font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-lg shadow-[var(--color-primary)]/20"
          >
            + Daftarkan Member
          </a>
        </div>

        <div className="mb-[16px]">
          <input
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full max-w-md px-[12px] py-[8px] rounded-md bg-[var(--color-surface-1)] text-[var(--color-ink)] hairline-border focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px]"
          />
        </div>

        <div className="bg-[var(--color-surface-1)] hairline-border rounded-[12px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-2)]">
                  {['Nama', 'Email', 'Telepon', 'Paket Aktif', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-[16px] py-[14px] text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--color-hairline)]">
                      <td colSpan={6} className="px-[16px] py-[16px]">
                        <div className="h-4 w-full bg-[var(--color-hairline)] animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-[16px] py-[16px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--color-surface-3)] shrink-0">
                            {member.photoUrl ? (
                              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-subtle)] font-bold text-[12px]">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-[14px] font-medium text-[var(--color-ink)]">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{member.email}</td>
                      <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{member.phone}</td>
                      <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{member.membershipType}</td>
                      <td className="px-[16px] py-[16px]">
                        <span
                          className="px-[10px] py-[4px] rounded-full text-[12px] font-semibold"
                          style={getStatusStyle(member.status)}
                        >
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-[16px] py-[16px]">
                        <button 
                          onClick={() => setSelectedMember(member)}
                          className="flex items-center gap-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                        >
                          <PlusCircle size={16} />
                          <span>Perpanjang</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-[16px] py-[48px] text-center">
                      <div className="text-[var(--color-ink-muted)] text-[14px]">
                        {searchTerm ? "Pencarian tidak ditemukan" : "Tidak ada member di cabang ini"}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-[16px] py-[16px] border-t border-[var(--color-hairline)] bg-[var(--color-surface-1)]">
              <span className="text-[13px] text-[var(--color-ink-subtle)]">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} dari {filteredMembers.length}
              </span>
              <div className="flex gap-[8px]">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-[12px] py-[6px] text-[13px] font-medium rounded-md bg-[var(--color-surface-2)] text-[var(--color-ink)] hairline-border disabled:opacity-40 hover:bg-[var(--color-surface-3)] transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-[12px] py-[6px] text-[13px] font-medium rounded-md bg-[var(--color-surface-2)] text-[var(--color-ink)] hairline-border disabled:opacity-40 hover:bg-[var(--color-surface-3)] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Perpanjang Paket */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--color-surface-1)] hairline-border w-full max-w-md rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header Modal */}
              <div className="px-[24px] py-[20px] border-b border-[var(--color-hairline)] flex justify-between items-center bg-[var(--color-surface-2)]">
                <h2 className="text-[18px] font-bold text-[var(--color-ink)]">Perpanjang Paket</h2>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-[24px] overflow-y-auto">
                <div className="mb-6">
                  <p className="text-[13px] text-[var(--color-ink-subtle)] uppercase tracking-wider font-semibold mb-1">Member</p>
                  <p className="text-[18px] font-bold text-[var(--color-ink)]">{selectedMember.name}</p>
                  <p className="text-[14px] text-[var(--color-ink-muted)]">{selectedMember.email}</p>
                </div>

                <form id="form-perpanjang" onSubmit={handlePerpanjang} className="space-y-[20px]">
                  <div>
                    <label className="block text-[13px] font-medium mb-[8px] text-[var(--color-ink)]">Pilih Paket</label>
                    <select 
                      required
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                      className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px] appearance-none"
                    >
                      <option value="">-- Pilih Paket --</option>
                      {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - Rp {pkg.price.toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium mb-[8px] text-[var(--color-ink)]">Metode Pembayaran (Offline)</label>
                    <div className="grid grid-cols-2 gap-[12px]">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Cash')}
                        className={`py-[10px] rounded-[10px] text-[14px] font-semibold border transition-colors ${paymentMethod === 'Cash' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
                      >
                        Tunai / Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('QRIS')}
                        className={`py-[10px] rounded-[10px] text-[14px] font-semibold border transition-colors ${paymentMethod === 'QRIS' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
                      >
                        QRIS / Transfer
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer Modal */}
              <div className="px-[24px] py-[20px] border-t border-[var(--color-hairline)] bg-[var(--color-surface-2)] flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="px-[16px] py-[10px] rounded-[10px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors text-[14px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="form-perpanjang"
                  disabled={isSubmitting || !selectedPackageId}
                  className="px-[24px] py-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-[10px] font-semibold transition-colors flex items-center gap-2 text-[14px] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  Simpan Pembayaran
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

