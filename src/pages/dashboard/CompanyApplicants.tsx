import { useState, useEffect } from 'react';
import { Users, Mail, Award, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CompanyApplicants() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  const fetchApplicants = async () => {
    try {
      const { data } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      setApplicants(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const filteredApplicants = applicants.filter((app) => {
    const matchesFilter = activeFilter === 'all' || app.status === activeFilter;
    const matchesSearch = !searchTerm || (app.student_id || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (id: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setApplicants(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      setSelectedApplicant(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => !a.status || a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  if (loading) return <div className="p-12 text-center">Loading applicants...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold">Applicants</h1>
        <p className="text-zinc-600 mt-1">Review every student who applied to your openings and respond.</p>

        {/* Stats */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 mb-10">
          {[
            { label: "TOTAL APPLICANTS", value: stats.total, icon: Users },
            { label: "PENDING REVIEW", value: stats.pending, icon: Mail },
            { label: "ACCEPTED", value: stats.accepted, icon: Award },
            { label: "REJECTED", value: stats.rejected, icon: XCircle },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
                  <p className="text-3xl sm:text-4xl font-semibold mt-2">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                  activeFilter === f ? 'bg-blue-950 text-white' : 'bg-white border hover:bg-zinc-50'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by Student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-5 py-3 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">No applications found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b bg-zinc-50">
                    <th className="text-left py-5 px-8 font-medium text-zinc-500">STUDENT</th>
                    <th className="text-left py-5 px-4 font-medium text-zinc-500">POSITION</th>
                    <th className="text-left py-5 px-4 font-medium text-zinc-500">APPLIED</th>
                    <th className="text-left py-5 px-4 font-medium text-zinc-500">STATUS</th>
                    <th className="text-right py-5 px-8 font-medium text-zinc-500">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-zinc-50 cursor-pointer" onClick={() => setSelectedApplicant(app)}>
                      <td className="py-5 px-8">
                        <p className="font-medium">Student ID: {app.student_id}</p>
                      </td>
                      <td className="py-5 px-4 text-sm">{app.opening_id}</td>
                      <td className="py-5 px-4 text-sm text-zinc-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-5 px-4">
                        <span className={`inline-block px-4 py-1 rounded-full text-xs font-medium capitalize ${
                          app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button className="text-blue-600 hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8">
            <h2 className="text-2xl font-semibold mb-6">Application Details</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-zinc-500">Student ID</p>
                <p className="font-medium text-lg">{selectedApplicant.student_id}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">Applied For</p>
                <p className="font-medium">{selectedApplicant.opening_id}</p>
              </div>

              {selectedApplicant.cover_letter && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Cover Letter</p>
                  <div className="bg-zinc-50 p-5 rounded-2xl text-sm leading-relaxed border">
                    {selectedApplicant.cover_letter}
                  </div>
                </div>
              )}

              <div className="pt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleStatusChange(selectedApplicant.id, 'rejected')}
                  className="flex-1 py-4 border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 font-medium"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApplicant.id, 'accepted')}
                  className="flex-1 py-4 bg-blue-950 text-white rounded-2xl hover:bg-blue-900 font-medium"
                >
                  Accept
                </button>
              </div>
            </div>

            <button 
              onClick={() => setSelectedApplicant(null)}
              className="mt-6 w-full py-3 text-zinc-500 hover:text-zinc-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
