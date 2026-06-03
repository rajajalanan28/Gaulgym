"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  joinDate: string;
  status: "active" | "inactive" | "expired";
}

const mockMembers: Member[] = [
  { id: 1, name: "John Doe", email: "john.doe@email.com", phone: "(555) 123-4567", membershipType: "Premium", joinDate: "2024-01-15", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane.smith@email.com", phone: "(555) 234-5678", membershipType: "Standard", joinDate: "2024-02-20", status: "active" },
  { id: 3, name: "Mike Johnson", email: "mike.j@email.com", phone: "(555) 345-6789", membershipType: "Basic", joinDate: "2023-11-05", status: "expired" },
  { id: 4, name: "Sarah Williams", email: "sarah.w@email.com", phone: "(555) 456-7890", membershipType: "Premium", joinDate: "2024-03-10", status: "active" },
  { id: 5, name: "David Brown", email: "david.b@email.com", phone: "(555) 567-8901", membershipType: "Standard", joinDate: "2023-12-01", status: "inactive" },
];

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members] = useState<Member[]>(mockMembers);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusStyle = (status: Member["status"]) => {
    switch (status) {
      case "active": return { background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
      case "inactive": return { background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' };
      case "expired": return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-6 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)]">
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
                <tr className="border-b border-[var(--color-hairline)]">
                  {['Nama', 'Email', 'Telepon', 'Paket', 'Bergabung', 'Status'].map(h => (
                    <th key={h} className="px-[16px] py-[12px] text-left text-[12px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-[16px] py-[12px]">
                        <span className="text-[14px] font-medium text-[var(--color-ink)]">{member.name}</span>
                      </td>
                      <td className="px-[16px] py-[12px] text-[14px] text-[var(--color-ink-muted)]">{member.email}</td>
                      <td className="px-[16px] py-[12px] text-[14px] text-[var(--color-ink-muted)]">{member.phone}</td>
                      <td className="px-[16px] py-[12px] text-[14px] text-[var(--color-ink-muted)]">{member.membershipType}</td>
                      <td className="px-[16px] py-[12px] text-[14px] text-[var(--color-ink-muted)]">{member.joinDate}</td>
                      <td className="px-[16px] py-[12px]">
                        <span
                          className="px-[8px] py-[3px] rounded-full text-[12px] font-medium"
                          style={getStatusStyle(member.status)}
                        >
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-[16px] py-[32px] text-center text-[var(--color-ink-muted)] text-[14px]">
                      Tidak ada member ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[var(--color-hairline)]">
              <span className="text-[13px] text-[var(--color-ink-subtle)]">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} dari {filteredMembers.length}
              </span>
              <div className="flex gap-[8px]">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-[10px] py-[4px] text-[13px] rounded-md bg-[var(--color-surface-2)] text-[var(--color-ink)] hairline-border disabled:opacity-40 hover:bg-[var(--color-surface-3)] transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-[10px] py-[4px] text-[13px] rounded-md bg-[var(--color-surface-2)] text-[var(--color-ink)] hairline-border disabled:opacity-40 hover:bg-[var(--color-surface-3)] transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
