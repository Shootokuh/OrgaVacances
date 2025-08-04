import { useState } from "react";
import "../styles/ModalEditExpense.css";
import type { Expense } from "../types/expense";

export type ModalEditExpenseProps = {
  expense: Expense;
  onClose: () => void;
  onExpenseUpdated: (expense: Expense) => void;
};

export default function ModalEditExpense({ expense, onClose, onExpenseUpdated }: ModalEditExpenseProps) {
  const [form, setForm] = useState({
    amount: String(expense.amount),
    category: expense.category,
    description: expense.description || '',
    date: expense.date ? expense.date.slice(0, 10) : '',
    paid_by: expense.paid_by || ''
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
      const res = await fetch(`http://localhost:3001/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: form.amount,
          category: form.category,
          description: form.description,
          date: form.date,
          paid_by: form.paid_by
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
            <button type="submit" disabled={loading}>{loading ? 'Modification...' : 'Enregistrer'}</button>
            <button type="button" onClick={onClose} disabled={loading}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
