import Link from 'next/link';

export default function NotFound() {
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
        fontSize: '120px',
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.05em',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px',
      }}>
        404
      </div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--color-ink)',
        marginBottom: '12px',
        letterSpacing: '-0.02em',
      }}>
        Halaman Tidak Ditemukan
      </h1>
      <p style={{
        fontSize: '16px',
        color: 'var(--color-ink-muted)',
        maxWidth: '440px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        Halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau tidak pernah ada.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: 'var(--color-primary)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'background 0.2s',
        }}
      >
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
