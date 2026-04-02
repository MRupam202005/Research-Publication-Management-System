import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle, Database } from 'lucide-react';

export default function DatasetImport() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  // Define allowed roles directly reflecting the backend integration
  const canAccess = user && ['Administrator', 'Department', 'Researcher', 'Librarian'].includes(user.role);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('loading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/datasets/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setStatus('success');
      setMessage(response.data.message);
      setFile(null); // reset
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || 'Upload failed');
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
          {!canAccess ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 text-center max-w-2xl mx-auto my-12">
              <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Access Restricted</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Bulk dataset importing is locked. Your current role ({user.role}) does not have permission to execute massive bulk network uploads. 
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
              {/* Premium Header Banner */}
              <section className="relative overflow-hidden rounded-[2rem] bg-indigo-900 shadow-2xl border border-indigo-800">
                <div className="absolute inset-0">
                   <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-indigo-900 to-slate-900 opacity-90 mix-blend-multiply" />
                </div>
                
                {/* Decorative blurs */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[300px] h-[300px] bg-sky-500/30 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[250px] h-[250px] bg-indigo-500/30 rounded-full blur-[60px]" />

                <div className="relative z-10 p-8 md:p-10 flex flex-col items-start gap-4">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                      <Database className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                        Import Dataset
                      </h2>
                      <p className="text-indigo-200 text-sm md:text-base max-w-xl font-medium">
                        Upload a CSV network dataset to bulk import researchers, papers, and their citation relationships seamlessly.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 p-8">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center transition-colors hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-900/50">
                  <UploadCloud className="w-16 h-16 mx-auto text-indigo-400 dark:text-indigo-500 mb-6 drop-shadow-sm" />
                  <h3 className="text-xl text-slate-800 dark:text-slate-100 font-bold mb-2">Select a CSV file to upload</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                    File should ideally contain headers: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">title</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">doi</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">publication_year</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">journal</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">conference</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">keywords</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">authors</code>
                  </p>
                  
                  <label className="cursor-pointer inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5">
                    Browse Files
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                  
                  {file && (
                    <p className="mt-6 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 inline-block px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      Selected: <span className="text-indigo-600 dark:text-indigo-400">{file.name}</span> <span className="text-slate-400 font-normal">({(file.size / 1024).toFixed(1)} KB)</span>
                    </p>
                  )}
                </div>

                {status === 'loading' && (
                  <div className="mt-6 p-4 bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800 font-medium text-sky-800 dark:text-sky-300 rounded-xl flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-inherit"></div>
                    Uploading and parsing dataset... Please wait.
                  </div>
                )}

                {status === 'success' && (
                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 font-medium text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-3 shadow-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    {message}
                  </div>
                )}

                {status === 'error' && (
                  <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 font-medium text-rose-800 dark:text-rose-300 rounded-xl flex items-center gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {message}
                  </div>
                )}

                <div className="mt-10 flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleUpload}
                    disabled={!file || status === 'loading'}
                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold disabled:opacity-50 transition-all hover:shadow-lg disabled:hover:translate-y-0 hover:-translate-y-0.5"
                  >
                    Start Import Process
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
