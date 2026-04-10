import React, { useState } from 'react';
import '../styles/AuthPortal.css';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { apiFetch } from "../utils/api";
import { auth } from "../utils/firebase";

interface AuthPortalProps {
  setToken: (token: string) => void;
}

const AuthPortal: React.FC<AuthPortalProps> = ({ setToken }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const validateEmail = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      localStorage.setItem('token', token);
      setToken(token);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      localStorage.setItem('token', token);
      setToken(token);
      // create profile in backend
      await apiFetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email, name })
      });
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem('token', token);
      setToken(token);
      // ensure backend user exists
      await apiFetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: result.user.email, name: result.user.displayName, google_id: result.user.providerData?.[0]?.uid || null })
      });
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    }
  };

  const handleForgot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setInfo('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo('If an account exists, a reset email was sent.');
    } catch (err: any) {
      setError(err?.message || 'Reset failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" role="main">
        <div className="left-panel">
          <div className="left-inner">
            <div className="brand">PlanMyTrip</div>
            <div className="hero">
              <h1 className="hero-title">Plan your journeys. Simply.</h1>
              <p className="hero-sub">Organize your trips, track your budget,
                <br />and enjoy every moment.</p>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div className="form-wrapper">
            {mode === 'login' && (
              <>
                <h2 className="form-title">Welcome back</h2>
                <p className="form-sub">Sign in to continue</p>
                <form onSubmit={handleLogin}>
                  <div className="fields">
                    <label className="field">
                      <span className="icon" aria-hidden>
                        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 2.5C1 1.6716 1.6716 1 2.5 1H15.5C16.3284 1 17 1.6716 17 2.5V11.5C17 12.3284 16.3284 13 15.5 13H2.5C1.6716 13 1 12.3284 1 11.5V2.5Z" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 3L9 8L16 3" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                    </label>

                    <label className="field">
                      <span className="icon" aria-hidden>
                        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="8" width="12" height="8" rx="1" stroke="#7C8398" strokeWidth="1.2"/>
                          <path d="M4 8V6C4 3.79086 5.79086 2 8 2C10.2091 2 12 3.79086 12 6V8" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    </label>
                  </div>

                  <div style={{display:'flex',justifyContent:'flex-end'}}>
                    <button type="button" className="forgot" onClick={() => { setMode('forgot'); setInfo(''); setError(''); }}>Forgot password?</button>
                  </div>

                  <button className="btn-primary" type="submit">Sign In</button>
                </form>

                <div className="divider">
                  <span className="line" />
                  <span className="or">OR</span>
                  <span className="line" />
                </div>

                <button className="btn-google" type="button" onClick={handleGoogle}>
                  <span className="g-icon" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.6 11.25c0-.7-.06-1.37-.18-2.02H11v3.83h5.86c-.25 1.34-1 2.48-2.13 3.24v2.7h3.44c2.02-1.86 3.2-4.6 3.2-7.75z" fill="#4285F4"/>
                      <path d="M11 21.9c2.88 0 5.3-.95 7.07-2.58l-3.44-2.70c-.95.64-2.16 1.02-3.63 1.02-2.8 0-5.17-1.89-6.02-4.43H1.39v2.78C3.19 19.76 6.83 21.9 11 21.9z" fill="#34A853"/>
                      <path d="M4.98 13.2a6.58 6.58 0 010-4.4V6h-3.6A10.98 10.98 0 000 11c0 1.77.42 3.44 1.17 4.97l3.81-2.77z" fill="#FBBC05"/>
                      <path d="M11 4.38c1.56 0 2.96.54 4.07 1.6l3.05-3.05C16.29 1.1 13.88 0 11 0 6.83 0 3.19 2.14 1.39 5.22l3.81 2.78C5.83 6.27 8.2 4.38 11 4.38z" fill="#EA4335"/>
                    </svg>
                  </span>
                  <span className="g-text">Sign in with Google</span>
                </button>

                <div className="bottom-divider" />

                <p className="signup">Don't have an account? <button className="link-button" onClick={() => { setMode('register'); setError(''); setInfo(''); }}>Sign up</button></p>
              </>
            )}

            {mode === 'register' && (
              <>
                <h2 className="form-title">Create account</h2>
                <p className="form-sub">Sign up to get started</p>
                <form onSubmit={handleRegister}>
                  <div className="fields">
                    <label className="field">
                      <span className="icon" aria-hidden>
                        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 2.5C1 1.6716 1.6716 1 2.5 1H15.5C16.3284 1 17 1.6716 17 2.5V11.5C17 12.3284 16.3284 13 15.5 13H2.5C1.6716 13 1 12.3284 1 11.5V2.5Z" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 3L9 8L16 3" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                    </label>

                    <label className="field">
                      <span className="icon" aria-hidden>
                        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="8" width="12" height="8" rx="1" stroke="#7C8398" strokeWidth="1.2"/>
                          <path d="M4 8V6C4 3.79086 5.79086 2 8 2C10.2091 2 12 3.79086 12 6V8" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    </label>

                    <label className="field">
                      <span className="icon" aria-hidden>
                        {/* user icon placeholder */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12c2.7614 0 5-2.2386 5-5s-2.2386-5-5-5-5 2.2386-5 5 2.2386 5 5 5z" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 20c0-3.866 3.134-7 7-7h4c3.866 0 7 3.134 7 7" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <input className="input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                    </label>
                  </div>

                  <div style={{display:'flex',justifyContent:'flex-end'}}>
                    <button type="button" className="forgot" onClick={() => setMode('login')}>Back to login</button>
                  </div>

                  <button className="btn-primary" type="submit">Create account</button>
                </form>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <h2 className="form-title">Reset password</h2>
                <p className="form-sub">Enter your email to receive reset instructions</p>
                <form onSubmit={handleForgot}>
                  <div className="fields">
                    <label className="field">
                      <span className="icon" aria-hidden>
                        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 2.5C1 1.6716 1.6716 1 2.5 1H15.5C16.3284 1 17 1.6716 17 2.5V11.5C17 12.3284 16.3284 13 15.5 13H2.5C1.6716 13 1 12.3284 1 11.5V2.5Z" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 3L9 8L16 3" stroke="#7C8398" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                    </label>
                  </div>

                  <div style={{display:'flex',justifyContent:'flex-end'}}>
                    <button type="button" className="forgot" onClick={() => setMode('login')}>Back to login</button>
                  </div>

                  <button className="btn-primary" type="submit">Send reset email</button>
                </form>
              </>
            )}

            {error && <div className="error" style={{marginTop:16}}>{error}</div>}
            {info && <div className="info" style={{marginTop:16,color:'#2d6df6'}}>{info}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthPortalCentered: React.FC<AuthPortalProps> = (props) => (
  <div className="auth-portal-wrapper">
    <AuthPortal {...props} />
  </div>
);

export default AuthPortalCentered;
