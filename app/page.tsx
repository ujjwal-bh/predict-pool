'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-color)] backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              ⚽
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Predict Pool</h1>
          </div>
          <div className="space-x-3">
            <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-6 inline-block px-4 py-2 bg-blue-100 rounded-full">
          <p className="text-sm font-semibold text-blue-700">⚡ FIFA World Cup 2026</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6">
          Predict the World Cup
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
            Compete with Friends
          </span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
          Create or join prediction pools. Make match predictions, earn points, and compete on the leaderboard with friends and colleagues.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup" className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl">
            🚀 Get Started Free
          </Link>
          <Link href="/login" className="border-2 border-[var(--border-color)] hover:border-blue-500 text-[var(--text-primary)] px-8 py-3 rounded-lg font-semibold transition-all hover:bg-[var(--bg-secondary)]">
            Already have account?
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-16 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[var(--bg-primary)] rounded-2xl p-8 border border-[var(--border-color)] hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">➕</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Create Pool</h3>
            <p className="text-[var(--text-secondary)] text-sm">Start a public or private prediction pool for your group</p>
          </div>

          <div className="bg-[var(--bg-primary)] rounded-2xl p-8 border border-[var(--border-color)] hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Invite Friends</h3>
            <p className="text-[var(--text-secondary)] text-sm">Share the pool code or invite friends to join your competition</p>
          </div>

          <div className="bg-[var(--bg-primary)] rounded-2xl p-8 border border-[var(--border-color)] hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Make Predictions</h3>
            <p className="text-[var(--text-secondary)] text-sm">Predict the score and winner for every World Cup match</p>
          </div>

          <div className="bg-[var(--bg-primary)] rounded-2xl p-8 border border-[var(--border-color)] hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Win Points</h3>
            <p className="text-[var(--text-secondary)] text-sm">Earn 2 points for correct predictions and climb the leaderboard</p>
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl my-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Scoring System</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
            <div className="text-5xl font-bold text-white mb-3">2️⃣</div>
            <div className="text-3xl font-bold text-white mb-2">2 Points</div>
            <p className="text-white/90 font-medium">Exact Score Match</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
            <div className="text-5xl font-bold text-white mb-3">1️⃣</div>
            <div className="text-3xl font-bold text-white mb-2">1 Point</div>
            <p className="text-white/90 font-medium">Correct Winner</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
            <div className="text-5xl font-bold text-white mb-3">0️⃣</div>
            <div className="text-3xl font-bold text-white mb-2">0 Points</div>
            <p className="text-white/90 font-medium">Incorrect Prediction</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-[var(--text-primary)] mb-4">⚽ Ready to predict?</h2>
        <p className="text-xl text-[var(--text-secondary)] mb-10">Join thousands of World Cup fans making predictions and competing</p>
        <Link href="/signup" className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-lg">
          🚀 Start Predicting Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="mb-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Predict Pool</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">FIFA World Cup 2026 Prediction Platform</p>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">&copy; 2026 Predict Pool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
