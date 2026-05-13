import Navbar from '../components/Navbar';

export default function About() {
  return (
    <>
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">A Modern Home For SIWES.</h1>
        <p className="text-base sm:text-xl text-zinc-600 leading-relaxed">
          The Internship Management System is a web-based platform designed to streamline and automate 
          processes involved in student industrial training (SIWES). It bridges the gap between students, 
          institutions, and organizations through a centralized portal.
        </p>
      </div>

      {/* Primary Objectives */}
      <div className="mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Primary Objectives</h2>
        <div className="bg-white border border-zinc-100 rounded-3xl p-5 sm:p-8 space-y-4">
          <ul className="space-y-4 text-zinc-700">
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Secure authentication and role-based access (Student, Company, Supervisor, Admin)
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Student profile, application & placement management
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Weekly logbook submission and supervisor review
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Internship assignment tracking with start/end dates
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Supervisor evaluation, scoring and feedback
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Administrative oversight and reporting
            </li>
          </ul>
        </div>
      </div>

      {/* Secondary Objectives */}
      <div className="mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Secondary Objectives</h2>
        <div className="bg-white border border-zinc-100 rounded-3xl p-5 sm:p-8 space-y-4">
          <ul className="space-y-4 text-zinc-700">
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Notifications & reminders for submissions
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Search and filtering for opportunities
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Document upload (acceptance letters, forms)
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Performance analytics and visual reporting
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 mt-1">•</span>
              Secure data handling and reliability
            </li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}
