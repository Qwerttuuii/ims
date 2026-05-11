import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function RoleBasedRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle(); // ← won't throw if no row found

      if (error) {
        console.error('Role fetch error:', error.message);
        navigate('/login');
        return;
      }

      const role = profile?.role?.toLowerCase();

      switch (role) {
        case 'student':
          navigate('/dashboard/student', { replace: true });
          break;
        case 'company':
          navigate('/dashboard/company', { replace: true });
          break;
        case 'supervisor':
          navigate('/dashboard/supervisor', { replace: true });
          break;
        case 'admin':
          navigate('/dashboard/admin', { replace: true });
          break;
        default:
          console.warn('Unknown role:', role);
          navigate('/dashboard/student', { replace: true });
      }
    };

    redirectUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}