
import React, { useState } from "react";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import "../styles/ModalShareTrip.css";

interface ModalShareTripProps {
  tripId: number;
  onClose: () => void;
}

export default function ModalShareTrip({ tripId, onClose }: ModalShareTripProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const auth = getAuth();
    const actionCodeSettings = {
      // L'URL de redirection après clic sur le lien (adapter selon ton app)
      url: window.location.origin + "/invite?tripId=" + tripId + "&email=" + encodeURIComponent(email),
      handleCodeInApp: true,
    };
    try {
      // Envoie le lien magique Firebase
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Optionnel : tu peux stocker l'email dans le localStorage pour pré-remplir à l'arrivée
      window.localStorage.setItem('emailForSignIn', email);
      setStatus("Invitation envoyée ! L'utilisateur recevra un email pour rejoindre le voyage.");
      setEmail("");
      // Tu peux aussi appeler ton backend pour logguer l'invitation si besoin
      // await apiFetch(`/api/trips/${tripId}/share`, { ... })
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setStatus("Email invalide");
      } else {
        setStatus("Erreur lors de l'envoi de l'invitation");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Partager ce voyage</h2>
        <p style={{ color: '#6b7280', fontSize: '0.98rem', marginBottom: 12 }}>
          <b>Important :</b> l'invité doit déjà avoir un compte utilisateur pour pouvoir accéder au voyage.
        </p>
        <form onSubmit={handleShare}>
          <input
            type="email"
            placeholder="Email de l'invité"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <button type="submit" disabled={loading} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Envoi..." : "Partager"}
          </button>
        </form>
        {status && <p style={{ marginTop: 10 }}>{status}</p>}
        <button onClick={onClose} style={{ marginTop: 16, background: "#eee", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer" }}>Fermer</button>
      </div>
    </div>
  );
}
