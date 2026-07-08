import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GraduationCap, Building2, UserCheck, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAppAlert } from '../components/AppAlert';

type Role = 'student' | 'company' | 'supervisor' | 'admin';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAppAlert();

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      showAlert({ title: 'Account ready', message: location.state.message, variant: 'success' });
    }
  }, [location.state, showAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      showAlert({ title: 'Welcome back', message: 'You have signed in successfully.', variant: 'success' });
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-blue-950 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Sign in</h2>
            <p className="text-zinc-600 mt-2">Welcome back! Choose your role to continue.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-center">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-10">
            {[
              { role: 'student', label: 'Student', icon: GraduationCap },
              { role: 'company', label: 'Company', icon: Building2 },
              { role: 'supervisor', label: 'Supervisor', icon: UserCheck },
              { role: 'admin', label: 'Admin', icon: Shield },
            ].map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role as Role)}
                className={`flex flex-col items-center justify-center gap-2 py-3 sm:py-4 border-2 rounded-2xl transition-all ${
                  selectedRole === role
                    ? 'border-blue-950 bg-blue-50 shadow-sm'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <Icon className={`w-6 h-6 ${selectedRole === role ? 'text-blue-950' : 'text-zinc-500'}`} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 pr-12 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-950 hover:bg-blue-900 text-white rounded-2xl font-medium text-lg transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-950 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}