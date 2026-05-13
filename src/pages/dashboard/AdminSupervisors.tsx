import { useState, useEffect } from 'react';
import { Search, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminSupervisors() {
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      supervisors.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.school_name?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
      )
    );
  }, [search, supervisors]);

  const fetchSupervisors = async () => {
    const { data: supervisorsData } = await supabase
      .from('profiles')
      .select('id, full_name, department, school_name, created_at')
      .eq('role', 'supervisor')
      .order('created_at', { ascending: false });

    // For each supervisor get count of students from same school
    const supervisorsWithStats = await Promise.all(
      (supervisorsData || []).map(async (supervisor) => {
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')
          .eq('school_name', supervisor.school_name || '');

        return { ...supervisor, studentCount: studentCount || 0 };
      })
    );

    setSupervisors(supervisorsWithStats);
    setFiltered(supervisorsWithStats);
    setLoading(false);
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
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2540]">Supervisors</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {supervisors.length} supervisor{supervisors.length !== 1 ? 's' : ''} registered on the platform
        </p>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, school, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="px-5 sm:px-8 py-5 border-b border-zinc-100">
            <p className="text-sm text-zinc-500">
              Showing <span className="font-semibold text-[#0A2540]">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <UserCheck className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No supervisors found.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {filtered.map((supervisor) => (
                <div key={supervisor.id} className="flex flex-col gap-4 px-5 py-5 hover:bg-zinc-50 transition sm:flex-row sm:items-center sm:gap-5 sm:px-8">
                  <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(supervisor.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2540] truncate">{supervisor.full_name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                      {supervisor.school_name || 'No school listed'}
                      {supervisor.department ? ` • ${supervisor.department}` : ''}
                    </p>
                  </div>
                  <div className="w-full text-left shrink-0 sm:w-auto sm:text-right">
                    <p className="text-sm font-semibold text-[#0A2540]">{supervisor.studentCount}</p>
                    <p className="text-xs text-zinc-400">students</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
