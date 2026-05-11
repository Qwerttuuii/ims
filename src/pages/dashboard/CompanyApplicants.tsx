import { useState, useEffect } from 'react';
import { Users, Mail, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CompanyApplicants() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          student:profiles!student_id(full_name, student_id, department),
          opening:openings!opening_id(title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch error:", error.message);
        setApplicants([]);
      } else {
        setApplicants(data || []);
        setFilteredApplicants(data || []);
      }
    } catch (err) {
      console.error(err);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  useEffect(() => {
    let result = [...applicants];

    if (activeFilter !== 'all') {
      result = result.filter(app => app.status === activeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app =>
        app.student?.full_name?.toLowerCase().includes(term) ||
        app.student?.student_id?.toLowerCase().includes(term) ||
        app.opening?.title?.toLowerCase().includes(term)
      );
    }

    setFilteredApplicants(result);
  }, [applicants, activeFilter, searchTerm]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplicants(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading applicants...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Applicants</h1>
        <p className="text-zinc-600">Review every student who applied to your openings and respond.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 mb-10">
          {[
            { label: 'TOTAL APPLICANTS', value: stats.total, icon: Users },
            { label: 'PENDING REVIEW', value: stats.pending, icon: Mail },
            { label: 'ACCEPTED', value: stats.accepted, icon: Award },
            { label: 'REJECTED', value: stats.rejected, icon: Users },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
                  <p className="text-4xl font-semibold mt-2">{stat.value}</p>
                </div>
                <stat.icon className="w-10 h-10 text-blue-600 opacity-80" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  activeFilter === status
                    ? 'bg-blue-950 text-white'
                    : 'bg-white border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by name, ID or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-5 py-3 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Applicants List */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 mx-auto text-zinc-200 mb-4" />
              <p className="text-zinc-400">No applicants yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
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
                    <tr
                      key={app.id}
                      className="border-b hover:bg-zinc-50 cursor-pointer"
                      onClick={() => setSelectedApplicant(app)}
                    >
                      <td className="py-5 px-8">
                        <p className="font-medium">{app.student?.full_name}</p>
                        <p className="text-sm text-zinc-500">{app.student?.student_id}</p>
                      </td>
                      <td className="py-5 px-4">{app.opening?.title}</td>
                      <td className="py-5 px-4 text-sm text-zinc-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-5 px-4">
                        <span className={`inline-block px-4 py-1 rounded-full text-xs font-medium capitalize ${
                          app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button className="text-blue-600 hover:underline text-sm font-medium">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8">
            <h2 className="text-2xl font-semibold mb-6">Application Details</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-zinc-500">Student Name</p>
                <p className="font-medium text-lg">{selectedApplicant.student?.full_name}</p>
                <p className="text-sm text-zinc-500">{selectedApplicant.student?.student_id}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">Applied For</p>
                <p className="font-medium">{selectedApplicant.opening?.title}</p>
              </div>

              {selectedApplicant.cover_letter && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Cover Letter</p>
                  <div className="bg-zinc-50 p-5 rounded-2xl text-sm leading-relaxed">
                    {selectedApplicant.cover_letter}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6">
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