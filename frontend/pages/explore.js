import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Search, ExternalLink, Download, Plus } from 'lucide-react';
import axios from 'axios';

export default function ExplorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const canManage = user && ['Researcher', 'Administrator'].includes(user.role);

  const handleAddPublication = (paper) => {
    sessionStorage.setItem('importPublication', JSON.stringify({
      title: paper.title || '',
      abstract: paper.abstract || '',
      doi: paper.doi ? paper.doi.replace('https://doi.org/', '') : '',
      year: paper.publicationYear?.toString() || ''
    }));
    router.push('/publications');
  };

  // Sync state with URL to persist search across navigation
  useEffect(() => {
    if (!router.isReady) return;
    
    const urlQuery = router.query.q;
    
    // If the URL has a query that we haven't loaded yet, run the search
    if (urlQuery && urlQuery !== query && !loading) {
      setQuery(urlQuery);
      executeSearch(urlQuery);
    } 
    // If the URL doesn't have a query but we do, clear our state (user hit 'back' to blank page)
    else if (!urlQuery && hasSearched) {
      setQuery('');
      setPapers([]);
      setHasSearched(false);
      setError('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.q]);

  const executeSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      // Use full URL or proxy if configured in Next.js
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/research/search`, {
        params: { query: searchQuery, limit: 15 }
      });
      setPapers(res.data.papers || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to search external papers');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    
    // Update the URL without a full page reload so it persists
    router.push({
      pathname: '/explore',
      query: { q: searchQuery }
    }, undefined, { shallow: true });
    
    // The search execution is handled by executeSearch, but we can call it immediately 
    // or let the useEffect handle it. It's faster to run it here:
    executeSearch(searchQuery);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

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
                  Explore Research
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Search millions of real-world, open-access academic papers using OpenAlex.
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <form onSubmit={handleSearch} className="relative z-10 flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for topics, keywords, authors..."
                    className="block w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 transition-all font-medium"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {/* Suggested Topics */}
              {!hasSearched && (
                <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Suggested Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Artificial Intelligence', 'Quantum Computing', 'Climate Change', 'Neuroscience', 'Machine Learning'].map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => performSearch(topic)}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 hover:dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full transition-colors border border-indigo-100 dark:border-indigo-800/50"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </div>
            )}

            {hasSearched && !loading && papers.length === 0 && !error && (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <Globe className="h-10 w-10 text-slate-400 mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No results found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search query to find more papers.</p>
              </div>
            )}

            {loading && (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse">
                    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
                    <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && papers.length > 0 && (
              <div className="grid gap-4">
                {papers.map((paper) => (
                  <div key={paper.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 leading-tight mb-1">
                          {paper.title}
                        </h3>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">
                          {paper.authors}
                          <span className="text-slate-400 dark:text-slate-500 font-normal ml-2">
                            • {paper.publicationYear}
                          </span>
                        </p>
                        {paper.abstract && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                            {paper.abstract}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs font-medium">
                          {paper.doi && (
                            <a href={paper.doi} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                              DOI
                            </a>
                          )}
                          <span className="text-slate-400">
                            {paper.citationsCount} Citations
                          </span>
                          {paper.isOpenAccess && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Open Access
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {paper.pdfUrl && (
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800/50"
                        >
                          <Download className="w-4 h-4" />
                          View PDF
                        </a>
                      )}
                      
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleAddPublication(paper)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Publication
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
