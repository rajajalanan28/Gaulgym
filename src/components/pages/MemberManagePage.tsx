"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { PlusCircle, X, Loader2, Shield, Camera, IdCard, MessageCircle, User, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateMemberPhotoAction, deleteMemberAction, resetMemberPasswordAction, cleanupOrphanedAuthUsersAction, editMemberAction, editSubscriptionEndDateAction } from "@/app/actions/user";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
interface MemberData {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  joinDate: string;
  status: "active" | "inactive" | "expired";
  photoUrl: string | null;
  user_id: string | null;
  display_id: string | null;
  activeSubscriptionId?: string;
  activeSubscriptionEndDate?: string;
}

interface PackageData {
  id: string;
  name: string;
  price: number;
  duration_days: number;
}

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [members, setMembers] = useState<MemberData[]>([]);
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [memberCardModal, setMemberCardModal] = useState<MemberData | null>(null);
  const [enlargedQr, setEnlargedQr] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDateModal, setEditDateModal] = useState<MemberData | null>(null);
  const [newEndDate, setNewEndDate] = useState<string>("");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Member Card Modal States
  const [cameraActive, setCameraActive] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const startCamera = async (mode = facingMode) => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setCameraActive(true);
      // Tunggu React render video, baru set srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Gagal mengakses kamera. Pastikan browser memiliki izin.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        if (isMirrored) {
          context.translate(canvasRef.current.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const base64 = canvasRef.current.toDataURL('image/jpeg');
        setPhotoBase64(base64);
        stopCamera();
      }
    }
  };

  const savePhoto = async () => {
    if (!memberCardModal || !photoBase64 || !user) return;
    setIsSubmitting(true);
    try {
      const res = await updateMemberPhotoAction(memberCardModal.id, user.id, photoBase64);
      if (res.error) throw new Error(res.error);
      
      alert('Foto member berhasil diperbarui!');
      setMemberCardModal({ ...memberCardModal, photoUrl: res.photoUrl || null });
      fetchData(); // Refresh the list
    } catch (err: any) {
      alert("Gagal update foto: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // When member card modal opens, try starting camera automatically if no photo
    if (memberCardModal && !memberCardModal.photoUrl && !photoBase64) {
      startCamera();
    }
    return () => stopCamera();
  }, [memberCardModal]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [user]);

  async function fetchData(signal?: AbortSignal) {
    if (!user) return;

    try {
      // 1. Ambil data members
      const { data: membersData, error: memError } = await supabase
        .from('members')
        .select('*');
      
      if (signal?.aborted) return;
        
      if (memError) throw memError;

      // 2. Ambil data subscriptions
      const { data: subsData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .in('status', ['active', 'expired']);
      
      if (signal?.aborted) return;
        
      if (subError) throw subError;

      // 3. Ambil data packages
      const { data: pkgData, error: pkgError } = await supabase
        .from('packages')
        .select('*');

      if (signal?.aborted) return;

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
            user_id: m.user_id || null,
            display_id: m.display_id || null,
            activeSubscriptionId: activeSubs.length > 0 ? activeSubs[0].id : undefined,
            activeSubscriptionEndDate: activeSubs.length > 0 ? activeSubs[0].end_date : undefined,
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
          package_id: selectedPkg.id,
          package_name: selectedPkg.name,
          amount: selectedPkg.price,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          payment_method: paymentMethod,
          payment_status: 'paid'
        });

      if (error) throw error;

      // Send WhatsApp Notification
      try {
        await fetch('/api/fonnte/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: selectedMember.phone,
            name: selectedMember.name,
            displayId: selectedMember.display_id,
            packageName: selectedPkg.name,
            endDate: endDate.toISOString(),
          })
        });
      } catch (err) {
        console.error("Failed to send WA welcome:", err);
        // Don't throw error to user if only WA fails, they still bought the package
      }

      // Close modal & Refresh Data
      setSelectedMember(null);
      setSelectedPackageId("");
      fetchData();
      
    } catch (err: any) {
      console.error("Gagal memperpanjang paket:", err);
      alert("Terjadi kesalahan saat memperpanjang paket: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDateModal?.activeSubscriptionId || !newEndDate) return;
    setIsSubmitting(true);
    try {
      const res = await editSubscriptionEndDateAction(editDateModal.activeSubscriptionId, new Date(newEndDate).toISOString());
      if (res.error) throw new Error(res.error);
      alert('Tanggal expired berhasil diubah!');
      setEditDateModal(null);
      fetchData();
    } catch (err: any) {
      alert('Gagal mengubah tanggal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromoteToAdmin = async (member: MemberData) => {
    if (!user) return;
    if (!member.user_id) {
      alert("Member ini belum mendaftar akun/login di web (dibuat manual oleh kasir), jadi belum bisa dijadikan Admin.");
      return;
    }
    
    if (confirm(`Yakin ingin mempromosikan ${member.name} menjadi Admin?`)) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Note: CSRF protection is handled securely by Supabase via JWT authorization headers in the SDK
        const res = await fetch('/api/owner/promote', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({
            userId: member.user_id,
            ownerId: user.id,
            memberId: member.id
          })
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');

        alert(`${member.name} berhasil dipromosikan menjadi Admin!`);
        fetchData(); // This will refresh the member list and remove the promoted member
      } catch (err: any) {
        console.error("Gagal mempromosikan admin:", err);
        alert("Gagal: " + err.message);
      }
    }
  };

  const handleResetPassword = async (member: MemberData) => {
    if (!member.user_id) {
      alert("Member ini belum memiliki akun login.");
      return;
    }
    
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let randomPassword = '';
    for (let i = 0; i < 10; i++) {
      randomPassword += chars[Math.floor(Math.random() * chars.length)];
    }
    randomPassword += '!1aA'; // Ensure complexity
    
    if (confirm(`Anda yakin ingin mereset password untuk ${member.name}?\n\nPassword baru akan dibuat otomatis.`)) {
      try {
        const res = await resetMemberPasswordAction(member.user_id, randomPassword);
        if (res.error) throw new Error(res.error);
        
        alert(`Password berhasil direset!\n\nUsername: ${member.email.replace('@gaulgym.com', '')}\nPassword Baru: ${res.newPassword}\n\nSilakan berikan password ini ke member.`);
      } catch (err: any) {
        alert("Gagal mereset password: " + err.message);
      }
    }
  };

  const handleDeleteMember = async (member: MemberData) => {
    if (confirm(`PERINGATAN KERAS: Anda yakin ingin MENGHAPUS member ${member.name}?\n\nSemua data langganan dan kehadiran member ini juga akan terhapus!\n\nTindakan ini tidak bisa dibatalkan!`)) {
      try {
        if (member.user_id) {
          if (member.user_id === user?.id) {
            if (!confirm(`Tunggu dulu! Ini adalah akun Anda sendiri.\n\nMenghapus ini HANYA akan menghapus Anda dari daftar member (dan data langganan/kehadiran), akun Owner/Admin Anda TIDAK akan terhapus.\n\nLanjutkan?`)) {
              return;
            }
          }
          const res = await deleteMemberAction(member.user_id);
          if (res.error) throw new Error(res.error);
        } else {
          // If no auth user, just delete from members table
          const { error } = await supabase.from('members').delete().eq('id', member.id);
          if (error) throw error;
        }
        
        alert('Member berhasil dihapus!');
        fetchData();
      } catch (err: any) {
        alert("Gagal menghapus member: " + err.message + "\n\n(Pastikan ON DELETE CASCADE sudah disetup di Supabase)");
      }
    }
  };

  const handleWhatsApp = (member: MemberData) => {
    if (!member.phone) {
      alert("Member ini tidak memiliki nomor telepon.");
      return;
    }
    const phone = member.phone || '';
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }
    
    const isExpired = member.status === 'expired';
    const text = isExpired 
      ? `Halo ${member.name}, paket gym Anda di Gaul Gym sudah habis nih. Yuk perpanjang biar bisa latihan lagi!`
      : `Halo ${member.name}, ini dari Gaul Gym.`;
      
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  const stats = useMemo(() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;
    
    members.forEach(m => {
      if (m.status === 'active') {
        active++;
        if (m.activeSubscriptionEndDate) {
          const endDate = new Date(m.activeSubscriptionEndDate);
          if (endDate <= next7Days && endDate >= today) {
            expiring++;
          }
        }
      } else if (m.status === 'expired') {
        expired++;
      }
    });

    return { total: members.length, active, expiring, expired };
  }, [members]);

  const filteredMembers = members.filter(
    (member) => {
      const matchSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.phone.includes(searchTerm);
                          
      let matchFilter = true;
      if (filterStatus === 'active') matchFilter = member.status === 'active';
      else if (filterStatus === 'expired') matchFilter = member.status === 'expired';
      else if (filterStatus === 'expiring_soon') {
        if (member.status !== 'active') matchFilter = false;
        else if (member.activeSubscriptionEndDate) {
          const endDate = new Date(member.activeSubscriptionEndDate);
          matchFilter = endDate <= next7Days && endDate >= today;
        } else {
          matchFilter = false;
        }
      }

      return matchSearch && matchFilter;
    }
  );

  const sortedMembers = useMemo(() => {
    let result = [...filteredMembers];
    switch (sortOrder) {
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "expire_asc":
        result.sort((a, b) => {
          if (!a.activeSubscriptionEndDate) return 1;
          if (!b.activeSubscriptionEndDate) return -1;
          return new Date(a.activeSubscriptionEndDate).getTime() - new Date(b.activeSubscriptionEndDate).getTime();
        });
        break;
      case "expire_desc":
        result.sort((a, b) => {
          if (!a.activeSubscriptionEndDate) return 1;
          if (!b.activeSubscriptionEndDate) return -1;
          return new Date(b.activeSubscriptionEndDate).getTime() - new Date(a.activeSubscriptionEndDate).getTime();
        });
        break;
      case "newest":
      default:
        break;
    }
    return result;
  }, [filteredMembers, sortOrder]);

  const totalPages = Math.ceil(sortedMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = sortedMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.user_id) return;
    setIsSubmitting(true);
    try {
      const res = await editMemberAction(editingMember.user_id, editName, editPhone);
      if (res.error) throw new Error(res.error);
      alert('Data member berhasil diubah!');
      setEditingMember(null);
      fetchData();
    } catch (err: any) {
      alert('Gagal mengubah data: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sanitizeUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) return url;
    return '';
  };

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
            <p className="text-[var(--color-ink-muted)] mt-1 text-[15px]">Kelola data member dan perpanjang keanggotaan</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (confirm('Fitur ini akan membersihkan sisa data member yang error/dihapus manual (supaya email/username bisa dipakai lagi). Lanjutkan?')) {
                  try {
                    const res = await cleanupOrphanedAuthUsersAction();
                    if (res.error) alert('Gagal: ' + res.error);
                    else alert(res.message);
                  } catch (err: any) {
                    alert('Error: ' + err.message);
                  }
                }
              }}
              className="inline-flex items-center justify-center bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-hairline)] font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--color-surface-3)] transition-colors text-[13px]"
            >
              Bersihkan Cache User
            </button>
            <Link
              href={user?.role === 'Owner' ? "/owner/member/new" : "/admin/member/new"}
              className="inline-flex items-center justify-center bg-[var(--color-primary)] text-white font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-lg shadow-[var(--color-primary)]/20 text-[13px]"
            >
              + Daftarkan Member
            </Link>
          </div>
        </div>

        {/* Stats Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-[24px]">
          <div className="bg-[var(--color-surface-1)] p-4 rounded-xl border border-[var(--color-hairline)] flex flex-col justify-center cursor-pointer hover:border-[var(--color-primary)] transition" onClick={() => setFilterStatus('all')}>
            <p className="text-[13px] text-[var(--color-ink-subtle)] font-medium">Total Member</p>
            <p className="text-[24px] font-bold text-[var(--color-ink)]">{stats.total}</p>
          </div>
          <div className="bg-[var(--color-surface-1)] p-4 rounded-xl border border-[var(--color-hairline)] flex flex-col justify-center cursor-pointer hover:border-green-500 transition" onClick={() => setFilterStatus('active')}>
            <p className="text-[13px] text-green-600 font-medium">Aktif</p>
            <p className="text-[24px] font-bold text-green-500">{stats.active}</p>
          </div>
          <div className="bg-[var(--color-surface-1)] p-4 rounded-xl border border-[var(--color-hairline)] flex flex-col justify-center cursor-pointer hover:border-orange-500 transition" onClick={() => setFilterStatus('expiring_soon')}>
            <p className="text-[13px] text-orange-600 font-medium">Akan Habis (7 Hari)</p>
            <p className="text-[24px] font-bold text-orange-500">{stats.expiring}</p>
          </div>
          <div className="bg-[var(--color-surface-1)] p-4 rounded-xl border border-[var(--color-hairline)] flex flex-col justify-center cursor-pointer hover:border-red-500 transition" onClick={() => setFilterStatus('expired')}>
            <p className="text-[13px] text-red-600 font-medium">Expired</p>
            <p className="text-[24px] font-bold text-red-500">{stats.expired}</p>
          </div>
        </div>

        <div className="mb-[16px] flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full sm:max-w-md px-[16px] py-[10px] rounded-lg bg-[var(--color-surface-1)] text-[var(--color-ink)] border border-[var(--color-hairline)] focus-ring placeholder:text-[var(--color-ink-subtle)] text-[14px]"
          />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-[16px] py-[10px] bg-[var(--color-surface-1)] text-[var(--color-ink)] rounded-lg border border-[var(--color-hairline)] focus-ring text-[14px] min-w-[150px]"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="expiring_soon">Akan Habis (7 Hari)</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
            className="px-[16px] py-[10px] bg-[var(--color-surface-1)] text-[var(--color-ink)] rounded-lg border border-[var(--color-hairline)] focus-ring text-[14px] min-w-[150px]"
          >
            <option value="newest">Terbaru</option>
            <option value="name_asc">A - Z</option>
            <option value="name_desc">Z - A</option>
            <option value="expire_asc">Tercepat Expired</option>
            <option value="expire_desc">Terlama Expired</option>
          </select>
        </div>

        <div className="bg-[var(--color-surface-1)] hairline-border rounded-[12px] overflow-hidden">
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-4 p-4">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-40 w-full bg-[var(--color-surface-2)] animate-pulse rounded-xl border border-[var(--color-hairline)]"></div>
              ))
            ) : paginatedMembers.length > 0 ? (
              paginatedMembers.map((member) => (
                <div key={member.id} className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-hairline)] flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--color-surface-3)] shrink-0">
                        {member.photoUrl ? (
                          <img src={sanitizeUrl(member.photoUrl)} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-subtle)] font-bold text-[14px]">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-bold text-[var(--color-ink)] truncate">{member.name}</div>
                        <div className="text-[12px] text-[var(--color-ink-muted)] font-mono truncate">
                          <span className="text-[10px] uppercase tracking-wider opacity-70">Username:</span> {member.email.replace('@gaulgym.com', '')}
                        </div>
                      </div>
                    </div>
                    <span
                      className="px-[10px] py-[4px] rounded-full text-[10px] font-semibold shrink-0"
                      style={getStatusStyle(member.status)}
                    >
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[13px] bg-[var(--color-surface-1)] p-3 rounded-lg border border-[var(--color-hairline)]">
                    <div>
                      <span className="text-[var(--color-ink-subtle)] text-[11px] block mb-0.5">Telepon</span>
                      <span className="font-medium text-[var(--color-ink)]">{member.phone}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-ink-subtle)] text-[11px] block mb-0.5">Paket Aktif</span>
                      <span className="font-medium text-[var(--color-ink)] line-clamp-1" title={member.membershipType}>{member.membershipType}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-hairline)] flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-[10px] py-[8px] rounded-md transition-colors text-[12px] font-semibold"
                    >
                      <PlusCircle size={14} /> Perpanjang
                    </button>
                    {user?.role === 'Owner' && member.status === 'active' && member.activeSubscriptionId && (
                      <button 
                        onClick={() => {
                          setEditDateModal(member);
                          setNewEndDate(member.activeSubscriptionEndDate ? new Date(member.activeSubscriptionEndDate).toISOString().split('T')[0] : '');
                        }}
                        className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-600 hover:text-white px-[10px] py-[8px] rounded-md transition-colors text-[12px] font-semibold"
                      >
                        <Edit size={14} /> Edit Tgl
                      </button>
                    )}
                    <button 
                      onClick={() => { setEditingMember(member); setEditName(member.name); setEditPhone(member.phone); }}
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-gray-500/10 text-gray-500 hover:bg-gray-600 hover:text-white px-[10px] py-[8px] rounded-md transition-colors text-[12px] font-semibold"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => setMemberCardModal(member)}
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white px-[10px] py-[8px] rounded-md transition-colors text-[12px] font-semibold"
                    >
                      <IdCard size={14} /> Kartu
                    </button>
                    <button 
                      onClick={() => handlePromoteToAdmin(member)}
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-purple-500/10 text-purple-600 hover:bg-purple-600 hover:text-white px-[10px] py-[8px] rounded-md transition-colors text-[12px] font-semibold"
                    >
                      <Shield size={14} /> Jadi Admin
                    </button>
                    {(member.status === 'expired' || member.status === 'inactive') && (
                      <button 
                        onClick={() => handleWhatsApp(member)}
                        className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-green-500/10 text-green-500 hover:bg-green-600 hover:text-white px-[10px] py-[8px] rounded-md transition-colors text-[12px] font-semibold"
                      >
                        <MessageCircle size={14} /> Kirim WA
                      </button>
                    )}
                    <button 
                      onClick={() => handleResetPassword(member)}
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-600 hover:text-white px-[10px] py-[8px] rounded-md transition-colors text-[12px] font-semibold"
                    >
                      <User size={14} /> Reset Pwd
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(member)}
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white px-[10px] py-[8px] rounded-md transition-colors text-[12px] font-semibold"
                    >
                      <X size={14} /> Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-[48px] text-center text-[var(--color-ink-muted)] text-[14px]">
                {searchTerm ? "Pencarian tidak ditemukan" : "Belum ada member terdaftar"}
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-2)]">
                  {['Nama', 'Username', 'Telepon', 'Paket Aktif', 'Status', 'Aksi'].map(h => (
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
                              <img src={sanitizeUrl(member.photoUrl)} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-subtle)] font-bold text-[12px]">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-[14px] font-medium text-[var(--color-ink)]">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-[16px] py-[16px] text-[14px] text-[var(--color-ink-muted)] font-mono">{member.email.replace('@gaulgym.com', '')}</td>
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
                        <div className="flex flex-wrap items-center gap-2 max-w-[420px]">
                          <button 
                            onClick={() => setSelectedMember(member)}
                            className="flex items-center gap-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                          >
                            <PlusCircle size={16} />
                            <span>Perpanjang</span>
                          </button>

                          {user?.role === 'Owner' && member.status === 'active' && member.activeSubscriptionId && (
                            <button 
                              onClick={() => {
                                setEditDateModal(member);
                                setNewEndDate(member.activeSubscriptionEndDate ? new Date(member.activeSubscriptionEndDate).toISOString().split('T')[0] : '');
                              }}
                              className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-600 hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                              title="Edit Expired Date"
                            >
                              <Edit size={16} />
                              <span>Edit Tgl</span>
                            </button>
                          )}

                          <button 
                            onClick={() => { setEditingMember(member); setEditName(member.name); setEditPhone(member.phone); }}
                            className="flex items-center gap-1 bg-gray-500/10 text-gray-500 hover:bg-gray-600 hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                            title="Edit Member"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>

                          <button 
                            onClick={() => setMemberCardModal(member)}
                            className="flex items-center gap-1 bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                            title="Kartu Member"
                          >
                            <IdCard size={16} />
                            <span>Kartu Member</span>
                          </button>
                          
                          <button 
                            onClick={() => handlePromoteToAdmin(member)}
                            className="flex items-center gap-1 bg-purple-500/10 text-purple-600 hover:bg-purple-600 hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                            title="Jadikan Admin"
                          >
                            <Shield size={16} />
                            <span>Jadikan Admin</span>
                          </button>

                          {(member.status === 'expired' || member.status === 'inactive') && (
                            <button 
                              onClick={() => handleWhatsApp(member)}
                              className="flex items-center gap-1 bg-green-500/10 text-green-500 hover:bg-green-600 hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                              title="Kirim WA Jatuh Tempo"
                            >
                              <MessageCircle size={16} />
                              <span>Kirim WA</span>
                            </button>
                          )}

                          <button 
                            onClick={() => handleResetPassword(member)}
                            className="flex items-center gap-1 bg-orange-500/10 text-orange-500 hover:bg-orange-600 hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                            title="Reset Password"
                          >
                            <User size={16} />
                            <span>Reset Pwd</span>
                          </button>

                          <button 
                            onClick={() => handleDeleteMember(member)}
                            className="flex items-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white px-[12px] py-[6px] rounded-md transition-colors text-[13px] font-semibold"
                            title="Hapus Member"
                          >
                            <X size={16} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-[16px] py-[48px] text-center">
                      <div className="text-[var(--color-ink-muted)] text-[14px]">
                        {searchTerm ? "Pencarian tidak ditemukan" : "Belum ada member terdaftar"}
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

        {/* Modal Edit Member */}
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--color-surface-1)] hairline-border w-full max-w-md rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-[24px] py-[20px] border-b border-[var(--color-hairline)] flex justify-between items-center bg-[var(--color-surface-2)]">
                <h2 className="text-[18px] font-bold text-[var(--color-ink)]">Edit Member</h2>
                <button 
                  onClick={() => setEditingMember(null)}
                  className="text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-[24px] overflow-y-auto">
                <form id="form-edit-member" onSubmit={handleEditSubmit} className="space-y-[20px]">
                  <div>
                    <label className="block text-[13px] font-medium mb-[8px] text-[var(--color-ink)]">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-[8px] text-[var(--color-ink)]">No. WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]"
                    />
                  </div>
                </form>
              </div>

              <div className="px-[24px] py-[20px] border-t border-[var(--color-hairline)] bg-[var(--color-surface-2)] flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-[16px] py-[10px] rounded-[10px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors text-[14px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="form-edit-member"
                  disabled={isSubmitting || !editName || !editPhone}
                  className="px-[24px] py-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-[10px] font-semibold transition-colors flex items-center gap-2 text-[14px] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Modal Kartu Member */}
        {memberCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[var(--color-surface-1)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[var(--color-surface-2)]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <IdCard className="text-[var(--color-primary)]" />
                  Kartu Member
                </h2>
                <button 
                  onClick={() => {
                    setMemberCardModal(null);
                    setPhotoBase64(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* The Membership Card */}
                <div className="bg-[#0b1014] rounded-xl border border-gray-800 p-6 relative overflow-hidden h-[240px] flex flex-col justify-between shadow-2xl">
                  {/* Background decorative elements to mimic the circuit/mandala pattern */}
                  <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(34, 197, 94, 0.15) 0%, transparent 50%), radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.05) 0%, transparent 40%)' }}></div>
                  <div className="absolute -bottom-20 -right-10 w-64 h-64 border border-green-500/20 rounded-full opacity-50 blur-[1px]"></div>
                  <div className="absolute -bottom-10 -right-20 w-48 h-48 border border-green-500/30 rounded-full opacity-50 blur-[1px]"></div>
                  
                  {/* Top Bar: Logo & QR */}
                  <div className="flex justify-between items-start z-10 relative">
                    <div className="flex items-center gap-3">
                      <img src="/logo.png" alt="Gaul Gym" className="w-10 h-10 object-contain drop-shadow-md" />
                      <span className="text-white font-bold tracking-[0.25em] text-sm">GAUL GYM</span>
                    </div>
                    <div 
                      onClick={() => setEnlargedQr(memberCardModal.display_id || memberCardModal.id)}
                      className="bg-white p-1.5 rounded-lg shadow-sm cursor-pointer hover:scale-105 transition-transform"
                      title="Perbesar QR Code"
                    >
                      <QRCodeSVG value={memberCardModal.display_id || memberCardModal.id} size={54} />
                    </div>
                  </div>

                  {/* Middle: Profile */}
                  <div className="flex items-center gap-4 z-10 relative -mt-2">
                     {photoBase64 || memberCardModal.photoUrl ? (
                       <img src={photoBase64 || sanitizeUrl(memberCardModal.photoUrl) || ''} alt={memberCardModal.name} className="w-[68px] h-[68px] rounded-full border-2 border-[#5c6bc0] object-cover shadow-md" />
                     ) : (
                       <div className="w-[68px] h-[68px] rounded-full bg-gray-800 border-2 border-[#5c6bc0] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                         {memberCardModal.name.charAt(0).toUpperCase()}
                       </div>
                     )}
                     <div>
                       <h3 className="text-white font-bold text-[22px] tracking-wide mb-0.5">{memberCardModal.name}</h3>
                       <p className="text-gray-400 text-[13px] font-mono tracking-widest">*****{memberCardModal.phone ? memberCardModal.phone.slice(-4) : '0000'}</p>
                     </div>
                  </div>

                  {/* Bottom: Info */}
                  <div className="flex justify-between items-end z-10 relative gap-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-gray-500 text-[9px] tracking-[0.15em] uppercase mb-1">Paket Aktif</p>
                      <p className="text-gray-300 text-[13px] leading-tight italic font-medium line-clamp-2" title={memberCardModal.membershipType || 'Belum Ada Paket Aktif'}>
                        {memberCardModal.membershipType || 'Belum Ada Paket Aktif'}
                      </p>
                    </div>
                    <div className="flex gap-4 sm:gap-6 text-right shrink-0">
                      <div>
                        <p className="text-gray-500 text-[9px] tracking-[0.15em] uppercase mb-1">Join Date</p>
                        <p className="text-gray-300 text-[12px] sm:text-[13px] font-mono tracking-wider">
                          {memberCardModal.joinDate ? new Date(memberCardModal.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-- -- ----'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[9px] tracking-[0.15em] uppercase mb-1">Valid Thru</p>
                        <p className="text-gray-300 text-[12px] sm:text-[13px] font-mono tracking-wider">
                          {memberCardModal.activeSubscriptionEndDate ? new Date(memberCardModal.activeSubscriptionEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' / ') : '--/--/----'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-[var(--color-surface-2)] rounded-2xl p-5 border border-white/5">
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 text-center">
                    {photoBase64 || memberCardModal.photoUrl ? 'Update Foto Wajah' : 'Ambil Foto Wajah'}
                  </h4>
                  
                  <div className="flex flex-col items-center gap-4">
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {!photoBase64 ? (
                      <>
                        <div className="w-48 h-48 bg-black rounded-full overflow-hidden border-2 border-[var(--color-primary)]/50 relative flex items-center justify-center">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                            className={`w-full h-full object-cover transition-transform ${!cameraActive ? 'hidden' : ''}`} 
                          />
                          {!cameraActive && (
                            <div className="text-center p-4">
                              <Camera className="mx-auto mb-2 text-gray-500" size={32} />
                              <span className="text-xs text-gray-500">Kamera Nonaktif</span>
                            </div>
                          )}
                        </div>
                        
                        {cameraActive ? (
                          <div className="flex flex-col gap-2 mt-2 w-full">
                            <div className="flex gap-2 justify-center mb-2">
                              <button
                                type="button"
                                onClick={() => setIsMirrored(!isMirrored)}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-[11px] font-medium transition"
                              >
                                {isMirrored ? 'Unmirror' : 'Mirror'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newMode = facingMode === 'user' ? 'environment' : 'user';
                                  setFacingMode(newMode);
                                  startCamera(newMode);
                                }}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-[11px] font-medium transition"
                              >
                                {facingMode === 'user' ? 'Kamera Belakang' : 'Kamera Depan'}
                              </button>
                            </div>
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="px-4 py-2 border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full text-sm font-semibold flex items-center gap-2 transition"
                              >
                                <X size={18} /> Batal
                              </button>
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-full text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition shadow-lg flex items-center gap-2"
                              >
                                <Camera size={18} /> Jepret Foto
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            className="px-6 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-full text-sm font-semibold flex items-center gap-2 transition"
                          >
                            <Camera size={18} /> Nyalakan Kamera
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => { setPhotoBase64(null); startCamera(); }}
                          className="px-5 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-semibold hover:bg-gray-600 transition"
                        >
                          Ulangi Foto
                        </button>
                        <button
                          onClick={savePhoto}
                          disabled={isSubmitting}
                          className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                          Simpan Foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Enlarged QR */}
        {enlargedQr && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setEnlargedQr(null)}>
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-fade-in" onClick={e => e.stopPropagation()}>
              <h3 className="text-gray-800 font-bold text-lg">Scan QR Code</h3>
              <div className="p-4 border-4 border-gray-100 rounded-2xl">
                <QRCodeSVG value={enlargedQr} size={250} />
              </div>
              <button 
                onClick={() => setEnlargedQr(null)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
        {/* Modal Edit Tanggal */}
        {editDateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--color-surface-1)] hairline-border w-full max-w-sm rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
              <div className="px-[24px] py-[20px] border-b border-[var(--color-hairline)] flex justify-between items-center bg-[var(--color-surface-2)]">
                <h2 className="text-[18px] font-bold text-[var(--color-ink)]">Edit Tanggal Expired</h2>
                <button 
                  onClick={() => setEditDateModal(null)}
                  className="text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-[24px]">
                <form id="form-edit-date" onSubmit={handleEditDateSubmit} className="space-y-[20px]">
                  <div>
                    <label className="block text-[13px] font-medium mb-[8px] text-[var(--color-ink)]">
                      Member: {editDateModal.name}
                    </label>
                    <label className="block text-[13px] font-medium mb-[8px] text-[var(--color-ink)]">Tanggal Baru</label>
                    <input 
                      type="date"
                      required
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full px-[16px] py-[12px] bg-[var(--color-surface-2)] text-[var(--color-ink)] rounded-[12px] border border-[var(--color-hairline)] focus-ring text-[15px]"
                    />
                  </div>
                </form>

                <div className="mt-8 flex gap-[12px] border-t border-[var(--color-hairline)] pt-[20px]">
                  <button 
                    type="button"
                    onClick={() => setEditDateModal(null)}
                    className="flex-1 px-[24px] py-[10px] border border-[var(--color-hairline)] text-[var(--color-ink)] rounded-[10px] font-semibold hover:bg-[var(--color-surface-2)] transition-colors text-[14px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="form-edit-date"
                    disabled={isSubmitting || !newEndDate}
                    className="flex-1 px-[24px] py-[10px] bg-yellow-500 hover:bg-yellow-600 text-white rounded-[10px] font-semibold transition-colors flex items-center justify-center gap-2 text-[14px] disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

