import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  opening: any;
  onSuccess: () => void;
}

export default function ApplyModal({ isOpen, onClose, opening, onSuccess }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('applications').insert({
        student_id: user.id,
        opening_id: opening.id,
        cover_letter: coverLetter,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        status: 'pending'
      });

      if (error) throw error;

      alert('Application submitted successfully!');
      onSuccess();
      onClose();
      setCoverLetter('');
      setCgpa('');
    } catch (err: any) {
      console.error(err);
      alert('Failed to submit application: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !opening) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-8 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold">Apply for</h2>
              <p className="text-blue-600 font-medium">{opening.title}</p>
            </div>
            <button onClick={onClose}>
              <X size={28} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">CGPA (Optional)</label>
            <input
              type="text"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              placeholder="4.5"
              className="w-full px-4 py-3 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Letter</label>
            <textarea
              required
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={8}
              placeholder="Why are you a great fit for this role? What do you hope to learn?"
              className="w-full px-4 py-3 border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600 resize-y min-h-[180px]"
            />
            <p className="text-xs text-zinc-500 mt-2">Tell the company why they should choose you.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-zinc-300 rounded-2xl font-medium hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !coverLetter.trim()}
              className="flex-1 py-4 bg-blue-950 text-white rounded-2xl font-medium hover:bg-blue-900 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}