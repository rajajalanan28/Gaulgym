import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-canvas)] text-[var(--color-ink)] p-4">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-bold text-[var(--color-primary)]">404</h1>
        <h2 className="text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-[var(--color-ink-muted)] max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="pt-4">
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
