import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import AuthorCard from '@/components/AuthorCard';
import { useAuth } from '@/context/AuthContext';
import { getAuthors, createAuthor, getCollaborationRecommendations } from '@/services/authorService';
import { getSelfCitations } from '@/services/analyticsService';
import { Sparkles, Users, Activity, X, UserPlus, Search } from 'lucide-react';

export default function AuthorsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState({
    name: '',
    orcid_id: '',
    affiliation: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [selfCitations, setSelfCitations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [authorStats, setAuthorStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const canManage =
    user && ['Administrator', 'Librarian'].includes(user.role);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const loadAuthors = async () => {
    if (!token) return;
    try {
      setLoadingAuthors(true);
      const data = await getAuthors(token);
      setAuthors(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load authors');
    } finally {
      setLoadingAuthors(false);
    }
  };

  useEffect(() => {
    loadAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    try {
      await createAuthor(token, form);
      setForm({
        name: '',
        orcid_id: '',
        affiliation: ''
      });
      await loadAuthors();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add author');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetInsights = async (author) => {
    if (!token) return;
    setSelectedAuthor(author);
    setIsInsightsOpen(true);
    setRecLoading(true);
    try {
      const [recData, citesData] = await Promise.all([
        getCollaborationRecommendations(token, author.author_id),
        getSelfCitations(token, author.author_id)
      ]);
      setRecommendations(recData);
      setSelfCitations(citesData);
    } catch (err) {
      console.error(err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleOpenDetails = async (author) => {
    if (!token) return;
    setSelectedAuthor(author);
    setIsDetailsOpen(true);
    setStatsLoading(true);
    setAuthorStats(null);
    try {
      const { getAuthorAnalytics } = await import('@/services/analyticsService');
      const stats = await getAuthorAnalytics(token, author.author_id);
      setAuthorStats(stats);
    } catch (err) {
       console.error(err);      
    } finally {
      setStatsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-bg">
        <div className="auth-card text-center">
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Derive filtered authors and suggestions client-side
  const filteredAuthors = authors.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.name?.toLowerCase().includes(term) ||
      a.affiliation?.toLowerCase().includes(term) ||
      a.orcid_id?.toLowerCase().includes(term)
    );
  });

  const getSuggestions = () => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    const suggestions = new Set();
    authors.forEach((a) => {
      if (a.name?.toLowerCase().includes(term)) suggestions.add(a.name);
      if (a.affiliation?.toLowerCase().includes(term)) suggestions.add(a.affiliation);
    });
    return Array.from(suggestions).slice(0, 5); // Max 5 suggestions
  };
  const suggestions = getSuggestions();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <main className="dashboard-main">
          <div className="flex flex-col gap-8">
            {/* Premium Header Banner */}
            <section className="relative overflow-hidden rounded-[2rem] bg-indigo-900 shadow-2xl border border-indigo-800">
              <div className="absolute inset-0">
                 <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-700 via-indigo-900 to-slate-900 opacity-90 mix-blend-multiply" />
              </div>
              
              {/* Decorative blurs */}
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[300px] h-[300px] bg-indigo-500/30 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[250px] h-[250px] bg-fuchsia-500/30 rounded-full blur-[60px]" />

              <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                      Author Directory
                    </h2>
                    <p className="text-indigo-200 text-sm md:text-base max-w-xl font-medium">
                      Explore departmental researchers, uncover collaboration insights, and analyze personal publication impact.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </div>
            )}

            {canManage && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-fuchsia-100 to-indigo-50 dark:from-fuchsia-900/20 dark:to-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="p-2.5 bg-fuchsia-50 dark:bg-fuchsia-900/30 rounded-xl text-fuchsia-600 dark:text-fuchsia-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Onboard New Researcher
                  </h3>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10"
                >
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      ORCID
                    </label>
                    <input
                      name="orcid_id"
                      value={form.orcid_id}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Affiliation
                    </label>
                    <input
                      name="affiliation"
                      value={form.affiliation}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-3 mt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 rounded-xl shadow-[0_0_20px_rgba(232,121,249,0.3)] hover:shadow-[0_0_25px_rgba(232,121,249,0.5)] disabled:opacity-60 transition-all hover:-translate-y-0.5"
                    >
                      {submitting ? 'Onboarding...' : 'Onboard Researcher'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Table Section */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Researcher Directory
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Explore institutional faculty and external collaborators.</p>
                  </div>
                </div>

                <div className="flex flex-col w-full sm:w-auto gap-3 sm:flex-row sm:items-center">
                  {/* Search / Filter Box */}
                  <div className="relative w-full sm:w-72">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search names, topics, or affiliations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white shadow-sm"
                      />
                    </div>
                    
                    {/* Suggestions Dropdown */}
                    {isSearchFocused && suggestions.length > 0 && (
                      <div className="absolute mt-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        {suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchTerm(sug);
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-2"
                          >
                            <Search className="w-3 h-3 opacity-50 shrink-0" />
                            <span className="truncate">{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {loadingAuthors && (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-xl animate-pulse whitespace-nowrap">
                       <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" /> Updating...
                    </span>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs md:text-sm border-collapse">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <tr>
                      <th className="py-4 px-4 pl-6 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                      <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[11px]">Affiliation</th>
                      <th className="py-4 px-4 font-semibold uppercase tracking-wider text-[11px]">ORCID</th>
                      <th className="py-4 px-4 pr-6 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loadingAuthors
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <tr key={idx}>
                            <td className="py-5 px-4 pl-6">
                              <div className="h-5 w-40 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                            <td className="py-5 px-4">
                              <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                            <td className="py-5 px-4">
                              <div className="h-4 w-28 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                            <td className="py-5 px-4 pr-6">
                              <div className="h-6 w-24 ml-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                          </tr>
                        ))
                      : filteredAuthors.map((author) => (
                          <tr
                            key={author.author_id}
                            className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 backdrop-blur-sm transition-all duration-300"
                          >
                            <td className="py-5 px-4 pl-6 align-middle">
                              <button 
                                onClick={() => handleOpenDetails(author)}
                                className="font-semibold text-slate-900 dark:text-slate-50 hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors text-sm md:text-base flex items-center gap-2"
                              >
                                {author.name}
                              </button>
                            </td>
                            <td className="py-5 px-4 align-middle text-slate-600 dark:text-slate-300 font-medium">
                              {author.affiliation || '—'}
                            </td>
                            <td className="py-5 px-4 align-middle text-slate-600 dark:text-slate-300">
                              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                {author.orcid_id || '—'}
                              </span>
                            </td>
                            <td className="py-5 px-4 pr-6 align-middle text-right">
                              <button
                                onClick={() => handleGetInsights(author)}
                                disabled={recLoading && selectedAuthor?.author_id === author.author_id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg transition-colors shadow-sm xl:opacity-0 xl:group-hover:opacity-100 transition-opacity duration-300"
                              >
                                <Sparkles className="w-4 h-4" />
                                {recLoading && selectedAuthor?.author_id === author.author_id 
                                  ? 'Loading...' 
                                  : 'Explore Insights'}
                              </button>
                            </td>
                          </tr>
                        ))}
                    {!loadingAuthors && filteredAuthors.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-sm text-slate-500 dark:text-slate-400 text-center bg-slate-50/50 dark:bg-slate-900/20"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                            No researchers match your filter.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Floating Insights Modal */}
            {isInsightsOpen && selectedAuthor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          Author Insights
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {selectedAuthor.name}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsInsightsOpen(false)}
                      className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                    {recLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <span className="text-sm font-medium text-slate-500 animate-pulse">Analyzing network & citations...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Collaborators Column */}
                        <div>
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-500" /> Suggested Collaborators
                          </h4>
                          {recommendations.length > 0 ? (
                            <div className="grid gap-3">
                              {recommendations.map(rec => (
                                <div key={rec.author_id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                                  <div className="truncate pr-4">
                                    <h5 className="font-medium inline text-sm text-slate-900 dark:text-slate-50 truncate">{rec.name}</h5>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{rec.affiliation || 'Unknown Affiliation'}</p>
                                  </div>
                                  <div className="shrink-0 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded">
                                    {rec.mutual_connections} Mutual
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">No mutual collaborators found.</p>
                          )}
                        </div>

                        {/* Self Citations Column */}
                        <div>
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <Activity className="w-4 h-4 text-rose-500" /> Self-Citation Pattern
                          </h4>
                          {selfCitations && selfCitations.count !== undefined ? (
                            <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                              <div className="flex items-end gap-3 mb-2">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white leading-none">{selfCitations.count}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">self-citations</span>
                              </div>
                              {selfCitations.count > 3 ? (
                                <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 text-xs rounded border border-rose-100 dark:border-rose-800/50">
                                  Warning: High rate of self-citations may artificially inflate metrics.
                                </div>
                              ) : selfCitations.count > 0 ? (
                                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs rounded border border-amber-100 dark:border-amber-800/50">
                                  Moderate level observed. Typical for cumulative research.
                                </div>
                              ) : (
                                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 text-xs rounded border border-emerald-100 dark:border-emerald-800/50">
                                  Excellent: No self-citations detected in the tracking record.
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">Self-citation data unavailable.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Floating Author Details Modal */}
            {isDetailsOpen && selectedAuthor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Author Profile</h3>
                    <button 
                      onClick={() => setIsDetailsOpen(false)}
                      className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedAuthor.name}</h2>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                        {selectedAuthor.affiliation || 'No affiliation recorded'}
                      </p>
                      {selectedAuthor.orcid_id && (
                        <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-900/20 inline-flex px-2 py-1 rounded">
                          ORCID: {selectedAuthor.orcid_id}
                        </p>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wide">
                      Research Impact
                    </h4>
                    
                    {statsLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      </div>
                    ) : authorStats ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Publications</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{authorStats.total_papers}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Total Citations</p>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{authorStats.total_citations}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">h-index</p>
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{authorStats.h_index}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">i10-index</p>
                          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{authorStats.i10_index}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500">
                        No publications or citation data available for this author.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

