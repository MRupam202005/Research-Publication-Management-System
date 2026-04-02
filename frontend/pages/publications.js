import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, FileText, PlusCircle, Search } from 'lucide-react';
import {
  getPapers,
  createPaper,
  updatePaper,
  deletePaper
} from '@/services/paperService';

export default function PublicationsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [papers, setPapers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    abstract: '',
    doi: '',
    year: '',
    journal_id: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingPapers, setLoadingPapers] = useState(false);

  const canManage =
    user && ['Researcher', 'Administrator'].includes(user.role);
  const canDelete = user && user.role === 'Administrator';

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const loadPapers = async () => {
    if (!token) return;
    try {
      setLoadingPapers(true);
      const data = await getPapers(token);
      setPapers(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load publications');
    } finally {
      setLoadingPapers(false);
    }
  };

  useEffect(() => {
    loadPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    // Check if we are importing a publication from explore search
    const importedData = sessionStorage.getItem('importPublication');
    if (importedData) {
      try {
        const parsedData = JSON.parse(importedData);
        setForm((prev) => ({
          ...prev,
          title: parsedData.title || '',
          abstract: parsedData.abstract || '',
          doi: parsedData.doi || '',
          year: parsedData.year || ''
        }));
        
        // Scroll to the top where the add publication form is located
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Failed to parse imported publication', err);
      } finally {
        sessionStorage.removeItem('importPublication');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      abstract: '',
      doi: '',
      year: '',
      journal_id: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        publication_year: Number(form.year) || new Date().getFullYear(),
        journal_id: form.journal_id ? Number(form.journal_id) : null
      };
      if (editingId) {
        await updatePaper(token, editingId, payload);
      } else {
        await createPaper(token, payload);
      }
      await loadPapers();
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save publication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (paper) => {
    setEditingId(paper.paper_id);
    setForm({
      title: paper.title || '',
      abstract: paper.abstract || '',
      doi: paper.doi || '',
      year: paper.year?.toString() || '',
      journal_id: paper.journal_id?.toString() || ''
    });
  };

  const handleDelete = async (id) => {
    if (!token) return;
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      'Are you sure you want to delete this publication?'
    );
    if (!confirmed) return;
    try {
      await deletePaper(token, id);
      await loadPapers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete publication');
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
          <div className="flex flex-col gap-8">
            {/* Premium Header Banner */}
            <section className="relative overflow-hidden rounded-[2rem] bg-indigo-900 shadow-2xl border border-indigo-800">
              <div className="absolute inset-0">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-900 to-slate-900 opacity-90 mix-blend-multiply" />
              </div>
              
              {/* Decorative blurs */}
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[300px] h-[300px] bg-blue-500/30 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[250px] h-[250px] bg-purple-500/30 rounded-full blur-[60px]" />

              <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                      Publications
                    </h2>
                    <p className="text-indigo-200 text-sm md:text-base max-w-xl font-medium">
                      Browse, manage, and explore the complete repository of institutional research papers and their citation networks.
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
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    {editingId ? <FileText className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {editingId ? 'Edit Publication Details' : 'Add New Publication'}
                  </h3>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10"
                >
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Title
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Abstract
                    </label>
                    <textarea
                      name="abstract"
                      value={form.abstract}
                      onChange={handleChange}
                      rows={6}
                      className="block w-full min-h-[150px] resize-y rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      DOI
                    </label>
                    <input
                      name="doi"
                      value={form.doi}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Year
                    </label>
                    <input
                      name="year"
                      type="number"
                      value={form.year}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Journal ID (optional)
                    </label>
                    <input
                      name="journal_id"
                      value={form.journal_id}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-60 transition-all hover:-translate-y-0.5"
                    >
                      {submitting
                        ? 'Saving...'
                        : editingId
                          ? 'Update Publication Record'
                          : 'Publish to Network'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}

            {/* Table Section */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Publication Directory
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Manage existing records in the database.</p>
                  </div>
                </div>
                {loadingPapers && (
                  <span className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full animate-pulse">
                     <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" /> Updating...
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs md:text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-2 pr-3 font-medium">Title</th>
                      <th className="py-2 px-3 font-medium">Journal / Year</th>
                      <th className="py-2 px-3 font-medium">DOI</th>
                      <th className="py-2 px-3 font-medium text-right">
                        Citations
                      </th>
                      {canManage && (
                        <th className="py-2 pl-3 text-right font-medium">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPapers
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
                            <td className="py-2 px-3 text-right">
                              <div className="h-4 w-10 ml-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            </td>
                            {canManage && (
                              <td className="py-2 pl-3 text-right">
                                <div className="h-4 w-16 ml-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                              </td>
                            )}
                          </tr>
                        ))
                      : papers.map((paper) => (
                          <tr
                            key={paper.paper_id}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors"
                          >
                            <td className="py-2 pr-3 align-top">
                              <Link href={`/publications/${paper.paper_id}`} className="font-medium text-slate-900 dark:text-slate-50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                {paper.title}
                              </Link>
                              {paper.abstract && (
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {paper.abstract}
                                </p>
                              )}
                            </td>
                            <td className="py-2 px-3 align-top text-slate-600 dark:text-slate-300">
                              <p className="text-xs md:text-sm">
                                {paper.journal_name || '—'}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {paper.year}
                              </p>
                            </td>
                            <td className="py-2 px-3 align-top text-slate-600 dark:text-slate-300">
                              <span className="text-[11px] md:text-xs font-mono">
                                {paper.doi || '—'}
                              </span>
                            </td>
                            <td className="py-2 px-3 align-top text-right text-slate-900 dark:text-slate-50">
                              {paper.citation_count ?? 0}
                            </td>
                            {canManage && (
                              <td className="py-2 pl-3 align-top text-right">
                                <div className="inline-flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(paper)}
                                    className="inline-flex items-center px-2 py-1 text-[11px] font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                                  >
                                    Edit
                                  </button>
                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(paper.paper_id)}
                                      className="inline-flex items-center px-2 py-1 text-[11px] font-medium rounded-full bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/70"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                    {!loadingPapers && papers.length === 0 && (
                      <tr>
                        <td
                          colSpan={canManage ? 5 : 4}
                          className="py-4 text-sm text-slate-500 dark:text-slate-400 text-center"
                        >
                          No publications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

