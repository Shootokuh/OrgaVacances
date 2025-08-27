
import { useState, useEffect } from "react";
import "../styles/ModalEditExpense.css";
import type { Expense } from "../types/expense";
import { apiFetch } from '../utils/api';

export type ModalEditExpenseProps = {
  expense: Expense;
  participants: { id: number; name: string }[];
  onClose: () => void;
  onExpenseUpdated: (expense: Expense) => void;
};

export default function ModalEditExpense({ expense, participants, onClose, onExpenseUpdated }: ModalEditExpenseProps) {
  const [form, setForm] = useState({
    amount: String(expense.amount),
    category: expense.category,
    description: expense.description || '',
    date: expense.date ? expense.date.slice(0, 10) : '',
    paid_by: expense.paid_by || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Initialiser la sélection avec les bénéficiaires de la dépense
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    expense.participants ? expense.participants.map(p => p.id) : participants.map(p => p.id)
  );

  useEffect(() => {
    if (participants && participants.length === 1) {
      setForm(f => ({ ...f, paid_by: participants[0].name }));
    }
  }, [participants]);

  const handleParticipantChange = (id: number) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
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
  const res = await apiFetch(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          amount: form.amount,
          category: form.category,
          description: form.description,
          date: form.date,
          paid_by: form.paid_by,
          participant_ids: selectedParticipants
        })
      });
      if (!res.ok) throw new Error('Erreur lors de la modification');
      const updated = await res.json();
      onExpenseUpdated(updated);
      setError('');
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <h2>Modifier la dépense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Bénéficiaires</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {participants.map(p => (
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
                    {/* Si le payeur n'est plus dans la liste, l'afficher quand même */}
                    {form.paid_by && participants && !participants.some((p: { id: number; name: string }) => p.name === form.paid_by) && (
                      <option value={form.paid_by}>{form.paid_by} (ancien)</option>
                    )}
              </select>
            )}
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>{loading ? 'Modification...' : 'Enregistrer'}</button>
            <button type="button" onClick={onClose} disabled={loading}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
