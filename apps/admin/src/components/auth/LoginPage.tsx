import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple demo password
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      padding: '1.5rem'
    }}>
      <div className={`card animate-slide ${error ? 'animate-shake' : ''}`} style={{ 
        maxWidth: '400px', 
        width: '100%', 
        padding: '2.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <img src="/Logo.png" alt="BidBoss Logo" style={{ height: '48px', width: 'auto' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Staff Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                defaultValue="admin"
                readOnly
                className="card"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', outline: 'none', background: '#f1f5f9' }}
              />
              <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="card"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 2.5rem 0.75rem 2.5rem', 
                  outline: 'none',
                  borderColor: error ? 'var(--status-red)' : 'var(--border-color)',
                  transition: 'border-color 0.2s'
                }}
                autoFocus
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p style={{ color: 'var(--status-red)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>Incorrect password. Please try again.</p>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', background: 'var(--status-teal)', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            Login to Dashboard <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Forgot password? Contact system administrator.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
