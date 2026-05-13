import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SupervisorDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [supervisor, setSupervisor] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, school_name')
          .eq('id', user.id)
          .maybeSingle();
        setSupervisor({ ...user, ...data });
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard/supervisor' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-dvh bg-[#F8F7F4] overflow-hidden">

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-[min(16rem,85vw)] bg-[#0A2540] text-white flex flex-col transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>

        <div className="p-6 pb-4">

          {/* Text only — no IH box, no icon */}
          <div className="mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-white">InternHub</h1>
            <p className="text-[10px] text-blue-300 tracking-widest mt-0.5">SIWES PORTAL</p>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm transition-all ${
                  isActive(item.path)
                    ? 'bg-yellow-400 text-[#0A2540] font-semibold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            ))}

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm text-white/80 hover:bg-white/10 transition-all"
            >
              <Home className="w-4 h-4 shrink-0" />
              Back to Home
            </button>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-auto p-6 pt-0">
          <div className="bg-white/10 rounded-2xl p-4 mb-3">
            <p className="text-[10px] text-blue-300 uppercase tracking-widest mb-1">Supervisor</p>
            <p className="font-semibold text-sm truncate">{supervisor?.full_name || 'Supervisor'}</p>
            {supervisor?.school_name && (
              <p className="text-[11px] text-blue-300 truncate mt-0.5">{supervisor.school_name}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 rounded-2xl transition text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="lg:hidden bg-white border-b px-4 sm:px-5 py-4 flex items-center justify-between sticky top-0 z-40">
          <span className="font-bold text-[#0A2540]">InternHub</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <Outlet />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
