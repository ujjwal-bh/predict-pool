'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/app/components/header';
import Link from 'next/link';

export default function CreatePoolPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    maxMembers: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isPublic' ? value === 'true' : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic,
          maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const pool = await res.json();
      router.push(`/pools/${pool.id}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to create pool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-block">
            ← Back to Dashboard
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create a Pool</h1>
            <p className="text-slate-600 mb-8">Set up a new prediction pool for your group</p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Pool Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g., Friends World Cup 2026"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Add details about your pool..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="isPublic" className="block text-sm font-medium text-slate-700 mb-2">
                    Pool Type *
                  </label>
                  <select
                    id="isPublic"
                    name="isPublic"
                    value={formData.isPublic ? 'true' : 'false'}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Public (Anyone can join)</option>
                    <option value="false">Private (Invite only)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="maxMembers" className="block text-sm font-medium text-slate-700 mb-2">
                    Max Members (Optional)
                  </label>
                  <input
                    id="maxMembers"
                    type="number"
                    name="maxMembers"
                    placeholder="No limit"
                    value={formData.maxMembers}
                    onChange={handleChange}
                    min="2"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition"
              >
                {loading ? 'Creating pool...' : 'Create Pool'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
