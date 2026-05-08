import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Search,
  Clock,
  TrendingUp,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', authUser.id)
            .single();

          setUser({ ...authUser, ...profile });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Menu Items
  const menuItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      path: "/dashboard/student",
    },
    {
      label: "Opportunities",
      icon: Briefcase,
      path: "/dashboard/student/opportunities",
    },
    {
      label: "My Applications",
      icon: Search,
      path: "/dashboard/student/applications",
    },
    {
      label: "Weekly Logbook",
      icon: Clock,
      path: "/dashboard/student/logbook",
    },
    {
      label: "Public Progress",
      icon: TrendingUp,
      path: "/track",
    },
  ];

  // Check if current path matches menu item
  const isActive = (path: string) => {
    if (path === "/track") {
      return location.pathname === "/track";
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-zinc-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0A2540] text-white transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          {/* Logo */}
          {/* Logo - Text Only */}
<div className="flex items-center gap-3 mb-10">
  <div>
    <h1 className="text-3xl font-bold tracking-tight text-white">InternHub</h1>
    <p className="text-xs text-blue-300 -mt-1">SIWES PORTAL</p>
  </div>
</div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                  isActive(item.path)
                    ? 'bg-yellow-500 text-[#0A2540] font-semibold'
                    : 'hover:bg-white/10 text-white/90'
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
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-xs text-blue-300 mb-1">STUDENT</p>
            <p className="font-medium truncate">
              {user?.full_name || 'Student User'}
            </p>
            {user?.role && (
              <p className="text-xs text-blue-300 capitalize">{user.role}</p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Mobile Top Header */}
       {/* Mobile Top Header */}
<div className="lg:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40">
  <div className="flex items-center gap-3">
    <h1 className="text-2xl font-bold text-[#0A2540]">InternHub</h1>
  </div>

  <button
    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    className="p-2 text-zinc-700"
  >
    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
  </button>
</div>

        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}