"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { UserPlus, Shield, MoreVertical, Search, CheckCircle } from "lucide-react";

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [adminList, setAdminList] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchMember, setSearchMember] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    async function fetchAdmin() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('owner_id', user.id)
          .eq('role', 'Admin')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        if (data) setAdminList(data);
      } catch (err) {
        console.error("Gagal memuat admin:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAdmin();
  }, [user]);

  const loadMembers = async () => {
    if (!user) return;
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      // Hanya tampilkan member yang punya user_id (udah daftar akun auth)
      setMembers(data?.filter(m => m.user_id) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const openAddModal = () => {
    loadMembers();
    setSelectedMember(null);
    setSearchMember("");
    setShowAddModal(true);
  };

  const handlePromote = async () => {
    if (!user || !selectedMember) return;
    setIsSubmitting(true);
    
    try {
      const sessionResponse = await supabase.auth.getSession();
      const token = sessionResponse.data.session?.access_token;
      
      const response = await fetch('/api/owner/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedMember.user_id,
          ownerId: user.id,
          memberId: selectedMember.id
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal mempromosikan admin');
      
      alert('Member berhasil dipromosikan jadi Admin!');
      
      // Refresh admin list
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('owner_id', user.id)
        .eq('role', 'Admin')
        .order('created_at', { ascending: false });
      if (data) setAdminList(data);
      
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || "Gagal mempromosikan admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', adminId);
        
      if (error) throw error;
      
      setAdminList(adminList.map(s => 
        s.id === adminId ? { ...s, is_active: !currentStatus } : s
      ));
    } catch (err) {
      console.error("Gagal mengubah status:", err);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchMember.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[32px] gap-[16px]">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Manajemen Admin</h1>
            <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola akun Admin/Kasir. Hanya bisa mengangkat dari Member terdaftar.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-[20px] py-[12px] rounded-[12px] font-medium transition-colors shadow-lg shadow-[var(--color-primary)]/20 focus-ring"
          >
            <UserPlus size={18} />
            Angkat Admin
          </button>
        </div>

        <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] overflow-hidden shadow-sm">
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-4 p-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-[var(--color-surface-2)] animate-pulse rounded-xl border border-[var(--color-hairline)]"></div>
              ))
            ) : adminList.length > 0 ? (
              adminList.map((admin) => (
                <div key={admin.id} className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-hairline)] flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-[16px] shrink-0">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-[var(--color-ink)]">{admin.name}</div>
                        <div className="text-[12px] text-[var(--color-ink-muted)]">{admin.email}</div>
                      </div>
                    </div>
                    <button className="text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] p-1">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-[6px] text-[11px] font-medium text-blue-400 bg-blue-500/10 px-[8px] py-[3px] rounded-full">
                      <Shield size={12} /> {admin.role}
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-muted)] bg-[var(--color-surface-1)] px-[8px] py-[3px] rounded-full border border-[var(--color-hairline)]">
                      {new Date(admin.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-hairline)] mt-1">
                    <button 
                      onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                      className={`w-full py-[8px] rounded-lg text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 ${admin.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                    >
                      {admin.is_active ? 'Status: Aktif (Klik untuk Nonaktif)' : 'Status: Nonaktif (Klik untuk Aktif)'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-[48px] text-center text-[var(--color-ink-muted)]">
                <Shield size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-[14px] font-medium">Belum ada admin</p>
                <p className="text-[12px] mt-1">Angkat member terpercaya menjadi admin.</p>
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  {['Nama Admin', 'Email', 'Role', 'Bergabung', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-[24px] py-[16px] text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--color-hairline)]">
                      <td colSpan={6} className="px-[24px] py-[16px]"><div className="h-5 bg-[var(--color-hairline)] animate-pulse rounded w-full"></div></td>
                    </tr>
                  ))
                ) : adminList.length > 0 ? (
                  adminList.map((admin) => (
                    <tr key={admin.id} className="border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-[24px] py-[16px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[40px] h-[40px] rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-[16px]">
                            {admin.name.charAt(0)}
                          </div>
                          <span className="text-[15px] font-semibold text-[var(--color-ink)]">{admin.name}</span>
                        </div>
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{admin.email}</td>
                      <td className="px-[24px] py-[16px]">
                        <span className="flex items-center gap-[6px] text-[13px] font-medium text-blue-400 bg-blue-500/10 px-[10px] py-[4px] rounded-full w-fit">
                          <Shield size={14} /> {admin.role}
                        </span>
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">
                        {new Date(admin.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <button 
                          onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                          className={`px-[12px] py-[6px] rounded-full text-[12px] font-semibold transition-colors ${admin.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                        >
                          {admin.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <button className="text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors p-[8px] rounded-full hover:bg-[var(--color-surface-3)]">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-[24px] py-[64px] text-center text-[var(--color-ink-muted)]">
                      <Shield size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-[15px] font-medium">Belum ada admin</p>
                      <p className="text-[13px] mt-1">Angkat member terpercaya menjadi admin untuk mengelola kasir gym.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Promote Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--color-surface-1)] w-full max-w-lg rounded-[24px] p-[32px] border border-[var(--color-hairline)] shadow-2xl flex flex-col max-h-[80vh]">
            <h3 className="text-[20px] font-bold text-[var(--color-ink)] mb-[8px] tracking-[-0.01em]">Angkat Admin Baru</h3>
            <p className="text-[14px] text-[var(--color-ink-muted)] mb-[24px]">Pilih member yang sudah memiliki akun untuk dijadikan Admin Kasir.</p>
            
            <div className="relative mb-[16px]">
              <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama atau email member..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full pl-[44px] pr-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[14px]"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mb-[24px] space-y-[8px]">
              {loadingMembers ? (
                <div className="text-center py-4 text-[var(--color-ink-muted)]">Memuat data member...</div>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map(m => (
                  <div 
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`flex items-center justify-between p-[16px] rounded-[12px] border transition-all cursor-pointer ${selectedMember?.id === m.id ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]' : 'bg-[var(--color-surface-2)] border-[var(--color-hairline)] hover:border-[var(--color-primary)]/50'}`}
                  >
                    <div className="flex items-center gap-[12px]">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center font-bold text-[var(--color-ink)]">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[15px] text-[var(--color-ink)]">{m.name}</div>
                        <div className="text-[13px] text-[var(--color-ink-subtle)]">{m.email || m.phone}</div>
                      </div>
                    </div>
                    {selectedMember?.id === m.id && (
                      <CheckCircle className="text-[var(--color-primary)]" size={20} />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-[24px] text-[var(--color-ink-muted)]">
                  Tidak ada member yang ditemukan atau belum membuat akun (login).
                </div>
              )}
            </div>
            
            <div className="flex gap-[12px] pt-[16px] mt-auto border-t border-[var(--color-hairline)]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-[12px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-medium transition-colors focus-ring"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePromote}
                disabled={isSubmitting || !selectedMember}
                className="flex-1 py-[12px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 rounded-[12px] font-medium transition-colors focus-ring"
              >
                {isSubmitting ? 'Memproses...' : 'Angkat Jadi Admin'}
              </button>
            </div>
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
