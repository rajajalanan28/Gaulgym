'use client';

import Link from 'next/link';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
}

export function MenuItem({ icon, title, subtitle, onClick, href }: MenuItemProps) {
  const content = (
    <div className="flex items-center gap-[16px]">
      <div className="p-[10px] rounded-[8px] bg-[var(--color-surface-3)] hairline-border text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink)] transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-[14px] font-medium text-[var(--color-ink)] m-0">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[13px] text-[var(--color-ink-muted)] m-0 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[var(--color-ink-tertiary)] group-hover:text-[var(--color-ink-subtle)] transition-colors">
        <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  const className = `bg-[var(--color-surface-1)] hairline-border rounded-[12px] p-[20px] group transition-colors ${
    (onClick || href) ? 'cursor-pointer hover:bg-[var(--color-surface-2)]' : 'cursor-default'
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={className}>
      {content}
    </div>
  );
}
