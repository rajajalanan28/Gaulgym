'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Building2, Users, Package, LineChart, CheckSquare, ClipboardList, Dumbbell } from 'lucide-react';

const OWNER_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/gyms', label: 'Kelola Gym', icon: <Building2 size={20} /> },
  { href: '/owner/admin', label: 'Kelola Admin', icon: <Users size={20} /> },
  { href: '/owner/member', label: 'Member', icon: <Users size={20} /> },
  { href: '/packages', label: 'Paket Membership', icon: <Package size={20} /> },
  { href: '/owner/reports', label: 'Laporan Keuangan', icon: <LineChart size={20} /> },
];

const ADMIN_MENU = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/member', label: 'Member', icon: <Users size={20} /> },
  { href: '/admin/checkin', label: 'Check-in', icon: <CheckSquare size={20} /> },
  { href: '/admin/history', label: 'Riwayat', icon: <ClipboardList size={20} /> },
  { href: '/admin/reports', label: 'Laporan Keuangan', icon: <LineChart size={20} /> },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const menu = user?.role === 'Owner' ? OWNER_MENU : ADMIN_MENU;

  return (
    <aside className="w-64 min-h-screen bg-[var(--color-surface-1)] p-6 hidden md:flex flex-col border-r border-[var(--color-hairline)] shrink-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#5e6ad2] to-[#828fff] rounded-lg flex items-center justify-center text-white shadow-lg">
          <Dumbbell size={24} />
        </div>
        <div>
          <div className="font-bold text-lg text-[var(--color-ink)]">GAUL GYM</div>
          <div className="text-xs text-[var(--color-ink-subtle)] capitalize">{user?.role}</div>
        </div>
      </div>
      
      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-ink-muted)] hover:text-white hover:bg-[var(--color-surface-2)] transition-colors">
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-[var(--color-hairline)]">
        <div className="p-4 bg-[var(--color-surface-2)] rounded-lg mb-3">
          <p className="text-[var(--color-ink-subtle)] text-xs mb-1">Logged in as</p>
          <div className="font-semibold text-sm text-[var(--color-ink)] truncate">{user?.name}</div>
          <div className="text-xs text-[var(--color-ink-muted)] truncate">{user?.email}</div>
        </div>
        <button onClick={logout} className="w-full py-3 px-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-medium">
          Logout
        </button>
      </div>
    </aside>
  );
}
