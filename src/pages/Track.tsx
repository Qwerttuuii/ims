import { useState } from 'react';
import { GraduationCap, Search,  User, Building, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const TOTAL_WEEKS = 24;

export default function Track() {
  const [studentId, setStudentId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setIsSearching(true);
    setResult(null);
    setError('');

    try {
      //  Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, department, school_name')
        .eq('student_id', studentId.trim().toUpperCase())
        .eq('role', 'student')
        .maybeSingle();

      if (profileError || !profile) {
        setError('Student not found. Please check the Student ID and try again.');
        return;
      }

      //  Fetch logbooks for this student
      const { data: logbooks } = await supabase
        .from('logbooks')
        .select('id, week, date, status, activities, supervisor_comments, created_at')
        .eq('student_id', profile.id)
        .order('week', { ascending: false });

      const logsData = logbooks || [];
      const approvedLogs = logsData.filter(l => l.status === 'approved');

      //  Fetch placement for this student
      const { data: placement } = await supabase
        .from('placements')
        .select('company_name, supervisor_name, start_date, end_date, status')
        .eq('student_id', profile.id)
        .maybeSingle();

      const weeksCompleted = approvedLogs.length;
      const progressPercent = Math.min(100, Math.round((weeksCompleted / TOTAL_WEEKS) * 100));

      setResult({
        name: profile.full_name,
        studentId: profile.student_id,
        department: profile.department || 'N/A',
        school: profile.school_name || 'N/A',
        company: placement?.company_name || 'Not Assigned',
        supervisorName: placement?.supervisor_name || 'Not Assigned',
        placementStatus: placement?.status || null,
        totalWeeks: TOTAL_WEEKS,
        weeksCompleted,
        progressPercent,
        recentLogs: logsData.slice(0, 3),
        totalLogs: logsData.length,
      });

    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const exampleIds = ['STU/2024/001', 'STU/2024/002', 'STU/2026/001'];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-50">
        <div className="pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">

            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm mb-6">
                <GraduationCap className="w-4 h-4" />
                PUBLIC LOOKUP
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">Track student progress</h1>
              <p className="text-base sm:text-xl text-zinc-600 max-w-md mx-auto">
                Enter a Student ID to view live internship status and recent logbook activity.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleTrack} className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 mb-8">
              <div className="relative">
                <Search className="absolute left-5 top-4 w-6 h-6 text-zinc-400" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => { setStudentId(e.target.value); setError(''); }}
                  placeholder="e.g. STU/2024/001"
                  className="w-full pl-14 pr-4 sm:pr-6 py-4 text-base sm:text-lg border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !studentId.trim()}
                className="mt-6 w-full py-4 bg-blue-950 text-white rounded-2xl font-medium text-lg hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Track Progress'}
              </button>
            </form>

            {/* Example IDs */}
            <div className="text-center mb-8">
              <p className="text-sm text-zinc-500 mb-3">Try these example IDs:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {exampleIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStudentId(id)}
                    className="px-5 py-2 bg-white border border-zinc-200 rounded-full text-sm hover:border-blue-300 hover:text-blue-700 transition"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-center mb-6">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-10 space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-semibold">{result.name}</h3>
                    <p className="text-blue-600 font-medium text-lg mt-1">{result.studentId}</p>
                  </div>
                  <span className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    result.placementStatus === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {result.placementStatus === 'active' ? 'Active' : 'Pending Placement'}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                    <User className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Department</p>
                      <p className="font-medium mt-0.5">{result.department}</p>
                      {result.school !== 'N/A' && (
                        <p className="text-sm text-zinc-500">{result.school}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Building className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Company</p>
                      <p className="font-medium mt-0.5">{result.company}</p>
                      {result.supervisorName !== 'Not Assigned' && (
                        <p className="text-sm text-zinc-500">Supervisor: {result.supervisorName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between text-sm mb-3">
                    <span className="font-semibold text-zinc-700">Internship Progress</span>
                    <span className="text-zinc-500">
                      Week {result.weeksCompleted} of {result.totalWeeks}
                    </span>
                  </div>
                  <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${result.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between text-xs text-zinc-400 mt-2">
                    <span>{result.weeksCompleted} weeks approved</span>
                    <span>{result.progressPercent}% complete</span>
                  </div>
                </div>

                {/* Recent Logbooks */}
                {result.recentLogs.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-zinc-700">
                      <Calendar className="w-4 h-4" />
                      Recent Logbook Entries
                    </h4>
                    <div className="space-y-3">
                      {result.recentLogs.map((log: any) => (
                        <div key={log.id} className="border border-zinc-100 rounded-2xl p-5 hover:bg-zinc-50 transition">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="font-medium text-sm text-zinc-700">Week {log.week}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              log.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : log.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-zinc-600 text-sm line-clamp-2 leading-relaxed">
                            {log.activities}
                          </p>
                          {log.supervisor_comments && (
                            <p className="text-xs text-blue-600 mt-2 italic">
                              Supervisor: {log.supervisor_comments}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {result.totalLogs > 3 && (
                      <p className="text-center text-xs text-zinc-400 mt-4">
                        Showing 3 of {result.totalLogs} entries
                      </p>
                    )}
                  </div>
                )}

                {result.recentLogs.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    <p className="text-sm">No logbook entries submitted yet.</p>
                  </div>
                )}

               
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
