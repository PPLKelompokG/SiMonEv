import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const containerRef = useRef(null);

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

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      // Calculate mouse position relative to center of screen, from -1 to 1
      const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
      
      containerRef.current.style.setProperty('--mouse-x', xRatio);
      containerRef.current.style.setProperty('--mouse-y', yRatio);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="login-bg-animate"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        // Default ratios
        '--mouse-x': 0,
        '--mouse-y': 0
      }}
    >
      {/* Scattered Parallax Glowing Orbs */}
      <div 
        className="orb orb-1"
        style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
          transform: 'translate(calc(var(--mouse-x) * 60px), calc(var(--mouse-y) * 60px))',
          transition: 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }} 
      />
      <div 
        className="orb orb-2"
        style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
          transform: 'translate(calc(var(--mouse-x) * -80px), calc(var(--mouse-y) * -80px))',
          transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }} 
      />
      <div 
        className="orb orb-3"
        style={{
          position: 'absolute', top: '30%', right: '-5%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
          transform: 'translate(calc(var(--mouse-x) * 40px), calc(var(--mouse-y) * -50px))',
          transition: 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }} 
      />
      <div 
        className="orb orb-4"
        style={{
          position: 'absolute', bottom: '10%', left: '10%', width: '45vw', height: '45vw',
          background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
          transform: 'translate(calc(var(--mouse-x) * -50px), calc(var(--mouse-y) * 40px))',
          transition: 'transform 1.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }} 
      />

      <div className="login-container" style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1000px',
        height: '650px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(16, 185, 129, 0.1), 0 20px 40px rgba(0,0,0,0.5)',
        background: `url('/landscape.jpg') center/cover no-repeat`, // Using the landscape image
        position: 'relative',
        zIndex: 10
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
          background: 'rgba(15, 20, 15, 0.65)', // Dark translucent matching the vibe
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
            <h2 style={{ fontSize: '2.25rem', fontWeight: 1000, marginBottom: '0.5rem', color: '#fff', letterSpacing: '-0.4px' }}>
              Wilujeng Sumping.
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail style={{ position: 'absolute', left: '1rem', color: '#9ca3af', width: '20px', height: '20px', transition: 'color 0.3s ease' }} />
                <input
                  type="email"
                  placeholder="Enter your e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    padding: '0.875rem 1.25rem 0.875rem 3rem',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15), inset 0 2px 4px rgba(0,0,0,0.1)';
                    e.target.previousElementSibling.style.color = '#10b981';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                    e.target.previousElementSibling.style.color = '#9ca3af';
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock style={{ position: 'absolute', left: '1rem', color: '#9ca3af', width: '20px', height: '20px', transition: 'color 0.3s ease' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    padding: '0.875rem 3rem 0.875rem 3rem',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                    letterSpacing: (password && !showPassword) ? '0.2em' : 'normal'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15), inset 0 2px 4px rgba(0,0,0,0.1)';
                    e.target.previousElementSibling.style.color = '#10b981';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                    e.target.previousElementSibling.style.color = '#9ca3af';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.3s ease',
                    zIndex: 10
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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
        @keyframes bgCycle {
          0% { background-color: #060b10; }
          33% { background-color: #0a2040; } /* Deep Navy Blue */
          66% { background-color: #08301c; } /* Deep Forest Green */
          100% { background-color: #060b10; }
        }

        .login-bg-animate {
          animation: bgCycle 7s ease-in-out infinite;
        }

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
