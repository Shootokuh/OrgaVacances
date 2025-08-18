import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ModalAddExpense from "./ModalAddExpense";
import ModalEditExpense from "./ModalEditExpense";
import "../styles/BudgetPage.css";
import type { Trip } from "../types/trip";
import type { Expense } from "../types/expense";
import { apiFetch } from "../utils/api";


export default function BudgetPage() {
  const { id } = useParams(); // tripId depuis l'URL
  const [trip, setTrip] = useState<Trip | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [budgetError, setBudgetError] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense|null>(null);

  useEffect(() => {
    if (!id) return;

  apiFetch(`/api/trips`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((t: Trip) => t.id === Number(id));
        setTrip(found);
      });

  apiFetch(`/api/expenses/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setExpenses(data));
  }, [id]);

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingBudget = trip ? trip.budget - totalSpent : 0;

  // Trie les dépenses par date croissante (plus ancienne en haut)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <div className="budget-page-container">
        <h1>Suivi du budget</h1>
        {trip && (
          <>
            <h2>{trip.destination}</h2>
            <p>📆 {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}</p>
            <p>
              🎯 Budget total : 
              {editingBudget ? (
                <>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={budgetInput}
                    autoFocus
                    style={{ width: 100, fontWeight: 700, fontSize: '1rem', marginLeft: 8, marginRight: 4 }}
                    onChange={e => {
                      // N'accepte que les entiers >= 0
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setBudgetInput(val);
                      }
                    }}
                    onBlur={async () => {
                      if (budgetInput === "" || isNaN(Number(budgetInput)) || !Number.isInteger(Number(budgetInput))) {
                        setBudgetError("Montant invalide (entier uniquement)");
                        return;
                      }
                      setBudgetError("");
                      setEditingBudget(false);
                      if (Number(budgetInput) !== trip.budget) {
                        const res = await fetch(`http://localhost:3001/api/trips/${trip.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ budget: Number(budgetInput) })
                        });
                        if (res.ok) {
                          setTrip({ ...trip, budget: Number(budgetInput) });
                        } else {
                          setBudgetError("Erreur lors de la mise à jour");
                        }
                      }
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      } else if (e.key === "Escape") {
                        setEditingBudget(false);
                        setBudgetError("");
                      }
                    }}
                  />
                  €
                  {budgetError && <span style={{ color: 'red', marginLeft: 8 }}>{budgetError}</span>}
                </>
              ) : (
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <strong
                    style={{ cursor: "pointer", background: 'none', border: 'none', fontWeight: 700, fontSize: '1rem', padding: 0 }}
                    title="Modifier le budget"
                    onClick={() => {
                      setEditingBudget(true);
                      setBudgetInput(String(trip.budget));
                    }}
                  >
                    {trip.budget} €
                  </strong>
                  <span
                    style={{
                      marginLeft: 6,
                      color: '#888',
                      fontSize: 18,
                      cursor: 'pointer',
                      opacity: 0.5,
                      transition: 'opacity 0.2s',
                      position: 'relative',
                      top: 1,
                      display: 'inline-block',
                    }}
                    title="Modifier le budget"
                    onClick={() => {
                      setEditingBudget(true);
                      setBudgetInput(String(trip.budget));
                    }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '0.5')}
                  >
                    ✏️
                  </span>
                </span>
              )}
            </p>
            <p>💸 Déjà dépensé : <strong>{totalSpent} €</strong></p>
            <p>💼 Reste : <strong style={{ color: remainingBudget < 0 ? "red" : "green" }}>{remainingBudget} €</strong></p>
          </>
        )}

        <h3 style={{ marginTop: "2rem" }}>Liste des dépenses</h3>
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Montant</th>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Date de paiement</th>
              <th>Paiement par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.amount} €</td>
                <td>{exp.category}</td>
                <td>{exp.description || "-"}</td>
                <td>{new Date(exp.date).toLocaleDateString()}</td>
                <td>{exp.paid_by || "-"}</td>
                <td style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button
                    title="Modifier"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                    onClick={() => setEditExpense(exp)}
                  >✏️</button>
                  <button
                    title="Supprimer"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                    onClick={async () => {
                      await fetch(`http://localhost:3001/api/expenses/${exp.id}`, { method: 'DELETE' });
                      setExpenses((prev) => prev.filter(e => e.id !== exp.id));
                    }}
                  >🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-expense-btn" onClick={() => setShowModal(true)}>+ Ajouter une dépense</button>
        {showModal && (
          <ModalAddExpense
            tripId={id as string}
            onClose={() => setShowModal(false)}
            onExpenseAdded={(expense) => {
              setExpenses((prev) => [...prev, expense]);
              setShowModal(false);
            }}
          />
        )}
        {editExpense && (
          <ModalEditExpense
            expense={editExpense}
            onClose={() => setEditExpense(null)}
            onExpenseUpdated={(updated) => {
              setExpenses((prev) => prev.map(e => e.id === updated.id ? updated : e));
              setEditExpense(null);
            }}
          />
        )}
      </div>
    </>
  );
}
