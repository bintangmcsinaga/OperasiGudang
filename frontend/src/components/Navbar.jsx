import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShield } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav style={{ backgroundColor: 'var(--color-canvas)', borderBottom: '1px solid var(--color-border-light)' }}
      className="sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div style={{ backgroundColor: 'transparent', borderRadius: 'var(--radius-md)' }}
              className="w-14 h-14 flex items-center justify-center shadow-md group-hover:opacity-90 transition-opacity">
              <span style={{ color: 'var(--color-on-primary)' }} className="font-bold text-lg tracking-tight">
                <img src="logo.png" alt="" />
              </span>
            </div>
            <div className="flex flex-col">
              <span style={{ color: 'var(--color-ink)', fontWeight: 700, fontSize: '17px' }} className="leading-tight tracking-tight">
                Operasi Gudang
              </span>
              <span style={{ color: 'var(--color-body-mid)', fontSize: '10px', letterSpacing: '0.1em', fontWeight: 500 }}
                className="uppercase">
                Katalog Barang
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/"
              style={location.pathname === '/'
                ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-md)' }
                : { color: 'var(--color-body)', borderRadius: 'var(--radius-md)' }}
              className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
            >
              Katalog
            </Link>
            <Link
              to="/admin/login"
              style={isAdmin
                ? { backgroundColor: 'var(--color-ink)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-md)' }
                : { color: 'var(--color-body)', borderRadius: 'var(--radius-md)' }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
            >
              <FiShield size={14} />
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ color: 'var(--color-body)', borderRadius: 'var(--radius-sm)' }}
            className="md:hidden p-2 transition-colors hover:opacity-70"
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div style={{ borderTop: '1px solid var(--color-border-light)' }}
            className="md:hidden pb-4 mt-2 pt-3 space-y-1 animate-[fadeIn_0.2s_ease]">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              style={location.pathname === '/'
                ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-md)' }
                : { color: 'var(--color-body)', borderRadius: 'var(--radius-md)' }}
              className="block px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Katalog
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              style={isAdmin
                ? { backgroundColor: 'var(--color-ink)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-md)' }
                : { color: 'var(--color-body)', borderRadius: 'var(--radius-md)' }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
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
