import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, Clock, AlertTriangle, Lightbulb } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function StudentLogbook() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    week: '',
    activities: '',
    challenges: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('logbooks')
        .select('*')
        .eq('student_id', user.id)
        .order('week', { ascending: false });

      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.week || !newLog.activities) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('logbooks').insert({
        student_id: user.id,
        week: parseInt(newLog.week),
        activities: newLog.activities,
        challenges: newLog.challenges || null,
        date: newLog.date,
        status: 'pending'
      });

      if (error) throw error;

      alert('Weekly log submitted successfully!');
      setIsModalOpen(false);
      setNewLog({ week: '', activities: '', challenges: '', date: new Date().toISOString().split('T')[0] });
      fetchLogs();
    } catch (err: any) {
      alert('Failed to submit: ' + err.message);
    }
  };

  const stats = {
    total: logs.length,
    approved: logs.filter(l => l.status === 'approved').length,
    pending: logs.filter(l => l.status === 'pending').length,
    needsChanges: logs.filter(l => l.status === 'rejected').length,
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-zinc-600">Loading logbook...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Weekly Logbook</h1>
            <p className="text-zinc-600 mt-1">Record what you worked on each week. Your supervisor reviews and signs off entries.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-blue-950 text-white px-6 py-3 rounded-2xl hover:bg-blue-900 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {[
            { label: "TOTAL ENTRIES", value: stats.total, icon: Calendar },
            { label: "APPROVED", value: stats.approved, icon: CheckCircle, color: "text-emerald-600" },
            { label: "PENDING", value: stats.pending, icon: Clock, color: "text-amber-600" },
            { label: "NEEDS CHANGES", value: stats.needsChanges, icon: AlertTriangle, color: "text-red-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 font-medium tracking-widest">{stat.label}</p>
                  <p className={`text-3xl sm:text-4xl font-semibold mt-2 ${stat.color || ''}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.color || 'text-zinc-400'}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Log Entries */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6">Recent Entries</h2>

              {logs.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">
                  No entries yet. Start logging your weekly activities.
                </div>
              ) : (
                <div className="space-y-6">
                  {logs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-4 sm:flex-row sm:gap-6 p-4 sm:p-6 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                        W{log.week}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                          <p className="font-medium text-base sm:text-lg">
                            {new Date(log.date || log.created_at).toLocaleDateString('en-US', {
                              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                          <span className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                            log.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            log.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : 'Pending'}
                          </span>
                        </div>
                        <p className="mt-3 text-zinc-700 leading-relaxed">{log.activities}</p>
                        {log.challenges && (
                          <p className="mt-3 text-amber-700 text-sm">⚠️ Challenges: {log.challenges}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Tips & Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Placement Info */}
            <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white rounded-3xl p-5 sm:p-8">
              <p className="uppercase text-blue-300 text-xs tracking-widest">CURRENT PLACEMENT</p>
              <h3 className="text-xl sm:text-2xl font-semibold mt-2">Andela Nigeria</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-blue-300 text-sm">Supervisor</p>
                  <p className="font-medium">Dr. Bello Musa</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-blue-300 text-sm">Weeks</p>
                    <p className="font-medium">16/24</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-300 text-sm">Progress</p>
                    <p className="font-medium">68%</p>
                  </div>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-2 bg-amber-400 rounded-full w-[68%]"></div>
                </div>
              </div>
            </div>

            {/* Submission Tips */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                <h3 className="font-semibold">Submission Tips</h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-600">
                <li className="flex gap-3">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Submit by Friday each week
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  List concrete tasks and outcomes
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Mention people you worked with
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Flag blockers early
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* New Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">New Weekly Entry</h2>
              <p className="text-zinc-600">Be specific — list what you built, learned, and any blockers.</p>
            </div>

            <form onSubmit={handleSubmitLog} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Week Number</label>
                  <input
                    type="number"
                    required
                    value={newLog.week}
                    onChange={(e) => setNewLog({ ...newLog, week: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
                    placeholder="17"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={newLog.date}
                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Summary of Activities</label>
                <textarea
                  required
                  value={newLog.activities}
                  onChange={(e) => setNewLog({ ...newLog, activities: e.target.value })}
                  rows={6}
                  placeholder="e.g. Implemented authentication module for client portal..."
                  className="w-full px-4 py-3 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Challenges / Blockers (Optional)</label>
                <textarea
                  value={newLog.challenges}
                  onChange={(e) => setNewLog({ ...newLog, challenges: e.target.value })}
                  rows={3}
                  placeholder="Any difficulties faced this week?"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-zinc-300 rounded-2xl font-medium hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-950 text-white rounded-2xl font-medium hover:bg-blue-900"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
