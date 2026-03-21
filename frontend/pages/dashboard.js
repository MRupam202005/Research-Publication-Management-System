import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getHIndexAnalytics } from '@/services/analyticsService';

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        setLoadingStats(true);
        const data = await getHIndexAnalytics(token);
        setStats(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [token]);

  if (!user) {
    return (
      <div className="auth-bg">
        <div className="auth-card text-center">
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <main className="dashboard-main">
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-1 tracking-tight">
                Overview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                High level metrics across your research portfolio.
              </p>
            </section>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </div>
            )}

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'h-index', value: stats?.hIndex, from: 'from-blue-500', to: 'to-indigo-600' },
                { label: 'i10-index', value: stats?.i10Index, from: 'from-emerald-400', to: 'to-teal-600' },
                { label: 'Total citations', value: stats?.totalCitations, from: 'from-fuchsia-500', to: 'to-purple-700' }
              ].map(({ label, value, from, to }) => (
                  <div
                    key={label}
                    className={`p-6 rounded-2xl relative overflow-hidden shadow-lg bg-gradient-to-br ${from} ${to} text-white transition-transform hover:scale-[1.02]`}
                  >
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4)_0,_transparent_70%)]" />
                    <div className="relative z-10">
                      <p className="text-[12px] font-semibold tracking-[0.2em] uppercase mb-2 text-white/80">
                        {label}
                      </p>
                      <p className="text-4xl font-bold">
                        {loadingStats ? (
                          <span className="inline-flex h-10 w-20 rounded-lg bg-white/20 animate-pulse" />
                        ) : (
                          value ?? '--'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
            </section>

            <section className="card-surface p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Activity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Use the navigation to explore publications, authors, and
                analytics in more detail.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

