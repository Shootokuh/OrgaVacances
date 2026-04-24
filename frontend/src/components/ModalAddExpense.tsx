import "../styles/ModalAddExpense.css";
import { apiFetch } from '../utils/api';
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { ModalAddExpenseProps } from "../types/expense";

type CategoryKey = "Hébergement" | "Transport" | "Restauration" | "Activités" | "Courses" | "Autres";

type CategoryOption = {
  value: CategoryKey;
  color: string;
  tint: string;
  icon: (className?: string) => ReactNode;
};

const IconHotel = (className = "") => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M4 20V5.75A1.75 1.75 0 0 1 5.75 4h12.5A1.75 1.75 0 0 1 20 5.75V20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 20v-4h8v4M8 8h2m4 0h2m-8 4h2m4 0h2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTransport = (className = "") => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M7 15h10l1.2-3.8A1.5 1.5 0 0 0 16.77 9H7.23a1.5 1.5 0 0 0-1.43 2.2L7 15Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 17h14M8 18.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM9 9l1-2h4l1 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconFood = (className = "") => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M7 4v7m0 0c1.4 0 2.5-1.1 2.5-2.5V4M7 11c-1.4 0-2.5-1.1-2.5-2.5V4M15.5 4v16m0-9h2.3a1 1 0 0 0 .95-1.3l-1.2-4.4A1.8 1.8 0 0 0 15.8 4h-.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconActivity = (className = "") => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="m12 3 2.4 4.86L20 8.7l-4 3.9.95 5.5L12 15.5 7.05 18.1 8 12.6 4 8.7l5.6-.84L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconGroceries = (className = "") => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M4.5 6h15l-1.6 7.2A2 2 0 0 1 16 14.8H8.1a2 2 0 0 1-1.95-1.56L4.5 6Zm2 0-.5-2M9 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconBox = (className = "") => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="m3 8.5 9-5 9 5-9 5-9-5Zm0 0V16l9 5 9-5V8.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3.8V6M17 3.8V6M4 9h16M6.2 5h11.6A2.2 2.2 0 0 1 20 7.2v10.6A2.2 2.2 0 0 1 17.8 20H6.2A2.2 2.2 0 0 1 4 17.8V7.2A2.2 2.2 0 0 1 6.2 5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconInfo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 11v5m0-8h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "Hébergement", color: "#6274f7", tint: "#eef1ff", icon: IconHotel },
  { value: "Transport", color: "#5fb483", tint: "#ebf8f1", icon: IconTransport },
  { value: "Restauration", color: "#f2a15f", tint: "#fff4ea", icon: IconFood },
  { value: "Activités", color: "#9877e8", tint: "#f2edff", icon: IconActivity },
  { value: "Courses", color: "#61aab9", tint: "#e8f6f8", icon: IconGroceries },
  { value: "Autres", color: "#8993af", tint: "#eef1f7", icon: IconBox }
];

const AVATAR_COLORS = ["#6f83f7", "#ec9ec9", "#7cc792", "#f1b27d", "#84c9d6", "#91a4ff"];

const toTodayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getAvatarColor = (name: string, index = 0) => {
  const safeIndex = Math.abs((name || "").charCodeAt(0) + index) % AVATAR_COLORS.length;
  return AVATAR_COLORS[safeIndex];
};

export default function ModalAddExpense({ tripId, participants, onClose, onExpenseAdded }: ModalAddExpenseProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({
    amount: '',
    category: 'Hébergement',
    description: '',
    date: toTodayIso(),
    paid_by: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Préremplir paid_by si un seul participant
  useEffect(() => {
    if (participants.length > 0 && !form.paid_by) {
      setForm(f => ({ ...f, paid_by: participants[0].name }));
    }
  }, [participants, form.paid_by]);

  // Sélection des bénéficiaires
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(participants.map((p: { id: number; name: string }) => p.id));

  const selectedCategory = CATEGORY_OPTIONS.find((option) => option.value === form.category) || CATEGORY_OPTIONS[0];

  const handleParticipantChange = (id: number) => {
    setSelectedParticipants((prev: number[]) =>
      prev.includes(id) ? prev.filter((pid: number) => pid !== id) : [...prev, id]
    );
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
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
  const res = await apiFetch('/api/expenses', {
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
    <div className="add-expense-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="add-expense-modal">
        <div className="add-expense-header">
          <div>
            <h2>Ajouter une dépense</h2>
            <p>Enregistrez une nouvelle dépense pour le voyage</p>
          </div>
          <button type="button" className="close-modal-btn" aria-label="Fermer" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-expense-body">
            <div className="field-group">
              <label htmlFor="add-expense-amount">Montant <span>*</span></label>
              <div className="amount-input-shell">
                <span className="currency">€</span>
                <input
                  id="add-expense-amount"
                  type="number"
                  placeholder="0,00"
                  value={form.amount}
                  min="0"
                  step="0.01"
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="add-expense-category">Catégorie <span>*</span></label>
              <div className="field-shell select-shell">
                <span
                  className="leading-icon category-icon"
                  style={{ color: selectedCategory.color, backgroundColor: selectedCategory.tint }}
                  aria-hidden="true"
                >
                  {selectedCategory.icon("category-svg")}
                </span>
                <select
                  id="add-expense-category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as CategoryKey }))}
                  required
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.value}</option>
                  ))}
                </select>
                <span className="trailing-icon"><IconChevronDown /></span>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="add-expense-date">Date de paiement <span>*</span></label>
              <div className="date-input-wrap">
                <input
                  id="add-expense-date"
                  ref={dateInputRef}
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="date-icon"
                  onClick={openDatePicker}
                  aria-label="Ouvrir le calendrier"
                >
                  <IconCalendar />
                </button>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="add-expense-paid-by">Payé par <span>*</span></label>
              <div className="field-shell select-shell">
                <span className="leading-avatar" style={{ backgroundColor: getAvatarColor(form.paid_by || "?", 0) }}>
                  {(form.paid_by || "?").charAt(0).toUpperCase()}
                </span>
                <select
                  id="add-expense-paid-by"
                  value={form.paid_by}
                  onChange={e => setForm(f => ({ ...f, paid_by: e.target.value }))}
                  required
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <span className="trailing-icon"><IconChevronDown /></span>
              </div>
            </div>

            <div className="field-group full-width">
              <label htmlFor="add-expense-description">Description <em>(optionnelle)</em></label>
              <input
                id="add-expense-description"
                className="base-input"
                type="text"
                placeholder="Ex : Hôtel, restaurant, taxi, activité..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="field-group full-width">
              <label>Bénéficiaires <span>*</span></label>
              <p className="field-helper">Sélectionnez les participants concernés par cette dépense</p>

              <div className="beneficiaries-grid">
                {participants.map((participant, index) => {
                  const checked = selectedParticipants.includes(participant.id);
                  return (
                    <label key={participant.id} className={`beneficiary-card ${checked ? "is-selected" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleParticipantChange(participant.id)}
                      />
                      <span className="beneficiary-main">
                        <span className="beneficiary-avatar" style={{ backgroundColor: getAvatarColor(participant.name, index) }}>
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="beneficiary-text">
                          <strong>{participant.name}</strong>
                          {index === 0 && <small>Vous</small>}
                        </span>
                      </span>
                      <span className={`checkbox-ui ${checked ? "checked" : ""}`} aria-hidden="true">
                        {checked && <IconCheck />}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="beneficiaries-info-box">
                <IconInfo />
                <p>La dépense sera répartie équitablement entre les bénéficiaires sélectionnés.</p>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="add-expense-footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>Annuler</button>
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Ajout...' : 'Ajouter la dépense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
