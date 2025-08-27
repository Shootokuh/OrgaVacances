import React, { useState } from 'react';
import '../styles/AuthPortal.css';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utils/firebase";

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

  // Helper pour récupérer le token
  const getToken = () => localStorage.getItem('token');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Connexion email/mot de passe via Firebase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(loginEmail)) {
      setError('Veuillez entrer un email valide (ex: nom@domaine.com)');
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const token = await userCred.user.getIdToken();
      localStorage.setItem('token', token);
      setToken(token);
    // window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Inscription email/mot de passe via Firebase
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(registerEmail)) {
      setError('Veuillez entrer un email valide (ex: nom@domaine.com)');
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      const token = await userCred.user.getIdToken();
      localStorage.setItem('token', token);
      setToken(token);
      // Appel à l'API backend pour créer le profil utilisateur
      await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: registerEmail, name: registerName })
      });
    // window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Connexion Google via Firebase
  const handleGoogleLogin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);
      setToken(token);
      // Enregistre l'utilisateur dans la base si nouveau (ou met à jour le nom)
      await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: result.user.email,
          name: result.user.displayName,
          google_id: result.user.providerData?.[0]?.uid || null
        })
      });
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion Google");
    }
  };

  // Mot de passe oublié via Firebase
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSuccess('Un email de réinitialisation a été envoyé si le compte existe.');
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
          <input type="email" placeholder="E-mail" value={loginEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={loginPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)} required />
          <button type="submit" style={{ marginBottom: 8 }}>Continuer</button>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => setTab('forgot')}>Mot de passe oublié ?</span>
          </div>
          <button type="button" onClick={handleGoogleLogin} style={{ marginTop: 12, background: "#fff", color: "#222", border: "1px solid #ccc", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}>
            Se connecter avec Google
          </button>
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
