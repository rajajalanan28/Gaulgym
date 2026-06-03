'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { colors, borderRadius, spacing } from '@/lib/design-tokens';
import { LayoutDashboard, Building2, Users, Package, LineChart, CheckSquare, ClipboardList, Dumbbell } from 'lucide-react';

const OWNER_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/gyms', label: 'Kelola Gym', icon: <Building2 size={20} /> },
  { href: '/owner/admin', label: 'Kelola Admin', icon: <Users size={20} /> },
  { href: '/owner/member', label: 'Member', icon: <Users size={20} /> },
  { href: '/packages', label: 'Paket Membership', icon: <Package size={20} /> },
  { href: '/reports', label: 'Laporan', icon: <LineChart size={20} /> },
];

const ADMIN_MENU = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/member', label: 'Member', icon: <Users size={20} /> },
  { href: '/admin/checkin', label: 'Check-in', icon: <CheckSquare size={20} /> },
  { href: '/admin/history', label: 'Riwayat', icon: <ClipboardList size={20} /> },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const menu = user?.role === 'Owner' ? OWNER_MENU : ADMIN_MENU;

  return (
    <aside style={{ width: '260px', minHeight: '100vh', backgroundColor: colors.surface, padding: spacing.lg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #FF5722, #FF8A50)', borderRadius: borderRadius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Dumbbell size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>GAUL GYM</div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menu.map((item) => (
          <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: borderRadius.md, color: colors.textPrimary, textDecoration: 'none', transition: 'background 0.2s' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.md, marginBottom: '12px' }}>
          <p style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Logged in as</p>
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: '12px', color: colors.textSecondary }}>{user?.email}</div>
        </div>
        <button onClick={logout} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: `1px solid ${colors.error}`, borderRadius: borderRadius.md, color: colors.error, cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </aside>
  );
}
