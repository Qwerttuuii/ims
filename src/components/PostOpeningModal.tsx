import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PostOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PostOpeningModal({ isOpen, onClose, onSuccess }: PostOpeningModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    sector: 'Technology',
    duration: '',
    stipend: '',
    deadline: '',
    description: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      sector: 'Technology',
      duration: '',
      stipend: '',
      deadline: '',
      description: '',
      requirements: '',
    });
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('You must be logged in to post an opening.');

      const { error: insertError } = await supabase.from('openings').insert({
        company_id: user.id,
        title: formData.title,
        location: formData.location,
        sector: formData.sector,
        duration: formData.duration,
        stipend: formData.stipend,
        deadline: formData.deadline,
        description: formData.description,
        requirements: formData.requirements
          ? formData.requirements.split(',').map(r => r.trim()).filter(Boolean)
          : [],
        status: 'active',
      });

      if (insertError) throw insertError;

      setSuccess(true);
      onSuccess?.();

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to post opening. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white p-8 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-semibold">New Opening</h2>
              <p className="text-blue-300 mt-1">Share the role details — applications open immediately</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-white/70 hover:text-white transition"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Opening Published!</h3>
            <p className="text-zinc-500">Students can now apply for this position.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Role Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Frontend Engineering Intern"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Lagos (Hybrid)"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                >
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Marketing</option>
                  <option>Healthcare</option>
                  <option>Engineering</option>
                  <option>Education</option>
                  <option>Media</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Duration</label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="6 months"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Stipend</label>
                <input
                  type="text"
                  required
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  placeholder="₦150,000 / month"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Application Deadline</label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="What will the intern work on? What team will they join?"
                className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Requirements
                <span className="text-zinc-400 font-normal ml-1">(comma separated)</span>
              </label>
              <input
                type="text"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="TypeScript, React, Git, Tailwind CSS"
                className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-4 border border-zinc-200 rounded-2xl font-medium hover:bg-zinc-50 transition text-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-blue-950 text-white rounded-2xl font-medium hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publishing...' : 'Publish Opening'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}