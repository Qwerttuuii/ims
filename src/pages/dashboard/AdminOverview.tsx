import { useState, useEffect } from 'react';
import { Users, Building2, UserCheck, Briefcase, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    supervisors: 0,
    placements: 0,
    pendingLogs: 0,
    openings: 0,
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Counts
      const [
        { count: studentCount },
        { count: companyCount },
        { count: supervisorCount },
        { count: placementCount },
        { count: pendingLogsCount },
        { count: openingsCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'company'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'supervisor'),
        supabase.from('placements').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('logbooks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('openings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      setStats({
        students: studentCount || 0,
        companies: companyCount || 0,
        supervisors: supervisorCount || 0,
        placements: placementCount || 0,
        pendingLogs: pendingLogsCount || 0,
        openings: openingsCount || 0,
      });

      // Recent students
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, department, school_name, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentStudents(students || []);

      // Recent companies
      const { data: companies } = await supabase
        .from('profiles')
        .select('id, full_name, department, created_at')
        .eq('role', 'company')
        .order('created_at', { ascending: false })
        .limit(4);

      setRecentCompanies(companies || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="w-10 h-10 border-4 border-[#0A2540] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2540]">System Overview</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Monitor users, placements, and submissions across the platform.
        </p>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">

        {/* Stats grid */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {[
            { label: 'STUDENTS', value: stats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', path: '/dashboard/admin/students' },
            { label: 'COMPANIES', value: stats.companies, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', path: '/dashboard/admin/companies' },
            { label: 'SUPERVISORS', value: stats.supervisors, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/dashboard/admin/supervisors' },
            { label: 'ACTIVE PLACEMENTS', value: stats.placements, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50', path: null },
            { label: 'ACTIVE OPENINGS', value: stats.openings, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', path: null },
            { label: 'PENDING LOGS', value: stats.pendingLogs, icon: Clock, color: 'text-red-500', bg: 'bg-red-50', path: null },
          ].map((stat, i) => (
            <div
              key={i}
              onClick={() => stat.path && navigate(stat.path)}
              className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-100 ${stat.path ? 'cursor-pointer hover:border-blue-200 transition' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-semibold tracking-widest">{stat.label}</p>
                  <p className={`text-4xl sm:text-5xl font-bold mt-3 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">

          {/* Recent Students */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-zinc-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A2540]">Recent Students</h2>
                <p className="text-sm text-zinc-400 mt-0.5">Latest registrations</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/admin/students')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View all
              </button>
            </div>

            {recentStudents.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">No students registered yet.</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex flex-col gap-3 px-5 py-4 hover:bg-zinc-50 transition min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-4 sm:px-8">
                    <div className="w-10 h-10 bg-[#0A2540] text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(student.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0A2540] text-sm truncate">{student.full_name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">
                        {student.student_id}
                        {student.department ? ` • ${student.department}` : ''}
                        {student.school_name ? ` • ${student.school_name}` : ''}
                      </p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium shrink-0">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Companies */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-zinc-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A2540]">Companies</h2>
                <p className="text-sm text-zinc-400 mt-0.5">Registered on platform</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/admin/companies')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View all
              </button>
            </div>

            {recentCompanies.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">No companies yet.</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {recentCompanies.map((company) => (
                  <div key={company.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition sm:px-8">
                    <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(company.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0A2540] text-sm truncate">{company.full_name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">
                        {company.department || 'No sector listed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
