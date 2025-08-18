import { useState } from "react";
import "../styles/ModalAddExpense.css";
import { apiFetch } from '../utils/api';

export type ModalAddExpenseProps = {
  tripId: number | string;
  onClose: () => void;
  onExpenseAdded: (expense: any) => void;
};

export default function ModalAddExpense({ tripId, onClose, onExpenseAdded }: ModalAddExpenseProps) {
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: '',
    paid_by: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      setError('Montant, catégorie et date requis');
      return;
    }
    setLoading(true);
    try {
  const res = await apiFetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          amount: form.amount,
          category: form.category,
          description: form.description,
          date: form.date,
          paid_by: form.paid_by
        })
      });
      if (!res.ok) throw new Error('Erreur lors de l\'ajout');
      const newExpense = await res.json();
      onExpenseAdded(newExpense);
      setError('');
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'envoi');
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
            <label>Payé par (optionnel)</label>
            <input
              type="text"
              placeholder="Payé par (optionnel)"
              value={form.paid_by}
              onChange={e => setForm(f => ({ ...f, paid_by: e.target.value }))}
            />
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
