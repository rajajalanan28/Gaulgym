"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface MemberData {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  joinDate: string;
  status: "active" | "inactive" | "expired";
}

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      if (!user) return;
      const gymId = user.gymId || 'dummy-gym-id'; // Assume gym_id exists for admin, or use dummy

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

        // Map data ke UI
        if (membersData) {
          const mappedMembers: MemberData[] = membersData.map((m) => {
            // Cari sub active terbaru, kalau gaada cari expired
            const activeSub = subsData?.find(s => s.member_id === m.id && s.status === 'active');
            const expiredSub = subsData?.find(s => s.member_id === m.id && s.status === 'expired');
            
            const currentSub = activeSub || expiredSub;

            return {
              id: m.id,
              name: m.name || '-',
              email: m.email || '-',
              phone: m.phone || '-',
              membershipType: currentSub?.package_name || '-',
              joinDate: new Date(m.created_at).toLocaleDateString('id-ID'),
              status: activeSub ? 'active' : (expiredSub ? 'expired' : 'inactive'),
            };
          });

          setMembers(mappedMembers);
        }
      } catch (err) {
        console.error("Gagal mengambil data member:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMembers();
  }, [user]);

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
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)]">
        <DashboardHeader />

        <div className="mb-[24px]">
          <h1 className="text-[28px] font-semibold text-[var(--color-ink)] tracking-[-0.02em]">Members</h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola data member dan informasi keanggotaan</p>
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-2)]">
                  {['Nama', 'Email', 'Telepon', 'Paket', 'Bergabung', 'Status'].map(h => (
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
                        <span className="text-[14px] font-medium text-[var(--color-ink)]">{member.name}</span>
                      </td>
                      <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{member.email}</td>
                      <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{member.phone}</td>
                      <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{member.membershipType}</td>
                      <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-ink-muted)]">{member.joinDate}</td>
                      <td className="px-[16px] py-[16px]">
                        <span
                          className="px-[10px] py-[4px] rounded-full text-[12px] font-semibold"
                          style={getStatusStyle(member.status)}
                        >
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
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
      </div>
    </ProtectedRoute>
  );
}
