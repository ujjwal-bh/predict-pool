'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function Header() {
  const { data: session } = useSession();
  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-50 bg-[#08090D]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-6 h-6 md:w-8 md:h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-base shadow-lg shadow-blue-900/40 group-hover:scale-105 transition-transform flex-shrink-0">
            ⚽
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs md:text-base font-black text-white tracking-tight">
              PredictPool
            </span>
            <span className="hidden sm:block text-[10px] font-semibold text-white/30 tracking-wide">
              World Cup 2026
            </span>
          </div>
        </Link>

        {/* Right side */}
        {session?.user && (
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Name + email — hidden on mobile */}
            <div className="hidden sm:flex flex-col items-end leading-tight max-w-[160px]">
              <span className="text-sm font-700 text-white truncate w-full text-right">
                {session.user.name}
              </span>
              <span className="text-[11px] text-white/35 truncate w-full text-right">
                {session.user.email}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white/10 flex-shrink-0">
              {initial}
            </div>

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-xs sm:text-sm font-semibold text-white/60 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 sm:px-4 transition-all whitespace-nowrap"
            >
              Sign out
            </button>

          </div>
        )}

      </div>
    </header>
  );
}