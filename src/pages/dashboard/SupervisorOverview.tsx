import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, CheckCircle, XCircle, ChevronRight, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SupervisorOverview() {
  const [supervisorSchool, setSupervisorSchool] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [logsToReview, setLogsToReview] = useState(0);
  const [avgProgress, setAvgProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchSupervisorData();
  }, []);

  const fetchSupervisorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_name, full_name')
        .eq('id', user.id)
        .maybeSingle();

      const school = profile?.school_name || '';
      setSupervisorSchool(school);
      setSupervisorName(profile?.full_name || '');

      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, school_name, department')
        .eq('role', 'student')
        .eq('school_name', school);

      const studentList = studentsData || [];
      setStudents(studentList);

      const { count: pendingCount } = await supabase
        .from('logbooks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setLogsToReview(pendingCount || 0);

      if (studentList.length > 0) {
        const studentIds = studentList.map((s: any) => s.id);

        const { count: totalLogs } = await supabase
          .from('logbooks')
          .select('*', { count: 'exact', head: true })
          .in('student_id', studentIds);

        const { count: approvedLogs } = await supabase
          .from('logbooks')
          .select('*', { count: 'exact', head: true })
          .in('student_id', studentIds)
          .eq('status', 'approved');

        if (totalLogs && totalLogs > 0) {
          setAvgProgress(Math.round(((approvedLogs || 0) / totalLogs) * 100));
        } else {
          setAvgProgress(0);
        }
      } else {
        setAvgProgress(0);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openStudentLogbook = async (student: any) => {
    setSelectedStudent(student);
    setSelectedLog(null);
    setLogsLoading(true);

    const { data, error } = await supabase
      .from('logbooks')
      .select('*')
      .eq('student_id', student.id)
      .order('week', { ascending: true });

    if (error) console.error(error);
    setStudentLogs(data || []);
    setLogsLoading(false);
  };

  const handleReview = async (logId: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('logbooks')
        .update({
          status,
          supervisor_comments: reviewComment || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', logId);

      if (error) throw error;

      setStudentLogs(prev =>
        prev.map(log =>
          log.id === logId ? { ...log, status, supervisor_comments: reviewComment } : log
        )
      );
      setSelectedLog(null);
      setReviewComment('');

      const { count: pendingCount } = await supabase
        .from('logbooks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setLogsToReview(pendingCount || 0);

      const studentIds = students.map((s: any) => s.id);
      const { count: totalLogs } = await supabase
        .from('logbooks')
        .select('*', { count: 'exact', head: true })
        .in('student_id', studentIds);
      const { count: approvedLogs } = await supabase
        .from('logbooks')
        .select('*', { count: 'exact', head: true })
        .in('student_id', studentIds)
        .eq('status', 'approved');
      if (totalLogs && totalLogs > 0) {
        setAvgProgress(Math.round(((approvedLogs || 0) / totalLogs) * 100));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#0A2540] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* Header — no emoji */}
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2540]">
          Welcome, {supervisorName.split(' ')[0] || 'Supervisor'}
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {supervisorSchool
            ? `Supervising students from ${supervisorSchool}`
            : 'Monitor student progress and review weekly logbook submissions.'}
        </p>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">

        {/* Stats — icons kept, avg progress now shows real % */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {[
            {
              label: 'ASSIGNED STUDENTS',
              value: students.length,
              sub: `From ${supervisorSchool || 'your school'}`,
              icon: Users,
              bg: 'bg-blue-50',
              iconColor: 'text-blue-600',
              valueColor: 'text-[#0A2540]',
            },
            {
              label: 'LOGS TO REVIEW',
              value: logsToReview,
              sub: 'Pending approval',
              icon: BookOpen,
              bg: 'bg-amber-50',
              iconColor: 'text-amber-600',
              valueColor: 'text-amber-500',
            },
            {
              label: 'AVG. PROGRESS',
              value: avgProgress !== null ? `${avgProgress}%` : '—',
              sub: 'Approved logs across all students',
              icon: TrendingUp,
              bg: 'bg-emerald-50',
              iconColor: 'text-emerald-600',
              valueColor: 'text-emerald-600',
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-semibold tracking-widest">{stat.label}</p>
                  <p className={`text-4xl sm:text-5xl font-bold mt-3 ${stat.valueColor}`}>{stat.value}</p>
                  <p className="text-xs text-zinc-400 mt-2">{stat.sub}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Student Roster */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-zinc-100">
            <h2 className="text-xl font-bold text-[#0A2540]">Student Roster</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Click "View Logbook" to review a student's submissions
            </p>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-400 text-sm">
                No students from {supervisorSchool || 'your school'} yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col gap-4 px-5 py-5 hover:bg-zinc-50 transition sm:flex-row sm:items-center sm:gap-5 sm:px-8"
                >
                  <div className="w-11 h-11 bg-[#0A2540] text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(student.full_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2540] truncate">{student.full_name}</p>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {student.student_id}
                      {student.department ? ` • ${student.department}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => openStudentLogbook(student)}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-[#0A2540] text-white text-sm font-medium rounded-xl hover:bg-blue-900 transition shrink-0 sm:w-auto"
                  >
                    View Logbook
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LOGBOOK MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">

            <div className="bg-[#0A2540] text-white px-5 sm:px-8 py-5 sm:py-6 flex items-start justify-between gap-4 shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{selectedStudent.full_name}</h2>
                <p className="text-blue-300 text-sm mt-0.5">
                  {selectedStudent.student_id} • Weekly Logbook
                </p>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setSelectedLog(null); }}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {logsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-[#0A2540] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : studentLogs.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-zinc-400 text-sm">No logbook entries submitted yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {studentLogs.map((log) => (
                    <div key={log.id} className="px-5 sm:px-8 py-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                            W{log.week}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                              <p className="font-semibold text-[#0A2540]">Week {log.week}</p>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                log.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : log.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                              {log.activities}
                            </p>
                            {log.supervisor_comments && (
                              <p className="text-xs text-blue-600 mt-2 italic">
                                Your comment: {log.supervisor_comments}
                              </p>
                            )}
                          </div>
                        </div>

                        {log.status === 'pending' && (
                          <button
                            onClick={() => { setSelectedLog(log); setReviewComment(''); }}
                            className="w-full shrink-0 px-4 py-2 border border-[#0A2540] text-[#0A2540] text-sm font-medium rounded-xl hover:bg-[#0A2540] hover:text-white transition sm:w-auto"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">

            <div className="bg-gradient-to-r from-[#0A2540] to-blue-900 text-white px-5 sm:px-8 py-5 sm:py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Review Entry</h3>
                  <p className="text-blue-300 text-sm mt-0.5">
                    Week {selectedLog.week} — {selectedStudent?.full_name}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedLog(null); setReviewComment(''); }}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-5 sm:px-8 py-6 space-y-5 max-h-[50vh] overflow-y-auto">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Activities This Week
                </p>
                <p className="text-zinc-700 leading-relaxed text-sm">{selectedLog.activities}</p>
              </div>

              {selectedLog.challenges && (
                <div>
                  <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">
                    Challenges / Blockers
                  </p>
                  <p className="text-zinc-700 text-sm leading-relaxed">{selectedLog.challenges}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Your Comment (optional)
                </p>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Leave feedback for the student..."
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] resize-none"
                />
              </div>
            </div>

            <div className="px-5 sm:px-8 py-5 border-t border-zinc-100 flex flex-col sm:flex-row gap-3 bg-zinc-50">
              <button
                onClick={() => handleReview(selectedLog.id, 'rejected')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 font-medium text-sm transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Request Changes
              </button>
              <button
                onClick={() => handleReview(selectedLog.id, 'approved')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-medium text-sm transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? 'Saving...' : 'Approve Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
