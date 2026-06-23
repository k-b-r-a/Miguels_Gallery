import { ReactNode } from 'react';

export default function LinkButton({
  children,
  href,
  className = '',
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <div className={`relative max-lg:row-auto ${className}`}>
      <a
        target="_blank"
        href={href}
        role="link"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base transition-all rounded-2xl border backdrop-blur-sm group focus:outline-none focus-visible:ring-2 ring-purple-500/50 active:scale-95"
        style={{ 
            backgroundColor: 'color-mix(in srgb, var(--bg-card) 20%, transparent)',
            borderColor: 'var(--border)',
            color: 'var(--text-main)'
        }}
        rel="noreferrer"
      >
        {children}
      </a>
    </div>
  );
}
