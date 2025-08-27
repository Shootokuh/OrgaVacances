import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useParams } from "react-router-dom";
import "../styles/CheckList.css";
import type { Task } from "../types/checklist";

export default function CheckList({ destination, startDate, endDate }: { destination: string; startDate: string; endDate: string }) {
  const { id: tripId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Charger la checklist depuis le backend
  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    apiFetch(`http://localhost:3001/api/checklist/trip/${tripId}`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [tripId]);

  // Ajouter une tâche
  const handleAddTask = async () => {
    if (newTask.trim() === "") return;
    setLoading(true);
    try {
      const res = await apiFetch(`http://localhost:3001/api/checklist/trip/${tripId}`, {
        method: "POST",
        body: JSON.stringify({ title: newTask })
      });
      if (!res.ok) throw new Error();
      const item = await res.json();
      setTasks(tasks => [...tasks, item]);
      setNewTask("");
      setShowInput(false);
      setError("");
    } catch {
      setError("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  // Cocher/décocher une tâche
  const handleToggle = async (id: number, checked: boolean) => {
    setLoading(true);
    try {
      const res = await apiFetch(`http://localhost:3001/api/checklist/${id}`, {
        method: "PUT",
        body: JSON.stringify({ is_checked: !checked })
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTasks(tasks => tasks.map(t => t.id === id ? updated : t));
      setError("");
    } catch {
      setError("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checklist-card">
      <div className="checklist-header">
        <h1 className="checklist-title">Check-list</h1>
        <h2 className="checklist-destination">{destination}</h2>
        <div className="checklist-dates">{startDate} – {endDate}</div>
      </div>
      <ul className="checklist-list">
        {loading ? (
          <li style={{ color: '#888', textAlign: 'center' }}>Chargement...</li>
        ) : tasks.length === 0 ? (
          <li style={{ color: '#aaa', textAlign: 'center', fontStyle: 'italic' }}>Aucune tâche</li>
        ) : (
          tasks.map(task => (
            <li key={task.id} className="checklist-item">
              <label className="checklist-label">
                <input
                  type="checkbox"
                  checked={task.is_checked}
                  onChange={() => handleToggle(task.id, task.is_checked)}
                  className="checklist-checkbox"
                  disabled={loading}
                />
                <span className={task.is_checked ? "checklist-text done" : "checklist-text"}>{task.title}</span>
              </label>
            </li>
          ))
        )}
      </ul>
      {showInput ? (
        <div className="checklist-add-row">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="checklist-add-input"
            placeholder="Nouvelle tâche..."
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleAddTask(); }}
            disabled={loading}
          />
          <button
            className="checklist-add-btn"
            onClick={handleAddTask}
            disabled={loading}
            tabIndex={0}
          >Ajouter</button>
          <button
            className="checklist-add-btn"
            onClick={() => { setShowInput(false); setNewTask(""); }}
            disabled={loading}
            tabIndex={0}
            style={{ marginLeft: 8 }}
          >Annuler</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="checklist-main-btn" onClick={() => setShowInput(true)} disabled={loading}>
            + Ajouter une tâche
          </button>
        </div>
      )}
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
