'use client';

import { colors, borderRadius, spacing } from '@/lib/design-tokens';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ icon, value, label, color = colors.primary }: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
      }}
    >
      <div style={{ color, marginBottom: spacing.sm }}>{icon}</div>
      <div
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: color,
          marginBottom: spacing.xs,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '12px',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>
    </div>
  );
}
