import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GraduationCap, Building2, UserCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

type Role = 'student' | 'company' | 'supervisor';

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    department: '',
    schoolName: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Basic Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
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

    // Role-specific validation
    if ((selectedRole === 'student' || selectedRole === 'supervisor') && !formData.schoolName.trim()) {
      setError('School/University name is required.');
      return;
    }
    if (selectedRole === 'student' && !formData.studentId.trim()) {
      setError('Student ID is required.');
      return;
    }
    if (selectedRole === 'company' && !formData.department.trim()) {
      setError('Company/Organisation name is required.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            role: selectedRole,
            student_id: selectedRole === 'student' ? formData.studentId.trim() : null,
            department: formData.department.trim() || null,
            school_name: (selectedRole === 'student' || selectedRole === 'supervisor')
              ? formData.schoolName.trim()
              : null,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || 
            signUpError.status === 422) {
          setError("This email is already registered. Please try logging in instead.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (!data.user) {
        throw new Error('Account creation failed. Please try again.');
      }

      // Create/Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: formData.fullName.trim(),
          role: selectedRole,
          student_id: selectedRole === 'student' ? formData.studentId.trim() : null,
          department: formData.department.trim() || null,
          school_name: (selectedRole === 'student' || selectedRole === 'supervisor')
            ? formData.schoolName.trim()
            : null,
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile error:', profileError);
        // Still show success since auth succeeded
      }

      setSuccessMessage('Account created successfully! Please check your email to confirm your account.');

      // Redirect to login after short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Account created successfully! Please sign in.' } 
        });
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-50 pt-20 sm:pt-24 pb-12">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-10">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-blue-950 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Create your account</h2>
              <p className="text-zinc-600 mt-2">Join InternHub as a student, company or supervisor.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mb-6 text-sm">
                {successMessage}
              </div>
            )}

            {/* Role Selection */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 mb-8 bg-zinc-100 rounded-xl p-1 gap-1">
              {[
                { role: 'student', label: 'Student', icon: GraduationCap },
                { role: 'company', label: 'Company', icon: Building2 },
                { role: 'supervisor', label: 'Supervisor', icon: UserCheck },
              ].map(({ role, label, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role as Role);
                    setError('');
                  }}
                  className={`w-full py-3 px-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
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

              {/* Student Fields */}
              {selectedRole === 'student' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                        STUDENT ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                        placeholder="STU/2024/099"
                        required
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

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                      SCHOOL / UNIVERSITY <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                      placeholder="e.g. University of Lagos"
                      required
                    />
                  </div>
                </>
              )}

              {/* Company Fields */}
              {selectedRole === 'company' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                    COMPANY / ORGANISATION NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="e.g. MTN Nigeria, Andela, etc."
                    required
                  />
                </div>
              )}

              {/* Supervisor Fields */}
              {selectedRole === 'supervisor' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                      DEPARTMENT / FACULTY
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                      placeholder="e.g. Faculty of Engineering"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                      SCHOOL / INSTITUTION <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                      placeholder="e.g. University of Lagos"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 pr-12 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="At least 6 characters"
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

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2 tracking-wide">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 pr-12 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                    placeholder="Repeat your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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