import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function StudentApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          opening:openings!opening_id(title, location, stipend, deadline, sector)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-lg">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">My Applications</h1>
          <p className="text-zinc-600 mt-2">Track the status of all your internship applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-16 text-center shadow-sm">
            <Briefcase className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
            <h3 className="text-2xl font-medium text-zinc-400">No applications yet</h3>
            <p className="text-zinc-500 mt-2">Start applying to opportunities from the Opportunities page</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-zinc-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold">{app.opening?.title}</h3>
                    <p className="text-blue-600 font-medium mt-1">{app.opening?.sector}</p>
                  </div>

                  <span className={`w-fit px-5 py-2 text-sm font-medium rounded-full capitalize ${
                    app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {app.status || 'Pending'}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-sm">
                  {app.opening?.location && (
                    <div>
                      <p className="text-zinc-500">Location</p>
                      <p className="font-medium">{app.opening.location}</p>
                    </div>
                  )}
                  {app.opening?.stipend && (
                    <div>
                      <p className="text-zinc-500">Stipend</p>
                      <p className="font-medium">{app.opening.stipend}</p>
                    </div>
                  )}
                  {app.opening?.deadline && (
                    <div>
                      <p className="text-zinc-500">Deadline</p>
                      <p className="font-medium">{new Date(app.opening.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-zinc-500">Applied On</p>
                    <p className="font-medium">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {app.cover_letter && (
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-zinc-500 mb-3">Your Cover Letter</p>
                    <p className="text-sm leading-relaxed text-zinc-700 bg-zinc-50 p-4 sm:p-5 rounded-2xl">
                      {app.cover_letter}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
