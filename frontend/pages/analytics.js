import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { SimpleBarChart, SimpleLineChart } from '@/components/AnalyticsChart';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, BookOpen, Search } from 'lucide-react';
import {
  getHIndexAnalytics,
  getCitationsAnalytics,
  getAuthorAnalytics,
  getBipartiteGraph
} from '@/services/analyticsService';
import { getPapers } from '@/services/paperService';
import { getAuthors } from '@/services/authorService';

const BipartiteGraph = dynamic(() => import('@/components/BipartiteGraph'), { ssr: false });

export default function AnalyticsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [hIndexStats, setHIndexStats] = useState(null);
  const [citationStats, setCitationStats] = useState(null);
  const [graphData, setGraphData] = useState(null);
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
        const [hData, cData, graphRes, papersData, authorsData] = await Promise.all([
          getHIndexAnalytics(token),
          getCitationsAnalytics(token),
          getBipartiteGraph(token),
          getPapers(token),
          getAuthors(token)
        ]);

        setHIndexStats(hData);
        setCitationStats(cData);
        setGraphData(graphRes);
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

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const metricsRow = [
    { label: 'h-index', val: hIndexStats?.hIndex, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'i10-index', val: hIndexStats?.i10Index, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Citations', val: hIndexStats?.totalCitations, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content bg-slate-50 dark:bg-slate-950 min-h-screen relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <Navbar />
        
        <main className="dashboard-main p-4 md:p-6 lg:p-8 relative z-10">
          <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2 tracking-tight">
                  Analytics Dashboard
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Comprehensive breakdown of citation metrics and historical publication output.
                </p>
              </div>
            </motion.section>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                {error}
              </motion.div>
            )}

            {/* Global Metrics Row */}
            <motion.section 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {metricsRow.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={stat.label} 
                    variants={itemVariants}
                    className="card-surface p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex items-start gap-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className={`p-4 rounded-xl flex-shrink-0 ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                        {stat.label}
                      </p>
                      <p className="text-4xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">
                        {isLoading ? <span className="inline-flex h-10 w-16 rounded bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" /> : (stat.val ?? '--')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.section>

            {/* Charts Grid */}
            <motion.section 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12"
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <motion.div variants={itemVariants} key={i} className="card-surface h-80 p-4 flex flex-col justify-center items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800/70 rounded animate-pulse mb-6" />
                    <div className="w-full h-3/4 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                  </motion.div>
                ))
              ) : (
                <>
                  <motion.div variants={itemVariants} className="hover:scale-[1.01] transition-transform duration-300">
                    <SimpleBarChart 
                      title="Publications Per Year" 
                      data={publicationsPerYear} 
                      xKey="label" 
                      yKey="value" 
                      color="#3b82f6" 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="hover:scale-[1.01] transition-transform duration-300">
                    <SimpleLineChart 
                      title="Citations Accumulation" 
                      data={citationsPerYear} 
                      xKey="label" 
                      yKey="value" 
                      color="#10b981" 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="hover:scale-[1.01] transition-transform duration-300">
                    <SimpleBarChart 
                      title="Top Authors by Citations" 
                      data={topAuthors} 
                      xKey="label" 
                      yKey="value" 
                      color="#f59e0b" 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="hover:scale-[1.01] transition-transform duration-300">
                    <SimpleBarChart 
                      title="Most Cited Papers" 
                      data={mostCitedPapersChart} 
                      xKey="label" 
                      yKey="value" 
                      color="#8b5cf6" 
                    />
                  </motion.div>
                </>
              )}
            </motion.section>

            {/* Bipartite Graph Section */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-20"
            >
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-500/10 rounded-lg">
                    <Search className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                    Research Fields Network Map
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 ml-12">
                  Interactive bipartite graph visualizing global connections between Authors (Blue nodes) and Research Keywords (Orange nodes).
                </p>
                <div className="w-full relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/80">
                  {isLoading ? (
                    <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                  ) : (
                    <BipartiteGraph graphData={graphData} />
                  )}
                </div>
              </div>
            </motion.section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
