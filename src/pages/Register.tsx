import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GraduationCap, Building2, UserCheck, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

type Role = 'student' | 'company' | 'supervisor';

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    department: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Sign up — pass ALL profile data as metadata
      // This is used by the DB trigger as a fallback
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: selectedRole,
            student_id: selectedRole === 'student' ? formData.studentId || null : null,
            department: formData.department || null,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('Account creation failed. Please try again.');
      }

      // Step 2: Insert profile manually as well (belt and braces approach)
      // This works whether or not the trigger fired
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({          // upsert instead of insert — won't fail if trigger already created it
          id: data.user.id,
          full_name: formData.fullName,
          role: selectedRole,
          student_id: selectedRole === 'student' ? formData.studentId || null : null,
          department: formData.department || null,
        }, {
          onConflict: 'id' // if row already exists (trigger created it), just update it
        });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        throw new Error('Account created but profile setup failed: ' + profileError.message);
      }

      // Step 3: Redirect to login with success message
      navigate('/login', {
        state: { message: 'Account created! Please sign in.' }
      });

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-50 pt-20 pb-12">
        <div className="max-w-lg mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-blue-950 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
              <p className="text-zinc-600 mt-2">Join InternHub as a student, company or supervisor.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-sm text-center">
                {error}
              </div>
            )}

            {/* Role Tabs */}
            <div className="flex mb-8 bg-zinc-100 rounded-xl p-1 gap-1">
              {[
                { role: 'student', label: 'Student', icon: GraduationCap },
                { role: 'company', label: 'Company', icon: Building2 },
                { role: 'supervisor', label: 'Supervisor', icon: UserCheck },
              ].map(({ role, label, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role as Role)}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
                    selectedRole === role
                      ? 'bg-white shadow text-blue-950'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Student-specific fields */}
              {selectedRole === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                      STUDENT ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                      placeholder="STU/2024/099"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                      DEPARTMENT
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
              )}

              {/* Company-specific fields */}
              {selectedRole === 'company' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                    COMPANY / ORGANISATION NAME
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="e.g. Acme Technologies"
                  />
                </div>
              )}

              {/* Supervisor-specific fields */}
              {selectedRole === 'supervisor' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                    DEPARTMENT / INSTITUTION
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="e.g. University of Lagos"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                  PASSWORD
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                  placeholder="Repeat your password"
                  required
                />
              </div>

              {/* Role indicator */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-800">
                Registering as: <span className="font-semibold capitalize">{selectedRole}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-950 hover:bg-blue-900 text-white rounded-2xl font-semibold text-base transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-950 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}