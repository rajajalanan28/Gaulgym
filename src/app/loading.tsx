import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)]">
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
        <h2 className="text-xl font-medium text-[var(--color-ink)]">Memuat...</h2>
        <div className="w-48 h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--color-primary)] rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
