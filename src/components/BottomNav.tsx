'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Tag, Users, UserCheck, User, Globe, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Hanya tampilkan Bottom Nav jika user sudah login (berada di dashboard)
  if (!user) return null;

  const ownerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Paket', path: '/dashboard/packages', icon: <Tag size={20} /> },
    { name: 'Member', path: '/owner/member', icon: <Users size={20} /> },
    { name: 'Kasir', path: '/admin/pos', icon: <ShoppingCart size={20} /> },
    { name: 'Profil', path: '/profile', icon: <User size={20} /> },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <Home size={20} /> },
    { name: 'Member', path: '/admin/member', icon: <Users size={20} /> },
    { name: 'Kasir', path: '/admin/pos', icon: <ShoppingCart size={20} /> },
    { name: 'Profil', path: '/profile', icon: <User size={20} /> },
  ];

  const memberLinks = [
    { name: 'Beranda', path: '/', icon: <Globe size={20} /> },
    { name: 'Dashboard', path: '/member/dashboard', icon: <Home size={20} /> },
    { name: 'Profil', path: '/profile', icon: <User size={20} /> },
  ];

  const links = user.role === 'Owner' ? ownerLinks : user.role === 'Admin' ? adminLinks : memberLinks;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[var(--color-surface-1)]/90 backdrop-blur-md border-t border-[var(--color-hairline)] z-50 md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-[64px] px-2">
        {links.map((link) => {
          const isActive = pathname === link.path || pathname?.startsWith(link.path + '/');
          
          return (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-[var(--color-primary)]/10' : ''}`}>
                {link.icon}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {link.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
