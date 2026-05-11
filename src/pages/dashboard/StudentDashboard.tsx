import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [placement, setPlacement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setError('Not authenticated.');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, student_id, department, role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profileError) {
          setError('Could not load your profile.');
          return;
        }

        if (!profileData) {
          setError('No profile found for your account. Contact your administrator.');
          return;
        }

        setProfile(profileData);

        // ✅ Fixed: was 'logbook', correct table is 'logbooks'
        const { data: logsData } = await supabase
          .from('logbooks')
          .select('*')
          .eq('student_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setLogs(logsData || []);

        const { data: placementData } = await supabase
          .from('placements')
          .select('*')
          .eq('student_id', authUser.id)
          .maybeSingle();

        setPlacement(placementData || null);

      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError('Something went wrong loading your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="bg-white rounded-3xl shadow p-10 max-w-md text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-xl font-semibold mb-2">Could not load dashboard</h2>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">
              {profile?.student_id || 'N/A'} • {profile?.department || 'Unknown Department'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-white border border-zinc-300 rounded-2xl hover:bg-zinc-50 transition font-medium text-sm">
              <Briefcase className="w-4 h-4" />
              Browse opportunities
            </button>
            <button className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-blue-950 text-white rounded-2xl hover:bg-blue-900 transition font-medium text-sm">
              <ArrowRight className="w-4 h-4" />
              Submit weekly log
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Stats */}
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: 'PROGRESS',
                value: placement ? `${placement.progress || 0}%` : '0%',
                sub: '0/24 weeks',
                icon: TrendingUp,
                color: 'text-emerald-600',
              },
              {
                label: 'LOGS APPROVED',
                value: logs.filter(l => l.status === 'approved').length.toString(),
                sub: 'Total approved',
                icon: Award,
                color: 'text-blue-600',
              },
              {
                label: 'PENDING REVIEW',
                value: logs.filter(l => l.status === 'pending').length.toString(),
                sub: 'Awaiting approval',
                icon: Clock,
                color: 'text-amber-600',
              },
              {
                label: 'DAYS REMAINING',
                value: placement
                  ? Math.max(0, Math.ceil((new Date(placement.end_date).getTime() - Date.now()) / 86400000)).toString()
                  : '—',
                sub: 'Until end date',
                icon: Calendar,
                color: 'text-purple-600',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-400 font-semibold tracking-widest">{stat.label}</p>
                    <p className={`text-4xl sm:text-5xl font-semibold mt-2 ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-zinc-500 mt-1">{stat.sub}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-70`} />
                </div>
              </div>
            ))}
          </div>

          {/* Logbook */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Recent logbook entries</h2>
              <button className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-5">
                {logs.map((log) => (
                  <div key={log.id} className="flex flex-col gap-3 sm:flex-row sm:gap-5 pb-5 border-b border-zinc-100 last:border-0 last:pb-0">
                    <div className="sm:w-20 shrink-0">
                      <p className="text-xs font-mono text-zinc-400 uppercase">Week {log.week}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(log.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-700 leading-relaxed">{log.activities}</p>
                    </div>
                    <span className={`shrink-0 self-start px-3 py-1 text-xs font-medium rounded-full capitalize ${
                      log.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                      : log.status === 'rejected' ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-zinc-400 text-sm">No logbook entries yet.</p>
                <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  Submit your first weekly log
                </button>
              </div>
            )}
          </div>

          {/* Placement */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 to-blue-900 text-white rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col">
            <p className="uppercase tracking-widest text-blue-400 text-xs mb-2">Current Placement</p>

            {placement ? (
              <>
                <h2 className="text-2xl font-semibold">{placement.company_name}</h2>
                <div className="mt-6 space-y-5 flex-1">
                  <div>
                    <p className="text-blue-300 text-xs mb-1">Supervisor</p>
                    <p className="font-medium text-sm">{placement.supervisor_name || 'Not Assigned'}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Start Date</p>
                      <p className="font-medium text-sm">{new Date(placement.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs mb-1">End Date</p>
                      <p className="font-medium text-sm">{new Date(placement.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-blue-300">Progress</span>
                      <span className="font-semibold">{placement.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-amber-400 rounded-full transition-all"
                        style={{ width: `${placement.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                <Briefcase className="w-12 h-12 text-blue-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Placement</h3>
                <p className="text-blue-300 text-sm">You haven't been placed yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
