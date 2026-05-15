import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../utils/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Username dan password harus diisi.'); return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/login', form);
      localStorage.setItem('bb_token', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', backgroundColor: 'var(--color-canvas-soft)',
    color: 'var(--color-ink)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', padding: '11px 14px',
    fontSize: '15px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Card */}
        <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)', padding: '40px 36px', boxShadow: '0 24px 48px rgba(32,21,21,0.22)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', margin: '0 auto 16px',
              backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255,79,0,0.32)',
            }}>
              <FiLock style={{ color: 'var(--color-on-primary)' }} size={26} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)' }}>Admin Login</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-body-mid)', marginTop: '4px' }}>Masuk untuk mengelola katalog</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '20px', padding: '12px 14px',
              backgroundColor: '#fff5f5', border: '1px solid #fed7d7',
              borderRadius: 'var(--radius-sm)', color: '#9b2c2c',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mute)' }} size={17} />
                <input
                  type="text" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Masukkan username"
                  style={{ ...inputStyle, paddingLeft: '42px' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,79,0,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mute)' }} size={17} />
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan password"
                  style={{ ...inputStyle, paddingLeft: '42px', paddingRight: '42px' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,79,0,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-mute)', padding: 0 }}>
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)',
                borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(255,79,0,0.28)', marginTop: '4px',
                transition: 'opacity 0.2s',
              }}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </>
              ) : 'Masuk'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,254,251,0.35)', marginTop: '20px' }}>
          Operasi Gudang Admin Panel
        </p>
      </div>
    </div>
  );
}
