import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Sign in to manage research publications and analytics.
        </p>
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/60 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/60 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-xs text-gray-500 text-center">
          New here?
          {' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

