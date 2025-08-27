

import { useState, useEffect } from "react";
import type { ModalAddExpenseProps } from "../types/expense";
import { apiFetch } from "../utils/api";

export default function ModalAddExpense({ tripId, participants, onClose, onExpenseAdded }: ModalAddExpenseProps) {
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: '',
    paid_by: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Préremplir paid_by si un seul participant
  useEffect(() => {
    if (participants.length === 1) {
      setForm(f => ({ ...f, paid_by: participants[0].name }));
    }
  }, [participants]);

  // Sélection des bénéficiaires
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(participants.map((p: { id: number; name: string }) => p.id));

  const handleParticipantChange = (id: number) => {
    setSelectedParticipants((prev: number[]) =>
      prev.includes(id) ? prev.filter((pid: number) => pid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      setError('Montant, catégorie et date requis');
      return;
    }
    if (selectedParticipants.length === 0) {
      setError('Sélectionnez au moins un bénéficiaire');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:3001/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          trip_id: tripId,
          amount: form.amount,
          category: form.category,
          description: form.description,
          date: form.date,
          paid_by: form.paid_by,
          participant_ids: selectedParticipants
        })
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      const newExpense = await res.json();
      onExpenseAdded(newExpense);
      setError('');
      onClose();
    } catch (err) {
      setError("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ajouter une dépense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Bénéficiaires</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {participants.map((p: { id: number; name: string }) => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(p.id)}
                    onChange={() => handleParticipantChange(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Montant</label>
            <input
              type="number"
              placeholder="Montant"
              value={form.amount}
              min="0"
              step="0.01"
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <input
              type="text"
              placeholder="Catégorie"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Date de paiement</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Description (optionnelle)</label>
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Payé par</label>
            {participants && participants.length <= 1 ? (
              <input
                type="text"
                value={form.paid_by}
                // Sélection des bénéficiaires
                disabled
                style={{ background: '#f5f5f5', color: '#888' }}
              />
            ) : (
              <select
                value={form.paid_by}
                onChange={e => setForm(f => ({ ...f, paid_by: e.target.value }))}
                required
              >
                <option value="">Choisir...</option>
                {participants && participants.map((p: { id: number; name: string }) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>{loading ? 'Ajout...' : 'Ajouter'}</button>
            <button type="button" onClick={onClose} disabled={loading}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
