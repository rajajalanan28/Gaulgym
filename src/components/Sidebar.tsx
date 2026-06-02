'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { colors, borderRadius, spacing } from '@/lib/design-tokens';

const OWNER_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/gyms', label: 'Kelola Gym', icon: '🏢' },
  { href: '/staff', label: 'Kelola Staff', icon: '👥' },
  { href: '/packages', label: 'Paket Membership', icon: '📦' },
  { href: '/reports', label: 'Laporan', icon: '📈' },
];

const ADMIN_MENU = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/members', label: 'Member', icon: '👥' },
  { href: '/admin/checkin', label: 'Check-in', icon: '✅' },
  { href: '/admin/history', label: 'Riwayat', icon: '📋' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const menu = user?.role === 'owner' ? OWNER_MENU : ADMIN_MENU;

  return (
    <aside style={{ width: '260px', minHeight: '100vh', backgroundColor: colors.surface, padding: spacing.lg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #FF5722, #FF8A50)', borderRadius: borderRadius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          🏋️
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>FitGym</div>
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

      <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, marginBottom: '12px' }}>
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
