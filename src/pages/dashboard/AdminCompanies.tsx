import { useState, useEffect } from 'react';
import { Search, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      companies.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q)
      )
    );
  }, [search, companies]);

  const fetchCompanies = async () => {
    const { data: companiesData } = await supabase
      .from('profiles')
      .select('id, full_name, department, created_at')
      .eq('role', 'company')
      .order('created_at', { ascending: false });

    // For each company get their openings count
    const companiesWithStats = await Promise.all(
      (companiesData || []).map(async (company) => {
        const { count: openingsCount } = await supabase
          .from('openings')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);

        return { ...company, openingsCount: openingsCount || 0 };
      })
    );

    setCompanies(companiesWithStats);
    setFiltered(companiesWithStats);
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2540]">Companies</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {companies.length} company{companies.length !== 1 ? 'ies' : ''} registered on the platform
        </p>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or sector..."
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
              <Building2 className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No companies found.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {filtered.map((company) => (
                <div key={company.id} className="flex items-center gap-4 sm:gap-5 px-5 sm:px-8 py-5 hover:bg-zinc-50 transition">
                  <div className="w-11 h-11 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(company.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2540] truncate">{company.full_name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {company.department || 'No sector listed'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#0A2540]">{company.openingsCount}</p>
                    <p className="text-xs text-zinc-400">openings</p>
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
