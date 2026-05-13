import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-950 rounded-xl flex shrink-0 items-center justify-center">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">InternHub</h1>
            <p className="text-xs text-zinc-500 -mt-1">SIWES PORTAL</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link
            to="/about"
            className={`hover:text-blue-950 transition ${
              location.pathname === '/about' ? 'text-blue-950 font-medium' : ''
            }`}
          >
            About
          </Link>

          <Link
            to="/track"
            className={`hover:text-blue-950 transition ${
              location.pathname === '/track' ? 'text-blue-950 font-medium' : ''
            }`}
          >
            Track Progress
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <button className="px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl transition">
              Sign in
            </button>
          </Link>

          <Link to="/register">
            <button className="px-6 py-2.5 bg-blue-950 text-white rounded-xl font-medium hover:bg-blue-900 transition">
              Get started
            </button>
          </Link>
        </div>

        {/* 🔥 Mobile Hamburger */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 🔥 Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-6 pb-6 flex flex-col gap-4 bg-white border-t">

          <Link to="/about" onClick={() => setMenuOpen(false)}>
            <p className="py-2">About</p>
          </Link>

          <Link to="/track" onClick={() => setMenuOpen(false)}>
            <p className="py-2">Track Progress</p>
          </Link>

          <Link to="/login" onClick={() => setMenuOpen(false)}>
            <button className="w-full py-3 border border-zinc-300 rounded-xl">
              Sign in
            </button>
          </Link>

          <Link to="/register" onClick={() => setMenuOpen(false)}>
            <button className="w-full py-3 bg-blue-950 text-white rounded-xl">
              Get started
            </button>
          </Link>

        </div>
      </div>
    </nav>
  );
}
