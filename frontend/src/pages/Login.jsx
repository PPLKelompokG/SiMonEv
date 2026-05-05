import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email,
        password
      }, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });

      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#000000', // Very dark/black background outside
      padding: '2rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="login-container" style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1000px',
        height: '650px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)', // Subtle glow
        background: `url('/landscape.jpg') center/cover no-repeat`, // Using the landscape image
        position: 'relative'
      }}>
        
        {/* Left Half: Clear to show image */}
        <div style={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2.5rem'
        }}>
          {/* Optional: Add a very slight dark gradient to the left side if the image is too bright */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0))',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Right Half: Glassmorphism / Blur layer */}
        <div style={{
          flex: 1,
          background: 'rgba(15, 20, 15, 0.6)', // Dark translucent matching the vibe
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem 4rem',
          position: 'relative',
          color: '#ffffff'
        }}>
          {/* Top Right Logo */}
          <div style={{ position: 'absolute', top: '2.5rem', right: '3rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
              SiMon<span style={{ color: '#10b981' }}>Ev</span>
            </span>
          </div>

          <div style={{ marginBottom: '3rem', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 1100, marginBottom: '0.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
              Please enter your details.
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: 500 }}>E-mail</label>
              <input
                type="email"
                placeholder="Enter your e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '0.5rem 0',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderBottom = '1px solid #10b981'}
                onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: 500 }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '0.5rem 0',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  letterSpacing: password ? '0.2em' : 'normal'
                }}
                onFocus={(e) => e.target.style.borderBottom = '1px solid #10b981'}
                onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#9ca3af' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#10b981', cursor: 'pointer' }} />
                Remember me
              </label>
              
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                background: '#111827',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '1.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => {
                if(!loading) {
                  e.target.style.background = '#1f2937';
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if(!loading) {
                  e.target.style.background = '#111827';
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Responsive adjustments using style block to avoid polluting global css unnecessarily */}
      <style>{`
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column !important;
            height: auto !important;
            min-height: 600px;
          }
          .login-container > div:first-child {
            display: none !important; /* Hide image on mobile to save space */
          }
          .login-container > div:last-child {
            padding: 3rem 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
