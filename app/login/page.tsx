'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/firebase/auth';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error } = await signIn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else if (user) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#111d4a' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="transform scale-150">
              <div className="flex items-center">
                <div className="relative">
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-2xl font-black tracking-tighter" style={{ color: '#96c5b0' }}>HD</span>
                    <span className="text-xl font-black tracking-tighter" style={{ color: '#510d0a' }}>.</span>
                    <span className="text-2xl font-black tracking-tighter" style={{ color: '#96c5b0' }}>HQ</span>
                  </div>
                  <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#96c5b0' }}></div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight" style={{ color: '#96c5b0' }}>
            Welcome Back
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#857c8d' }}>Sign in to manage your projects</p>
        </div>
        <form className="mt-8 space-y-6 bg-white rounded-xl shadow-2xl p-8" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-transparent text-sm font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all"
              style={{
                backgroundColor: '#96c5b0',
                color: '#191102',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#857c8d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#96c5b0'}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/signup" className="text-sm font-medium transition-colors" style={{ color: '#857c8d' }}>
              Don't have an account? <span className="font-bold">Sign up</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
