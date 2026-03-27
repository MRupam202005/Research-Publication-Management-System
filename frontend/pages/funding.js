import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { SimpleBarChart } from '@/components/AnalyticsChart';
import { useAuth } from '@/context/AuthContext';
import { getAgencies, createAgency, assignFunding, getFundingReport } from '@/services/fundingService';
import { getPapers } from '@/services/paperService';
import { Plus, Link as LinkIcon, Briefcase } from 'lucide-react';

export default function FundingPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const canManage = user && ['Department', 'Administrator'].includes(user.role);
  
  const [agencies, setAgencies] = useState([]);
  const [report, setReport] = useState([]);
  const [papers, setPapers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  // Form states
  const [newAgency, setNewAgency] = useState({ name: '', type: '', location: '' });
  const [newAssignment, setNewAssignment] = useState({ paperId: '', agencyId: '', amount: '', grantNumber: '' });

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      try {
        setIsFetching(true);
        const [agenciesData, reportData, papersData] = await Promise.all([
          getAgencies(token),
          getFundingReport(token),
          getPapers(token)
        ]);
        setAgencies(agenciesData);
        setReport(reportData);
        setPapers(papersData);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load funding data.');
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [token]);

  const handleCreateAgency = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const created = await createAgency(token, newAgency);
      setAgencies([...agencies, created]);
      setNewAgency({ name: '', type: '', location: '' });
      setSuccess('Agency created successfully!');
      // Refresh report
      const reportData = await getFundingReport(token);
      setReport(reportData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create agency.');
    }
  };

  const handleAssignFunding = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await assignFunding(token, {
        paperId: newAssignment.paperId,
        agencyId: newAssignment.agencyId,
        amount: Number(newAssignment.amount),
        grantNumber: newAssignment.grantNumber
      });
      setNewAssignment({ paperId: '', agencyId: '', amount: '', grantNumber: '' });
      setSuccess('Funding assigned successfully!');
      // Refresh report
      const reportData = await getFundingReport(token);
      setReport(reportData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign funding.');
    }
  };

  const chartData = useMemo(() => {
    return report.map(r => ({
      label: r.agency_name.length > 15 ? r.agency_name.slice(0, 15) + '…' : r.agency_name,
      value: Number(r.total_funding) || 0
    }));
  }, [report]);

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content bg-slate-50 dark:bg-slate-950 min-h-screen">
        <Navbar />
        <main className="dashboard-main p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            <section className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1 tracking-tight flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-indigo-500" /> Wait, Funding Agencies & Grants
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage research sponsors, record grants against specific publications, and analyze funding metrics.
                </p>
              </div>
            </section>

            {error && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">{error}</div>}
            {success && <div className="p-3 text-sm text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-lg">{success}</div>}

            {canManage && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Create Agency Form */}
                <div className="card-surface p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-500" /> Register Agency
                  </h3>
                <form onSubmit={handleCreateAgency} className="flex flex-col gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Agency Name (e.g., NSF)"
                    value={newAgency.name}
                    onChange={(e) => setNewAgency({...newAgency, name: e.target.value})}
                    className="block w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Type (e.g., Government, Corporate)"
                    value={newAgency.type}
                    onChange={(e) => setNewAgency({...newAgency, type: e.target.value})}
                    className="block w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g., USA, EU)"
                    value={newAgency.location}
                    onChange={(e) => setNewAgency({...newAgency, location: e.target.value})}
                    className="block w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <button type="submit" className="self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Add Agency
                  </button>
                </form>
              </div>

              {/* Assign Funding Form */}
              <div className="card-surface p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-indigo-500" /> Assign Grant to Publication
                </h3>
                <form onSubmit={handleAssignFunding} className="flex flex-col gap-4">
                  <select
                    required
                    value={newAssignment.paperId}
                    onChange={(e) => setNewAssignment({...newAssignment, paperId: e.target.value})}
                    className="block w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">Select Publication</option>
                    {papers.map(p => (
                      <option key={p.paper_id} value={p.paper_id}>{p.title}</option>
                    ))}
                  </select>
                  
                  <select
                    required
                    value={newAssignment.agencyId}
                    onChange={(e) => setNewAssignment({...newAssignment, agencyId: e.target.value})}
                    className="block w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">Select Funding Agency</option>
                    {agencies.map(a => (
                      <option key={a.agency_id} value={a.agency_id}>{a.name}</option>
                    ))}
                  </select>

                  <div className="flex gap-4">
                    <input
                      type="number"
                      required
                      placeholder="Amount ($)"
                      value={newAssignment.amount}
                      onChange={(e) => setNewAssignment({...newAssignment, amount: e.target.value})}
                      className="block w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Grant Number"
                      value={newAssignment.grantNumber}
                      onChange={(e) => setNewAssignment({...newAssignment, grantNumber: e.target.value})}
                      className="block w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white flex-1"
                    />
                  </div>
                  
                  <button type="submit" className="self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Assign Grant
                  </button>
                </form>
              </div>
            </div>
            )}

            {/* Reports Chart */}
            <section className="mt-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">Funding Distribution (Total $)</h3>
              <div className="h-[400px]">
                {!isFetching && chartData.length > 0 ? (
                  <SimpleBarChart 
                    title="Funding by Agency" 
                    data={chartData} 
                    xKey="label" 
                    yKey="value" 
                    color="#4f46e5" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-sm">No funding data available yet.</p>
                  </div>
                )}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
