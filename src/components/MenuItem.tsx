'use client';

import { colors, borderRadius, spacing } from '@/lib/design-tokens';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color?: string;
  onClick?: () => void;
}

export function MenuItem({ icon, title, subtitle, color = colors.primary, onClick }: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.surfaceVariant,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            padding: '12px',
            borderRadius: borderRadius.md,
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: colors.textPrimary }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: colors.textSecondary }}>
              {subtitle}
            </p>
          )}
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary}>
          <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
