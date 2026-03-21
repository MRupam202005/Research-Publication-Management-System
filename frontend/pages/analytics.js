import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { SimpleBarChart, SimpleLineChart } from '@/components/AnalyticsChart';
import { useAuth } from '@/context/AuthContext';
import {
  getHIndexAnalytics,
  getCitationsAnalytics,
  getAuthorAnalytics
} from '@/services/analyticsService';
import { getPapers } from '@/services/paperService';
import { getAuthors } from '@/services/authorService';

export default function AnalyticsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [hIndexStats, setHIndexStats] = useState(null);
  const [citationStats, setCitationStats] = useState(null);
  const [papers, setPapers] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        // Fire the primary dashboard stats in parallel
        const [hData, cData, papersData, authorsData] = await Promise.all([
          getHIndexAnalytics(token),
          getCitationsAnalytics(token),
          getPapers(token),
          getAuthors(token)
        ]);

        setHIndexStats(hData);
        setCitationStats(cData);
        setPapers(papersData);

        // Fetch precise metrics for the top 5 authors to figure out their citation count safely
        if (authorsData && authorsData.length > 0) {
          const sampleAuthors = authorsData.slice(0, 5);
          const authorStatsPromises = sampleAuthors.map((a) =>
            getAuthorAnalytics(token, a.author_id).catch(() => null)
          );
          const stats = await Promise.all(authorStatsPromises);
          
          const combinedAuthors = sampleAuthors.map((author, index) => {
            const authorStat = stats[index];
            return {
              label: author.name,
              value: authorStat ? authorStat.total_citations : 0
            };
          });

          // Sort by highest citations
          combinedAuthors.sort((a, b) => b.value - a.value);
          setTopAuthors(combinedAuthors);
        }

      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Derive charts
  const publicationsPerYear = useMemo(() => {
    if (!papers) return [];
    const counts = {};
    papers.forEach(p => {
      if (p.year) {
        counts[p.year] = (counts[p.year] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([year, count]) => ({ label: year, value: count }))
      .sort((a, b) => Number(a.label) - Number(b.label)); // Chronological
  }, [papers]);

  const citationsPerYear = useMemo(() => {
    if (!papers) return [];
    const counts = {};
    papers.forEach(p => {
      if (p.year && p.citation_count) {
        counts[p.year] = (counts[p.year] || 0) + Number(p.citation_count);
      }
    });
    return Object.entries(counts)
      .map(([year, count]) => ({ label: year, value: count }))
      .sort((a, b) => Number(a.label) - Number(b.label));
  }, [papers]);

  const mostCitedPapersChart = useMemo(() => {
    if (!hIndexStats?.perPaper) return [];
    return hIndexStats.perPaper.slice(0, 5).map((p) => ({
      label: p.title.length > 15 ? `${p.title.slice(0, 15)}…` : p.title,
      value: Number(p.citation_count) || 0
    }));
  }, [hIndexStats]);

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
      <div className="dashboard-content bg-slate-50 dark:bg-slate-950 min-h-screen">
        <Navbar />
        <main className="dashboard-main p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            <section className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1 tracking-tight">
                  Analytics Dashboard
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Comprehensive breakdown of citation metrics and historical publication output.
                </p>
              </div>
            </section>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Global Metrics Row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'h-index', val: hIndexStats?.hIndex },
                { label: 'i10-index', val: hIndexStats?.i10Index },
                { label: 'Total Citations', val: hIndexStats?.totalCitations }
              ].map(stat => (
                <div key={stat.label} className="card-surface p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 relative z-10">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white relative z-10">
                    {isLoading ? <span className="inline-flex h-9 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /> : (stat.val ?? '--')}
                  </p>
                </div>
              ))}
            </section>

            {/* Charts Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card-surface h-80 p-4 flex flex-col justify-center items-center">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-6" />
                    <div className="w-full h-3/4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                  </div>
                ))
              ) : (
                <>
                  <SimpleBarChart 
                    title="Publications Per Year" 
                    data={publicationsPerYear} 
                    xKey="label" 
                    yKey="value" 
                    color="#3b82f6" 
                  />
                  <SimpleLineChart 
                    title="Citations Accumulation (by pub. year)" 
                    data={citationsPerYear} 
                    xKey="label" 
                    yKey="value" 
                    color="#10b981" 
                  />
                  <SimpleBarChart 
                    title="Top Authors by Citations" 
                    data={topAuthors} 
                    xKey="label" 
                    yKey="value" 
                    color="#f59e0b" 
                  />
                  <SimpleBarChart 
                    title="Most Cited Papers" 
                    data={mostCitedPapersChart} 
                    xKey="label" 
                    yKey="value" 
                    color="#8b5cf6" 
                  />
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
