'use client';

export function Skeleton({ className = '', width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={className}
      style={{
        width: width || '100%',
        height: height || '20px',
        background: 'linear-gradient(90deg, var(--color-surface-1) 25%, var(--color-surface-2) 50%, var(--color-surface-1) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        borderRadius: '8px',
      }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px' }}>
        <Skeleton width="200px" height="40px" />
        <Skeleton width="80px" height="36px" />
      </div>
      <Skeleton width="100%" height="120px" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '32px' }}>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} height="100px" />)}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--color-hairline)', background: 'var(--color-surface-1)' }}>
      <Skeleton width="60%" height="24px" />
      <div style={{ marginTop: '16px' }}>
        <Skeleton width="100%" height="14px" />
        <div style={{ marginTop: '8px' }}><Skeleton width="80%" height="14px" /></div>
      </div>
    </div>
  );
}
