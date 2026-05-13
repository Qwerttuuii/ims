import { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      students.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.student_id?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q) ||
        s.school_name?.toLowerCase().includes(q)
      )
    );
  }, [search, students]);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, student_id, department, school_name, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    setStudents(data || []);
    setFiltered(data || []);
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2540]">Students</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {students.length} student{students.length !== 1 ? 's' : ''} registered on the platform
        </p>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, ID, department, school..."
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
              <Users className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No students found.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {filtered.map((student) => (
                <div key={student.id} className="flex flex-col gap-4 px-5 py-5 hover:bg-zinc-50 transition sm:flex-row sm:items-center sm:gap-5 sm:px-8">
                  <div className="w-11 h-11 bg-[#0A2540] text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(student.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2540] truncate">{student.full_name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                      {student.student_id}
                      {student.department ? ` • ${student.department}` : ''}
                      {student.school_name ? ` • ${student.school_name}` : ''}
                    </p>
                  </div>
                  <div className="w-full text-left shrink-0 sm:w-auto sm:text-right">
                    <p className="text-xs text-zinc-400">
                      Joined {new Date(student.created_at).toLocaleDateString()}
                    </p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium mt-1 inline-block">
                      Active
                    </span>
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
