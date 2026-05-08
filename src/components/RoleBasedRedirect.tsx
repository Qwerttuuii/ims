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

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role?.toLowerCase();

      switch (role) {
        case 'student':
          navigate('/dashboard/student');
          break;
        case 'company':
          navigate('/dashboard/company');
          break;
        case 'supervisor':
          navigate('/dashboard/supervisor');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/dashboard/student'); // fallback
      }
    };

    redirectUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-lg">Redirecting to your dashboard...</div>
    </div>
  );
}