import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShield } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <span className="text-white font-bold text-lg tracking-tight">BB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-text-primary leading-tight tracking-tight">
                BekasBagus
              </span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-widest">
                Katalog Barang Bekas
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-dark'
              }`}
            >
              Katalog
            </Link>
            <Link
              to="/admin/login"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isAdmin
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-dark'
              }`}
            >
              <FiShield size={14} />
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-dark transition-colors"
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border-light mt-2 pt-3 space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-surface-dark'
              }`}
            >
              Katalog
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isAdmin
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-surface-dark'
              }`}
            >
              <FiShield size={14} />
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
