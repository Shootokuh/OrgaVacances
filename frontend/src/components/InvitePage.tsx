import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailLink, isSignInWithEmailLink } from "firebase/auth";
import { apiFetch } from "../utils/api";

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("Connexion en cours...");

  useEffect(() => {
    const auth = getAuth();
    const email = searchParams.get("email") || window.localStorage.getItem("emailForSignIn") || "";
    const tripId = searchParams.get("tripId");
    const url = window.location.href;

    if (!isSignInWithEmailLink(auth, url)) {
      setStatus("Lien d'invitation invalide.");
      return;
    }
    if (!email || !tripId) {
      setStatus("Paramètres manquants dans le lien d'invitation.");
      return;
    }

    signInWithEmailLink(auth, email, url)
      .then(async () => {
        window.localStorage.removeItem("emailForSignIn");
        // Récupère le token Firebase après connexion
        const user = auth.currentUser;
        if (!user) {
          setStatus("Erreur : utilisateur non connecté après le lien magique.");
          return;
        }
        const token = await user.getIdToken();
        // Stocke le token pour la session principale
        window.localStorage.setItem('token', token);
        // Appelle le backend pour ajouter l'utilisateur au voyage
        const res = await apiFetch(`/api/trips/${tripId}/share/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setStatus("Vous avez bien rejoint le voyage ! Redirection...");
          setTimeout(() => {
            navigate(`/trip/${tripId}`);
            window.location.reload();
          }, 2000);
        } else {
          const data = await res.json();
          setStatus(data.error || "Erreur lors de l'ajout au voyage.");
        }
      })
      .catch((err) => {
        setStatus("Erreur lors de la connexion : " + err.message);
      });
  }, [searchParams, navigate]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2>Invitation à rejoindre un voyage</h2>
      <p style={{ marginTop: 24 }}>{status}</p>
    </div>
  );
}
