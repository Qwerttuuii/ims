import { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, Clock, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PostOpeningModal from '../../components/PostOpeningModal';
import { useAppAlert } from '../../components/AppAlert';

export default function CompanyOpenings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openings, setOpenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { showAlert } = useAppAlert();

  const fetchOpenings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('openings')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpenings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opening?')) return;
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('openings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setOpenings(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      console.error(err);
      showAlert({
        title: 'Delete failed',
        message: err.message,
        variant: 'error',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const { error } = await supabase
        .from('openings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setOpenings(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-10 h-10 border-4 border-blue-950 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Openings</h1>
            <p className="text-zinc-500 mt-1 text-sm">
              {openings.length} posting{openings.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-blue-950 text-white px-5 sm:px-6 py-3 rounded-2xl hover:bg-blue-900 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Post New Opening
          </button>
        </div>

        {/* Empty state */}
        {openings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-16 text-center shadow-sm">
            <Briefcase className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-zinc-400">No openings posted yet</h3>
            <p className="text-zinc-400 text-sm mt-2">Click "Post New Opening" to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {openings.map((opening) => (
              <div key={opening.id} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-zinc-100 hover:border-blue-200 transition">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg leading-tight">{opening.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{opening.sector}</p>
                  </div>
                  <span className={`w-fit sm:ml-3 shrink-0 text-xs px-3 py-1 rounded-full font-medium ${
                    opening.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {opening.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {opening.location && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      {opening.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    {opening.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    Closes {new Date(opening.deadline).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-sm text-zinc-500 font-medium">{opening.stipend}</p>

                {opening.requirements && opening.requirements.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {opening.requirements.slice(0, 3).map((req: string, i: number) => (
                      <span key={i} className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">
                        {req}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex gap-3 pt-4 border-t border-zinc-100">
                  <button
                    onClick={() => handleToggleStatus(opening.id, opening.status)}
                    className="flex-1 py-2 text-sm border border-zinc-200 rounded-xl hover:bg-zinc-50 transition font-medium"
                  >
                    {opening.status === 'active' ? 'Close Opening' : 'Reopen'}
                  </button>
                  <button
                    onClick={() => handleDelete(opening.id)}
                    disabled={deleting === opening.id}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PostOpeningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchOpenings}
      />
    </div>
  );
}
