import { useState } from 'react';
import { GraduationCap, Search, ArrowRight } from 'lucide-react';

export default function Track() {
  const [studentId, setStudentId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setIsSearching(true);
    setResult(null);

    // Simulate API call
    setTimeout(() => {
      setResult({
        name: "Adaeze Okafor",
        studentId: studentId.toUpperCase(),
        department: "Computer Science",
        company: "MTN Nigeria",
        status: "Active",
        week: 14,
        totalWeeks: 24,
        progress: 58,
      });
      setIsSearching(false);
    }, 1200);
  };

  const exampleIds = ["STU/2024/001", "STU/2024/002", "STU/2024/003"];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm mb-6">
              <GraduationCap className="w-4 h-4" />
              PUBLIC LOOKUP
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Track student progress</h1>
            <p className="text-xl text-zinc-600 max-w-md mx-auto">
              Enter a Student ID to view live internship status, supervisor info, and recent activity.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="relative">
              <div className="absolute left-5 top-4 text-zinc-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STU/2024/001"
                className="w-full pl-14 pr-6 py-4 text-lg border border-zinc-300 rounded-2xl focus:outline-none focus:border-blue-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || !studentId.trim()}
              className="mt-6 w-full py-4 bg-blue-950 text-white rounded-2xl font-medium text-lg hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Track Progress'}
            </button>
          </form>

          {/* Example IDs */}
          <div className="text-center mb-8">
            <p className="text-sm text-zinc-500 mb-3">Try these example IDs:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {exampleIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setStudentId(id)}
                  className="px-5 py-2 bg-white border border-zinc-200 rounded-full text-sm hover:border-blue-300 hover:text-blue-700 transition"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result */}
          {result && (
            <div className="bg-white rounded-3xl shadow-xl p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-semibold">{result.name}</h3>
                  <p className="text-blue-600 font-medium">{result.studentId}</p>
                </div>
                <div className={`px-5 py-2 rounded-full text-sm font-medium ${
                  result.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {result.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-zinc-500 text-sm">Department</p>
                  <p className="font-medium">{result.department}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Company</p>
                  <p className="font-medium">{result.company}</p>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>Week {result.week} of {result.totalWeeks}</span>
                </div>
                <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${result.progress}%` }}
                  />
                </div>
              </div>

              <button className="w-full py-4 border border-zinc-300 rounded-2xl hover:bg-zinc-50 transition flex items-center justify-center gap-2">
                View Full Logbook 
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}