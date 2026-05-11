import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CompanyDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, company_name, role')
          .eq('id', user.id)
          .single();

        setCompany({ ...user, ...profile });
      } catch (error) {
        console.error('Error fetching company profile:', error);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { label: "Overview", icon: LayoutDashboard, path: "/dashboard/company" },
    { label: "Openings", icon: Briefcase, path: "/dashboard/company/openings" },
    { label: "Applicants", icon: Users, path: "/dashboard/company/applicants" },
  ];

  const isActive = (path: string) => 
    location.pathname === path || location.pathname.startsWith(path);

  const displayName = company?.company_name || company?.full_name || 'Company';

  return (
    <div className="flex h-dvh bg-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-[min(18rem,85vw)] bg-[#0A2540] text-white transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          {/* Logo - Text Only */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">InternHub</h1>
            <p className="text-xs text-blue-300 -mt-1">SIWES PORTAL</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                  isActive(item.path)
                    ? 'bg-yellow-500 text-[#0A2540] font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-xs text-blue-300 uppercase tracking-widest">COMPANY</p>
            <p className="font-medium truncate">{displayName}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 rounded-2xl transition"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>

          <button
            onClick={() => navigate('/')}
            className="mt-3 w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/10 rounded-2xl transition text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="lg:hidden bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <h1 className="font-bold text-xl text-[#0A2540]">InternHub</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <Outlet />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}
