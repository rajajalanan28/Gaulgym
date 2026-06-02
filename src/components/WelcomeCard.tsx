'use client';

import { colors, gradients, borderRadius, spacing } from '@/lib/design-tokens';

interface WelcomeCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export function WelcomeCard({ title, subtitle, icon = '👋' }: WelcomeCardProps) {
  return (
    <div
      style={{
        background: gradients.primary,
        borderRadius: borderRadius.lg,
        padding: '24px',
        color: colors.textPrimary,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px' }}>{icon}</span>
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              color: colors.textPrimary,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: '14px',
                margin: '4px 0 0 0',
                opacity: 0.9,
                color: colors.textPrimary,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
