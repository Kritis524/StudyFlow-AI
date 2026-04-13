import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }
      
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: 'var(--background)', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top center, rgba(99, 102, 241, 0.15), transparent 60%)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: 'var(--primary)', filter: 'blur(50px)', opacity: 0.5 }}></div>
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 100, height: 100, background: 'var(--secondary)', filter: 'blur(50px)', opacity: 0.3 }}></div>

        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '12px', borderRadius: '16px' }}>
              <BrainCircuit size={32} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>Welcome to StudyFlow</h1>
          <p style={{ color: 'var(--text-muted)' }}>{isLogin ? 'Sign in to continue your learning journey' : 'Create an account to supercharge your studies'}</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1 }}>
          {!isLogin && (
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" name="name" required placeholder="John Doe"
                  value={formData.name} onChange={handleChange}
                  style={{ width: '100%', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px 12px 48px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" name="email" required placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                style={{ width: '100%', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px 12px 48px', color: 'white', outline: 'none' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" name="password" required placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                style={{ width: '100%', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px 12px 48px', color: 'white', outline: 'none' }}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '8px', height: '48px' }}>
            {isLoading ? <Loader2 className="loader" size={20} /> : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', zIndex: 1, marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
