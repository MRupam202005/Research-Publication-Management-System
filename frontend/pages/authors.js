import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import AuthorCard from '@/components/AuthorCard';
import { useAuth } from '@/context/AuthContext';
import { getAuthors, createAuthor, getCollaborationRecommendations } from '@/services/authorService';
import { getSelfCitations } from '@/services/analyticsService';
import { Sparkles, Users, Activity } from 'lucide-react';

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

  const [recommendations, setRecommendations] = useState([]);
  const [selfCitations, setSelfCitations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  const canManage =
    user && ['Department', 'Administrator'].includes(user.role);

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
            <section className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-1 tracking-tight">
                  Authors
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage and explore authors and affiliations.
                </p>
              </div>
            </section>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </div>
            )}

            {canManage && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-50 dark:bg-fuchsia-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-5 relative z-10">
                  Add author
                </h3>
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
                  <div className="md:col-span-3 mt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
                    >
                      {submitting ? 'Adding...' : 'Add author'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            <section className="card-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  All authors
                </h3>
                {loadingAuthors && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Loading...
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs md:text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-2 pr-3 font-medium">Name</th>
                      <th className="py-2 px-3 font-medium">Affiliation</th>
                      <th className="py-2 px-3 font-medium">ORCID</th>
                      <th className="py-2 px-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAuthors
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 pr-3">
                              <div className="h-4 w-40 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                            <td className="py-2 px-3">
                              <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                            <td className="py-2 px-3">
                              <div className="h-4 w-28 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                            <td className="py-2 px-3">
                              <div className="h-4 w-24 ml-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                          </tr>
                        ))
                      : authors.map((author) => (
                          <tr
                            key={author.author_id}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                          >
                            <td className="py-2 pr-3 align-top">
                              <p className="font-medium text-slate-900 dark:text-slate-50">
                                {author.name}
                              </p>
                            </td>
                            <td className="py-2 px-3 align-top text-slate-600 dark:text-slate-300">
                              {author.affiliation || '—'}
                            </td>
                            <td className="py-2 px-3 align-top text-slate-600 dark:text-slate-300">
                              <span className="text-[11px] md:text-xs font-mono">
                                {author.orcid_id || '—'}
                              </span>
                            </td>
                            <td className="py-2 px-3 align-top text-right">
                              <button
                                onClick={() => handleGetInsights(author)}
                                disabled={recLoading && selectedAuthor?.author_id === author.author_id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                {recLoading && selectedAuthor?.author_id === author.author_id 
                                  ? 'Loading...' 
                                  : 'Insights'}
                              </button>
                            </td>
                          </tr>
                        ))}
                    {!loadingAuthors && authors.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-sm text-slate-500 dark:text-slate-400 text-center"
                        >
                          No authors found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Insights Section */}
            {selectedAuthor && (
              <section className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-slate-900 border border-indigo-100 dark:border-indigo-800/50 shadow-sm rounded-xl p-6 relative overflow-hidden mt-2 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Author Insights for {selectedAuthor.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Explore collaboration opportunities and self-citation patterns.
                    </p>
                  </div>
                </div>

                {recLoading ? (
                  <div className="flex items-center justify-center p-8 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-dashed border-indigo-200 dark:border-indigo-800">
                    <span className="text-sm font-medium text-slate-500 animate-pulse">Analyzing network...</span>
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
                            <div key={rec.author_id} className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
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
                        <p className="text-sm text-slate-500">No mutual collaborators found.</p>
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
                            <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">self-citations detected</span>
                          </div>
                          {selfCitations.count > 3 ? (
                            <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 text-xs rounded border border-rose-100 dark:border-rose-800/50">
                              Warning: This author exhibits a high rate of self-citations which may artificially inflate metrics.
                            </div>
                          ) : selfCitations.count > 0 ? (
                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs rounded border border-amber-100 dark:border-amber-800/50">
                              Moderate level of self-citation observed. This is typical for cumulative research.
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
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

