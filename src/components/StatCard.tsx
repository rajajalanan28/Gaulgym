'use client';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="bg-[var(--color-surface-1)] hairline-border rounded-[12px] p-[24px]">
      <div className="text-[var(--color-ink-subtle)] mb-4">{icon}</div>
      <div className="text-[32px] font-semibold text-[var(--color-ink)] mb-1 tracking-[-0.02em] leading-[1]">
        {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
      </div>
      <div className="text-[12px] font-medium text-[var(--color-ink-tertiary)] uppercase tracking-[0.04em]">
        {label}
      </div>
    </div>
  );
}
