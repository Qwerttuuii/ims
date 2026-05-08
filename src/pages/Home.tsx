import {  ArrowRight, BookOpen, Users, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Now in pilot with three Nigerian universities
            </div>

            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
              The End Of The<br />
              <span className="text-blue-950">Paper Logbook.</span>
            </h1>

            <p className="text-xl text-zinc-600 max-w-lg">
              InternHub is the modern record of student industrial training. 
              From placement letters to weekly entries to supervisor evaluation 
              every signature, every score, in one auditable place.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <button className="px-8 py-4 bg-blue-950 text-white rounded-2xl font-medium flex items-center gap-3 hover:bg-blue-900 transition text-lg">
                  Open a student account
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>

              <Link to="/track">
                <button className="px-8 py-4 border border-zinc-300 hover:border-zinc-400 rounded-2xl font-medium flex items-center gap-3 transition text-lg">
                  Track a student by ID
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800"
              alt="Student"
              className="rounded-3xl shadow-2xl w-full"
            />
            <div className="absolute -top-6 -right-6 bg-white p-5 rounded-2xl shadow-xl max-w-[260px]">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-sm">LOGBOOK ENTRY</p>
                  <p className="text-xs text-zinc-500">Mon • Week 14</p>
                </div>
              </div>
              <p className="text-sm">"Refactored the auth module and shipped three pull requests."</p>
              <div className="mt-3 inline-block bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">Approved</div>
            </div>
          </div>
        </div>
      </section>
      {/* Trusted By */}
      <section className="py-10 border-t border-b bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-zinc-500 mb-6">TRUSTED BY UNIVERSITIES & INDUSTRY PARTNERS</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-lg opacity-75">
            <p className="font-semibold">University of Lagos</p>
            <p className="font-semibold">Covenant University</p>
            <p className="font-semibold">Obafemi Awolowo University</p>
            <p className="font-semibold">Andela</p>
            <p className="font-semibold">Admiralty University Of Nigeria</p>
          </div>
        </div>
      </section>

      {/* What You Actually Get */}
      <section className="py-20 bg-zinc-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium">02 — WHAT YOU ACTUALLY GET</p>
            <h2 className="text-5xl font-bold mt-3 tracking-tight">A logbook that doesn't go missing the night before submission.</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Weekly digital logbook", desc: "Structured entries replace paper books. Photos and PDF attachments supported." },
              { icon: Users, title: "Inline supervisor review", desc: "Comment, request changes, and score each week without email threads." },
              { icon: Award, title: "ID-based progress tracking", desc: "A Student ID is enough to view live status — perfect for parents." },
              { icon: Shield, title: "Role-based permissions", desc: "Students see their record. Supervisors see their assignees. Admins see everything." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 hover:shadow-xl transition">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-blue-950" />
                </div>
                <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-zinc-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
     {/* Testimonial + CTA */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-4xl mb-6">★★★★★</div>
          <p className="text-3xl leading-tight font-medium">
            "Before InternHub, I was chasing 240 students for paper logbooks every term. 
            Now I open one dashboard on a Friday morning and the term grades itself."
          </p>
          <p className="mt-6 text-zinc-600">Dr. Adebola Williams — SIWES Coordinator, Covenant University</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-4">Bring your department on next term.</h2>
          <p className="text-xl text-blue-200 mb-10">Free to onboard for the first cohort. White-glove migration of existing student records included.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
            <button className="px-10 py-4 bg-white text-blue-950 rounded-2xl font-medium text-lg hover:bg-blue-50 transition">
              Get started
            </button>
            </Link>
            <Link to="/track">
              <button className="px-10 py-4 border border-blue-700 text-white rounded-2xl font-medium text-lg hover:bg-blue-900 transition">
                Track Your Progress
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t py-8 text-center text-sm text-zinc-500">
        © 2026 InternHub Internship Management System
      </footer>
    </div>
  );
}

export default Home;