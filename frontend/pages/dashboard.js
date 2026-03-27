import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getHIndexAnalytics, getCitationsAnalytics } from '@/services/analyticsService';
import { TrendingUp, Award, BookOpen, Activity, ArrowRight, Sparkles, Network } from 'lucide-react';

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [deptStats, setDeptStats] = useState(null);
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
        const [data, citationsData] = await Promise.all([
          getHIndexAnalytics(token),
          getCitationsAnalytics(token).catch(() => null)
        ]);
        setStats(data);
        if (citationsData) {
          setDeptStats(citationsData.perDepartment);
        }
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
        <main className="dashboard-main space-y-8">
          
          {/* Hero Banner Section */}
          <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-slate-800">
            <div className="absolute inset-0">
               <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" alt="Tech Background"/>
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-slate-900/90 to-transparent" />
            </div>
            
            {/* Modern shapes & blurs */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[80px]" />

            <div className="relative z-10 p-8 md:p-12 lg:p-16 text-white max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-semibold mb-6 backdrop-blur-md shadow-sm">
                <Sparkles className="w-4 h-4" /> 
                <span className="tracking-wide uppercase text-[11px]">Welcome to ResearchNexus</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-[1.15]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300 animate-pulse">
                  Empower Your Research
                </span><br/>
                Elevate Your Impact.
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed font-medium">
                Discover collaboration opportunities, track your institutional metrics in real-time, and leverage our bipartite network analysis to find your next breakthrough.
              </p>
              <button 
                onClick={() => router.push('/analytics')}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 group"
              >
                Explore Analytics <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-8">
            <section className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1 tracking-tight">
                  Portfolio Overview
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Real-time top-level metrics across your research output.
                </p>
              </div>
            </section>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 shadow-sm">
                {error}
              </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'h-index', value: stats?.hIndex, icon: TrendingUp, from: 'from-blue-600', via: 'via-indigo-600', to: 'to-purple-700' },
                { label: 'i10-index', value: stats?.i10Index, icon: Award, from: 'from-emerald-500', via: 'via-teal-600', to: 'to-cyan-700' },
                { label: 'Total citations', value: stats?.totalCitations, icon: Activity, from: 'from-fuchsia-600', via: 'via-pink-600', to: 'to-rose-600' }
              ].map(({ label, value, icon: Icon, from, via, to }) => (
                  <div
                    key={label}
                    className={`p-6 md:p-8 rounded-[2rem] relative overflow-hidden shadow-xl bg-gradient-to-br ${from} ${via} ${to} text-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group`}
                  >
                    {/* Abstract Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold tracking-[0.2em] uppercase mb-1 text-white/80 drop-shadow-sm">
                          {label}
                        </p>
                        <p className="text-5xl md:text-6xl font-black drop-shadow-md tracking-tight">
                          {loadingStats ? (
                            <span className="inline-flex h-12 w-24 rounded-xl bg-white/20 animate-pulse mt-1" />
                          ) : (
                            value ?? '--'
                          )}
                        </p>
                      </div>
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

            {user?.role === 'Department' && (
              <section className="mt-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                    <Network className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                      Department Intelligence
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Analyze inter-departmental publication output and cross-collaboration.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">Output by Department</h3>
                  {deptStats && deptStats.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deptStats.map((dept, idx) => (
                        <li key={idx} className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">{dept.department || 'Unspecified'}</span>
                          </div>
                          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
                            {dept.publication_count} papers
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-slate-500 font-medium">No departmental correlation data available yet.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

