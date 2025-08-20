
import { useState } from "react";
import { apiFetch } from "../utils/api";
import "../styles/ParticipantsManager.css";

type ParticipantsManagerProps = {
  tripId: string;
  participants: { id: number; name: string }[];
  setParticipants: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>;
};

export default function ParticipantsManager({ tripId, participants, setParticipants }: ParticipantsManagerProps) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  const addParticipant = async () => {
    if (!newName.trim()) {
      setError("Nom requis");
      return;
    }
    setError("");
    const res = await apiFetch(`/api/participants/${tripId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });
    if (res.ok) {
      const added = await res.json();
      setParticipants((prev) => [...prev, added]);
      setNewName("");
    } else {
      setError("Erreur lors de l'ajout");
    }
  };

  const deleteParticipant = async (id: number) => {
    const res = await apiFetch(`/api/participants/one/${id}`, { method: "DELETE" });
    if (res.ok) {
      setParticipants((prev) => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="participants-manager">
      <h3>Participants</h3>
      <ul className="participants-list">
        {participants.map(p => (
          <li key={p.id}>
            <span>{p.name}</span>
            <button onClick={() => deleteParticipant(p.id)}>🗑️</button>
          </li>
        ))}
      </ul>
      <div className="participants-add-row">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nom du participant"
        />
        <button onClick={addParticipant}>Ajouter</button>
      </div>
      {error && <div className="participants-error">{error}</div>}
    </div>
  );
}
