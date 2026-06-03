"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { UserPlus, Shield, MoreVertical } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function StaffPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchStaff() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('owner_id', user.id)
          .eq('role', 'Admin')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        if (data) setStaffList(data);
      } catch (err) {
        console.error("Gagal memuat staff:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStaff();
  }, [user]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      // In real scenario, we should use Supabase Auth to create user.
      // Since this is a demo/bypass, we directly insert into 'users' table.
      // (Note: Supabase Auth requires backend admin API for creating other users without logging out)
      
      const finalEmail = newStaff.email.includes("@")
        ? newStaff.email.trim().toLowerCase()
        : `${newStaff.email.trim().toLowerCase()}@gaulgym.com`;
        
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: finalEmail,
          name: newStaff.name,
          role: 'Admin',
          owner_id: user.id,
          is_active: true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setStaffList([data, ...staffList]);
        setShowAddModal(false);
        setNewStaff({ name: '', email: '', password: '' });
      }
    } catch (err: any) {
      alert(err.message || "Gagal menambah staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStaffStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', staffId);
        
      if (error) throw error;
      
      setStaffList(staffList.map(s => 
        s.id === staffId ? { ...s, is_active: !currentStatus } : s
      ));
    } catch (err) {
      console.error("Gagal mengubah status:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] selection:bg-[var(--color-primary-focus)] selection:text-white">
        <DashboardHeader />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[32px] gap-[16px]">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Manajemen Admin</h1>
            <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola akun Admin/Kasir untuk seluruh cabang gym Anda.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-[20px] py-[12px] rounded-[12px] font-medium transition-colors shadow-lg shadow-[var(--color-primary)]/20 focus-ring"
          >
            <UserPlus size={18} />
            Tambah Admin
          </button>
        </div>

        <div className="bg-[var(--color-surface-1)] hairline-border rounded-[20px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
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
                ) : staffList.length > 0 ? (
                  staffList.map((staff) => (
                    <tr key={staff.id} className="border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-[24px] py-[16px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[40px] h-[40px] rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-[16px]">
                            {staff.name.charAt(0)}
                          </div>
                          <span className="text-[15px] font-semibold text-[var(--color-ink)]">{staff.name}</span>
                        </div>
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{staff.email}</td>
                      <td className="px-[24px] py-[16px]">
                        <span className="flex items-center gap-[6px] text-[13px] font-medium text-blue-400 bg-blue-500/10 px-[10px] py-[4px] rounded-full w-fit">
                          <Shield size={14} /> {staff.role}
                        </span>
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">
                        {new Date(staff.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <button 
                          onClick={() => toggleStaffStatus(staff.id, staff.is_active)}
                          className={`px-[12px] py-[6px] rounded-full text-[12px] font-semibold transition-colors ${staff.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                        >
                          {staff.is_active ? 'Aktif' : 'Nonaktif'}
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
                      <p className="text-[13px] mt-1">Tambahkan admin pertama Anda untuk mengelola kasir gym.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--color-surface-1)] w-full max-w-md rounded-[24px] p-[32px] border border-[var(--color-hairline)] shadow-2xl">
            <h3 className="text-[20px] font-bold text-[var(--color-ink)] mb-[8px] tracking-[-0.01em]">Tambah Admin Baru</h3>
            <p className="text-[14px] text-[var(--color-ink-muted)] mb-[24px]">Buat akun kasir/admin untuk mengelola gym.</p>
            
            <form onSubmit={handleAddStaff} className="space-y-[16px]">
              <div>
                <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]"
                  placeholder="Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Email</label>
                <input
                  type="text"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]"
                  placeholder="budi@gaulgym.com"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-[6px] text-[var(--color-ink-subtle)]">Kata Sandi Sementara</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                  className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              
              <div className="flex gap-[12px] pt-[16px] mt-[8px]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-[12px] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink)] rounded-[12px] font-medium transition-colors focus-ring"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-[12px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:opacity-50 rounded-[12px] font-medium transition-colors focus-ring"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Admin'}
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