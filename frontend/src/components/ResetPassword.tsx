import React, { useState } from 'react';
import '../styles/ResetPassword.css';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirm) {
      setError('Veuillez remplir les deux champs.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!token) {
      setError('Lien invalide ou expiré.');
      return;
    }
    setLoading(true);
    try {
      console.log('Envoi requête reset-password:', { token, password });
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      console.log('Réponse brute:', res);
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Erreur parsing JSON:', jsonErr);
        setError('Erreur parsing JSON');
        return;
      }
      console.log('Réponse JSON:', data);
      if (res.ok) {
        setSuccess('Mot de passe réinitialisé ! Vous pouvez vous connecter.');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.error || 'Erreur serveur');
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Réinitialiser le mot de passe</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          <button type="submit" disabled={loading}>Valider</button>
        </form>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </div>
    </div>
  );
};

export default ResetPassword;
