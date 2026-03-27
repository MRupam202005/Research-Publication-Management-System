import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

export default function DatasetImport() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  if (!user || (user.role !== 'Administrator' && user.role !== 'Department')) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Access Denied</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">You do not have permission to view this page.</p>
      </div>
    );
  }

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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Import Citation Dataset</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Upload a CSV network dataset to bulk import researchers, papers, and their citation relationships.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center">
          <UploadCloud className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Select a CSV file to upload</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            File should contain headers: `title`, `doi`, `publication_year`, `journal`, `conference`, `keywords`, `authors`
          </p>
          
          <label className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Browse Files
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
          
          {file && (
            <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {status === 'loading' && (
          <div className="mt-6 p-4 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            Uploading and parsing dataset... Please wait.
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {message}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || status === 'loading'}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-8 py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            Import Dataset
          </button>
        </div>
      </div>
    </div>
  );
}
