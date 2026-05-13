import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ApplyModal from '../../components/ApplyModal';

export default function StudentOpportunities() {
  const [openings, setOpenings] = useState<any[]>([]);
  const [appliedOpeningIds, setAppliedOpeningIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedOpening, setSelectedOpening] = useState<any>(null);

  const fetchOpenings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from('openings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setOpenings(data || []);

      // Fetch already applied openings
      if (user) {
        const { data: apps } = await supabase
          .from('applications')
          .select('opening_id')
          .eq('student_id', user.id);

        setAppliedOpeningIds(new Set(apps?.map((a: any) => a.opening_id) || []));
      }
    } catch (err) {
      console.error('Error fetching openings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenings();
  }, []);

  const handleApplyClick = (opening: any) => {
    setSelectedOpening(opening);
  };

  const handleApplySuccess = () => {
    if (selectedOpening) {
      setAppliedOpeningIds(prev => new Set(prev).add(selectedOpening.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Internship Opportunities</h1>
          <p className="text-zinc-600 mt-2">Discover and apply to active internship positions</p>
        </div>

        {openings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-16 text-center shadow-sm">
            <Briefcase className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
            <h3 className="text-2xl font-medium text-zinc-400">No openings available right now</h3>
            <p className="text-zinc-500 mt-2">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {openings.map((opening) => {
              const isApplied = appliedOpeningIds.has(opening.id);

              return (
                <div
                  key={opening.id}
                  className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm hover:shadow-md transition-all border border-zinc-100"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold leading-tight">{opening.title}</h3>
                      <p className="text-blue-600 font-medium mt-1">{opening.sector || 'General'}</p>
                    </div>
                    {isApplied && (
                      <div className="flex shrink-0 items-center gap-1 text-emerald-600 text-sm font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Applied
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    {opening.location && (
                      <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        <span>{opening.location}</span>
                      </div>
                    )}
                    {opening.duration && (
                      <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span>{opening.duration}</span>
                      </div>
                    )}
                    {opening.stipend && (
                      <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <DollarSign className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium">{opening.stipend}</span>
                      </div>
                    )}
                    {opening.deadline && (
                      <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <span>Closes {new Date(opening.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {opening.description && (
                    <div className="mt-6 text-sm text-zinc-600 line-clamp-3 leading-relaxed">
                      {opening.description}
                    </div>
                  )}

                  {opening.requirements && opening.requirements.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {opening.requirements.slice(0, 4).map((req: string, i: number) => (
                        <span key={i} className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleApplyClick(opening)}
                    disabled={isApplied}
                    className={`mt-8 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-medium transition ${
                      isApplied
                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                        : 'bg-blue-950 hover:bg-blue-900 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        ✓ Already Applied
                      </>
                    ) : (
                      <>
                        Apply Now <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={!!selectedOpening}
        onClose={() => setSelectedOpening(null)}
        opening={selectedOpening}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
}
