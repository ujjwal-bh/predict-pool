'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-primary)]/80 border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* LEFT: Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg shadow-sm group-hover:scale-105 transition-transform">
            ⚽
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-[var(--text-primary)]">
              Predict Pool
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              World Cup Predictions
            </span>
          </div>
        </Link>

        {/* RIGHT: User */}
        {session?.user && (
          <div className="flex items-center gap-4">

            {/* User Info */}
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {session.user.name}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {session.user.email}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 rounded-xl text-sm font-medium 
                         bg-slate-100 hover:bg-slate-200 
                       
                         text-[var(--bg-background)] transition-all"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}