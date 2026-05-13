import { useState, useEffect } from 'react';
import { Briefcase, Users, UserCheck, FileText, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PostOpeningModal from '../../components/PostOpeningModal';

export default function CompanyOverview() {
  const [company, setCompany] = useState<any>(null);
  const [openings, setOpenings] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch company profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, department')
        .eq('id', user.id)
        .maybeSingle();

      setCompany(profile);

      // Fetch this company's openings
      const { data: openingsData } = await supabase
        .from('openings')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      setOpenings(openingsData || []);

      // Fetch applicants for this company's openings
      // Only if you have an applications table — skip gracefully if not
      const openingIds = (openingsData || []).map((o: any) => o.id);
      if (openingIds.length > 0) {
        const { data: applicantsData } = await supabase
          .from('applications')
          .select('*, student:profiles!student_id(full_name, student_id), opening:openings!opening_id(title)')
          .in('opening_id', openingIds)
          .order('created_at', { ascending: false })
          .limit(5);

        setApplicants(applicantsData || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading company dashboard...</p>
        </div>
      </div>
    );
  }

  const activeOpenings = openings.filter(o => o.status === 'active').length;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {company?.full_name || 'Your Company'}
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">
              {company?.department || 'Manage openings, screen applicants and oversee placements.'}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-blue-950 text-white px-5 sm:px-6 py-3 rounded-2xl hover:bg-blue-900 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Post Opening
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {[
            { label: 'ACTIVE OPENINGS', value: activeOpenings, icon: Briefcase },
            { label: 'TOTAL APPLICANTS', value: applicants.length, icon: Users },
            { label: 'ACCEPTED INTERNS', value: applicants.filter(a => a.status === 'accepted').length, icon: UserCheck },
            { label: 'TOTAL POSTINGS', value: openings.length, icon: FileText },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-semibold tracking-widest">{stat.label}</p>
                  <p className="text-3xl sm:text-4xl font-semibold mt-2">{stat.value}</p>
                </div>
                <stat.icon className="w-10 h-10 text-blue-600 opacity-70" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">

          {/* Recent Applicants */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">Recent Applicants</h2>
              <button className="text-blue-600 font-medium hover:underline text-sm">View all</button>
            </div>

            {applicants.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No applicants yet.</p>
                <p className="text-zinc-400 text-xs mt-1">Post an opening to start receiving applications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applicants.map((app) => (
                  <div key={app.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-zinc-50 rounded-2xl transition">
                    <div className="min-w-0">
                      <p className="font-medium">{app.student?.full_name || 'Student'}</p>
                      <p className="text-sm text-zinc-500">
                        {app.student?.student_id} • {app.opening?.title}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                      app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700'
                      : app.status === 'rejected' ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Your Openings */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">Your Openings</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                + New
              </button>
            </div>

            {openings.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No openings posted yet.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-3 text-blue-600 text-sm font-medium hover:underline"
                >
                  Post your first opening
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {openings.slice(0, 4).map((opening) => (
                  <div key={opening.id} className="border border-zinc-100 rounded-2xl p-4 sm:p-5 hover:border-blue-200 transition">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                      <div className="min-w-0">
                        <p className="font-semibold">{opening.title}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          {opening.sector} • {opening.duration}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full h-fit shrink-0 ${
                        opening.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {opening.status}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-zinc-500">
                      {opening.stipend} • Closes {new Date(opening.deadline).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PostOpeningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCompanyData}
      />
    </div>
  );
}
