import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getPaperById } from '@/services/paperService';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Hash, ExternalLink, Link as LinkIcon, User } from 'lucide-react';

export default function PublicationDetail() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [paper, setPaper] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!token || !id) return;
      try {
        setIsLoading(true);
        const data = await getPaperById(token, id);
        setPaper(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load publication details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaper();
  }, [token, id]);

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
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <div className="mb-6">
              <Link
                href="/publications"
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Publications
              </Link>
            </div>

            {error && (
              <div className="mb-6 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : paper ? (
              <article className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                {/* Header Section */}
                <header className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {paper.publication_year}
                    </span>
                    {paper.journal_name && (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                        {paper.journal_name}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                    {paper.title}
                  </h1>
                  
                  {paper.doi && (
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-2 hover:text-primary-600 dark:hover:text-primary-400">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {paper.doi}
                      </a>
                    </div>
                  )}
                </header>

                {/* Abstract Section */}
                {paper.abstract && (
                  <section className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Abstract</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-none text-sm sm:text-base">
                      {paper.abstract}
                    </p>
                  </section>
                )}

                {/* Authors Section */}
                <section className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Authors</h2>
                  {paper.authors && paper.authors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {paper.authors.map((author) => (
                        <div key={author.author_id} className="inline-flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                          <User className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{author.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No authors listed.</p>
                  )}
                </section>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                  {paper.keywords && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Keywords</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {paper.keywords.split(',').map((kw, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                            <Hash className="w-3 h-3 mr-1 text-slate-400" />
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {paper.conference && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Conference</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{paper.conference}</p>
                    </div>
                  )}
                  {paper.publisher && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Publisher</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{paper.publisher}</p>
                    </div>
                  )}
                  {paper.pdf_url && (
                    <div className="sm:col-span-2 mt-2">
                        <a 
                          href={paper.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Full Text PDF
                        </a>
                    </div>
                  )}
                </div>
              </article>
            ) : null}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
