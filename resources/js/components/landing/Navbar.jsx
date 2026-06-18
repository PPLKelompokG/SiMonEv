import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Menu, X, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled ? 'pt-4 px-4' : 'pt-0 px-0'}`}>
      <nav 
        className={`mx-auto transition-all duration-500 ease-in-out flex items-center justify-between
          ${isScrolled 
            ? 'max-w-6xl w-full mx-4 md:mx-auto bg-black/40 light:bg-white/80 backdrop-blur-md shadow-2xl rounded-full py-3 px-8 border border-white/10 light:border-black/10' 
            : 'max-w-7xl bg-transparent py-4 px-6 md:px-12'
          }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="SiMonEv Logo" 
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" 
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
            S
          </div>
          <span className={`text-[1.5rem] font-black tracking-tight ${isScrolled ? 'text-white light:text-slate-900' : 'text-white drop-shadow-md light:text-slate-900 light:drop-shadow-none'}`}>
            SiMon<span className="text-emerald-500">Ev</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#tentang" className="text-sm font-medium text-gray-200 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors">Tentang</a>
          <a href="#peta" className="text-sm font-medium text-gray-200 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors">Peta Sebaran</a>
          <a href="#alur" className="text-sm font-medium text-gray-200 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors">Alur Penyaluran</a>
          
          <div className="h-6 w-px bg-white/20 light:bg-black/20 mx-2"></div>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-300 hover:text-white light:text-slate-500 light:hover:text-slate-900 hover:bg-white/10 light:hover:bg-black/5 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link 
            to="/login" 
            className="flex items-center gap-2 bg-slate-900 light:bg-emerald-600 hover:bg-slate-800 light:hover:bg-emerald-700 border border-emerald-500/30 light:border-emerald-500 text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-lg"
          >
            <LogIn size={16} />
            Login Portal
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl">
          <a href="#tentang" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium p-2 hover:bg-white/5 rounded-lg">Tentang</a>
          <a href="#peta" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium p-2 hover:bg-white/5 rounded-lg">Peta Sebaran</a>
          <a href="#alur" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium p-2 hover:bg-white/5 rounded-lg">Alur Penyaluran</a>
          <Link 
            to="/login" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold mt-2"
          >
            <LogIn size={18} />
            Login Portal
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
