'use client';

interface WelcomeCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export function WelcomeCard({ title, subtitle, icon = '👋' }: WelcomeCardProps) {
  return (
    <div className="bg-[var(--color-surface-2)] hairline-border-strong rounded-[16px] p-[32px] shadow-sm">
      <div className="flex items-center gap-[16px]">
        <span className="text-[40px] leading-none">{icon}</span>
        <div>
          <h2 className="text-[20px] font-medium text-[var(--color-ink)] mb-1 tracking-[-0.01em]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[14px] text-[var(--color-ink-muted)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
