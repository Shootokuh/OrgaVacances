import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import '../styles/AuthPortal.css';

// const API_URL = '/api/users'; // Non utilisé

interface AuthPortalProps {
  setToken: (token: string) => void;
}

const AuthPortal: React.FC<AuthPortalProps> = ({ setToken }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  // Mot de passe oublié
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    try {
      const res = await apiFetch('/api/users/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la demande');
      setForgotSuccess('Un email de réinitialisation a été envoyé si le compte existe.');
    } catch (err: any) {
      setError(err.message);
    }
  };

    // Helper pour récupérer le token
  const getToken = () => localStorage.getItem('token');

  const validateEmail = (email: string) => {
    // Simple regex pour vérifier le format email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(loginEmail)) {
      setError('Veuillez entrer un email valide (ex: nom@domaine.com)');
      return;
    }
    try {
      const res = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
      localStorage.setItem('token', data.token); // Stocke le token
      setToken(data.token);
      window.location.href = '/'; // Redirige vers la page d'accueil (TripList)
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(registerEmail)) {
      setError('Veuillez entrer un email valide (ex: nom@domaine.com)');
      return;
    }
    try {
      const res = await apiFetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ email: registerEmail, name: registerName, password: registerPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d\'inscription');
      // Connexion automatique après inscription
      const loginRes = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: registerEmail, password: registerPassword })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || 'Erreur de connexion après inscription');
      localStorage.setItem('token', loginData.token);
      setToken(loginData.token);
      window.location.href = '/'; // Redirige vers la page d'accueil (TripList)
      setError('Inscription et connexion réussies !');
      setTab('login'); // Optionnel
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Au chargement, si un token existe dans localStorage, on le passe à setToken
  React.useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
    }
  }, [setToken]);

  return (
    <div className="auth-portal">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontWeight: 700, fontSize: '2rem', margin: '0 0 8px 0', color: '#1976d2' }}>OrgaVacances</h1>
        <h2 style={{ fontWeight: 600, fontSize: '1.5rem', margin: '0 0 24px 0' }}>
          {tab === 'login' ? 'Se connecter' : tab === 'register' ? 'Inscription' : 'Mot de passe oublié'}
        </h2>
      </div>
      {tab === 'login' && (
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
          <button type="submit" style={{ marginBottom: 8 }}>Continuer</button>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => setTab('forgot')}>Mot de passe oublié ?</span>
          </div>
        </form>
      )}
      {tab === 'register' && (
        <form onSubmit={handleRegister}>
          <input type="email" placeholder="E-mail" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
          <input type="text" placeholder="Nom" value={registerName} onChange={e => setRegisterName(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required />
          <button type="submit" style={{ marginBottom: 8 }}>S'inscrire</button>
        </form>
      )}
      {tab === 'forgot' && (
        <form onSubmit={handleForgot}>
          <input type="email" placeholder="Votre e-mail" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
          <button type="submit" style={{ marginBottom: 8 }}>Envoyer le lien de réinitialisation</button>
        </form>
      )}
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: '1rem', color: '#222' }}>
        {tab === 'login' && (
          <span style={{ cursor: 'pointer' }} onClick={() => setTab('register')}>Ou inscription</span>
        )}
        {tab === 'register' && (
          <span style={{ cursor: 'pointer' }} onClick={() => setTab('login')}>Déjà inscrit ? Se connecter</span>
        )}
        {tab === 'forgot' && (
          <span style={{ cursor: 'pointer' }} onClick={() => setTab('login')}>Retour à la connexion</span>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      {forgotSuccess && <div style={{ color: '#1976d2', marginTop: 16 }}>{forgotSuccess}</div>}
    </div>
  );
};


// Nouveau export avec wrapper centré
const AuthPortalCentered: React.FC<AuthPortalProps> = (props) => (
  <div className="auth-portal-wrapper">
    <AuthPortal {...props} />
  </div>
);

export default AuthPortalCentered;
