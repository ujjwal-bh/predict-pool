'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard');
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)]">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">
              ⚽
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)] whitespace-nowrap">Predict Pool</span>
          </div>

          {/* Nav buttons — never wrap, shrink text on tiny screens */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/login"
              className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-4 py-2 rounded-lg transition-all shadow-md whitespace-nowrap"
            >
              Sign Up
            </Link>
          </div>

        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <div className="mb-6 inline-block px-4 py-2 bg-blue-100 rounded-full">
          <p className="text-sm font-semibold text-blue-700">⚡ FIFA World Cup 2026</p>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
          Predict the World Cup
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
            Compete with Friends
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
          Create or join prediction pools. Make match predictions, earn points, and compete on the leaderboard with friends and colleagues.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/signup"
            className="w-full sm:w-auto text-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            🚀 Get Started Free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-center border-2 border-[var(--border-color)] hover:border-blue-500 text-[var(--text-primary)] px-8 py-3 rounded-lg font-semibold transition-all hover:bg-[var(--bg-secondary)]"
          >
            Already have an account?
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-12 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '➕', title: 'Create Pool', desc: 'Start a public or private prediction pool for your group' },
            { icon: '👥', title: 'Invite Friends', desc: 'Share the pool code or invite friends to join your competition' },
            { icon: '🎯', title: 'Make Predictions', desc: 'Predict the score and winner for every World Cup match' },
            { icon: '🏆', title: 'Win Points', desc: 'Earn 2 points for correct predictions and climb the leaderboard' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-[var(--bg-primary)] rounded-2xl p-6 sm:p-8 border border-[var(--border-color)] hover:shadow-lg transition-shadow">
              <div className="text-4xl sm:text-5xl mb-4">{icon}</div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h3>
              <p className="text-[var(--text-secondary)] text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scoring ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16 sm:my-20">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 text-center">Scoring System</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: '2️⃣', pts: '2 Points', label: 'Exact Score Match' },
              { emoji: '1️⃣', pts: '1 Point',  label: 'Correct Winner' },
              { emoji: '0️⃣', pts: '0 Points', label: 'Incorrect Prediction' },
            ].map(({ emoji, pts, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center border border-white/20">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-3">{emoji}</div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{pts}</div>
                <p className="text-white/90 font-medium text-sm sm:text-base">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">⚽ Ready to predict?</h2>
        <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10">
          Join thousands of World Cup fans making predictions and competing
        </p>
        <Link
          href="/signup"
          className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-base sm:text-lg"
        >
          🚀 Start Predicting Now
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Predict Pool</p>
          <p className="text-xs text-[var(--text-tertiary)]">FIFA World Cup 2026 Prediction Platform</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">&copy; 2026 Predict Pool. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}