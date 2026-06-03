'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-canvas)',
      color: 'var(--color-ink)',
      padding: '32px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        fontSize: '32px',
      }}>
        ⚠
      </div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--color-ink)',
        marginBottom: '12px',
        letterSpacing: '-0.02em',
      }}>
        Terjadi Kesalahan
      </h1>
      <p style={{
        fontSize: '16px',
        color: 'var(--color-ink-muted)',
        maxWidth: '440px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau kembali ke halaman sebelumnya.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={reset}
          style={{
            padding: '12px 24px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Coba Lagi
        </button>
        <a
          href="/"
          style={{
            padding: '12px 24px',
            background: 'var(--color-surface-1)',
            color: 'var(--color-ink)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Ke Beranda
        </a>
      </div>
    </div>
  );
}
