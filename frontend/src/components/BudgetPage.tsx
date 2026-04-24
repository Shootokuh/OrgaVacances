import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ModalAddExpense from "./ModalAddExpense";
import ModalEditExpense from "./ModalEditExpense";
import "../styles/BudgetPage.css";
import type { Trip } from "../types/trip";
import type { Expense } from "../types/expense";
import { apiFetch } from "../utils/api";
 
type CategoryKey = "Hébergement" | "Transport" | "Restauration" | "Activités" | "Courses" | "Autres";

type CategoryConfig = {
  label: CategoryKey;
  color: string;
  tint: string;
  icon: (className?: string) => JSX.Element;
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

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3.8V6M17 3.8V6M4 9h16M6.2 5h11.6A2.2 2.2 0 0 1 20 7.2v10.6A2.2 2.2 0 0 1 17.8 20H6.2A2.2 2.2 0 0 1 4 17.8V7.2A2.2 2.2 0 0 1 6.2 5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTarget = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4.5a7.5 7.5 0 1 0 7.5 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8a4 4 0 1 0 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m21 3-8.2 8.2M21 3h-4.6M21 3v4.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMoney = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.5 8.5 12 4l8.5 4.5L12 13 3.5 8.5Zm0 0V15.5L12 20l8.5-4.5V8.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconWallet = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v1.5H4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 8.5h16v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9Zm13 4.25h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4.3-4.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconFilter = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5h16l-6.4 7v5.3l-3.2 1.7V12L4 5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.8 19a4.7 4.7 0 0 1 9.4 0M11.8 19a4.7 4.7 0 0 1 9.4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 20 3.8-.8L19 8l-3-3L4.8 16.2 4 20Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDelete = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4.8 7.2h14.4M9.5 10.5v6.5m5 0v-6.5M8.6 7.2l.7-2.2h5.4l.7 2.2M7 7.2l.8 11a2 2 0 0 0 2 1.8h4.4a2 2 0 0 0 2-1.8l.8-11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconArrowDown = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 5 6v5.4c0 4.3 2.8 8.1 7 9.6 4.2-1.5 7-5.3 7-9.6V6l-7-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 6v6h-6M4 18v-6h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.5 9a6 6 0 0 1 10.3-1.9L20 9M16.5 15a6 6 0 0 1-10.3 1.9L4 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CATEGORY_ORDER: CategoryKey[] = ["Hébergement", "Transport", "Restauration", "Activités", "Courses", "Autres"];

export const CATEGORY_CONFIG: Record<CategoryKey, CategoryConfig> = {
  "Hébergement": {
    label: "Hébergement",
    color: "#6274f7",
    tint: "#eef1ff",
    icon: IconHotel
  },
  "Transport": {
    label: "Transport",
    color: "#5fb483",
    tint: "#ebf8f1",
    icon: IconTransport
  },
  "Restauration": {
    label: "Restauration",
    color: "#f2a15f",
    tint: "#fff4ea",
    icon: IconFood
  },
  "Activités": {
    label: "Activités",
    color: "#9877e8",
    tint: "#f2edff",
    icon: IconActivity
  },
  "Courses": {
    label: "Courses",
    color: "#61aab9",
    tint: "#e8f6f8",
    icon: IconGroceries
  },
  "Autres": {
    label: "Autres",
    color: "#8993af",
    tint: "#eef1f7",
    icon: IconBox
  }
};

const AVATAR_COLORS = ["#6f83f7", "#ec9ec9", "#7cc792", "#f1b27d", "#91a4ff", "#84c9d6"];

export function normalizeCategory(category?: string): CategoryKey {
  const value = (category || "").trim().toLowerCase();
  if (value.startsWith("héb") || value.startsWith("heb") || value.includes("hotel")) return "Hébergement";
  if (value.startsWith("transport") || value.startsWith("transports") || value.includes("taxi") || value.includes("vol")) return "Transport";
  if (value.startsWith("restauration") || value.startsWith("restaurant") || value.includes("repas")) return "Restauration";
  if (value.startsWith("activité") || value.startsWith("activite") || value.startsWith("activités") || value.startsWith("activities")) return "Activités";
  if (value.startsWith("course") || value.startsWith("courses")) return "Courses";
  if (value.startsWith("autre") || value.startsWith("other")) return "Autres";
  return "Autres";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

function formatBudgetDraftValue(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function parseBudgetDraftValue(value: string): number {
  const normalized = value
    .replace(/\s/g, "")
    .replace("€", "")
    .replace(",", ".");
  return Number(normalized);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function getAvatarColor(name: string, index = 0): string {
  const safeIndex = Math.abs((name || "").charCodeAt(0) + index) % AVATAR_COLORS.length;
  return AVATAR_COLORS[safeIndex];
}

function getInitial(name: string): string {
  return (name || "?").charAt(0).toUpperCase();
}

function splitDescription(description?: string): { title: string; subtitle: string } {
  if (!description) return { title: "-", subtitle: "" };
  const normalized = description.replace(/\r/g, "");
  if (normalized.includes("\n")) {
    const [title, ...rest] = normalized.split("\n");
    return { title, subtitle: rest.join(" ").trim() };
  }
  const dashParts = normalized.split(" - ");
  if (dashParts.length > 1) {
    return { title: dashParts[0], subtitle: dashParts.slice(1).join(" - ") };
  }
  return { title: normalized, subtitle: "" };
}

export default function BudgetPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [participants, setParticipants] = useState<{ id: number; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [payerFilter, setPayerFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [participantError, setParticipantError] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetError, setBudgetError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/participants/${id}`)
      .then((res) => res.json())
      .then(setParticipants)
      .catch(() => setParticipants([]));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/api/trips`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((t: Trip) => t.id === Number(id));
        setTrip(found);
      })
      .catch(() => setTrip(null));

    apiFetch(`/api/expenses/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch(() => setExpenses([]));
  }, [id]);

  useEffect(() => {
    setBudgetDraft(formatBudgetDraftValue(Number(trip?.budget ?? 0)));
  }, [trip?.budget]);

  const normalizedExpenses = useMemo(
    () => expenses.map((exp) => ({ ...exp, category: normalizeCategory(exp.category) })),
    [expenses]
  );

  const dateOptions = useMemo(
    () => [
      ...new Set(
        normalizedExpenses
          .map((exp) => (exp.date ? new Date(exp.date).toISOString().slice(0, 10) : ""))
          .filter(Boolean)
      )
    ],
    [normalizedExpenses]
  );

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return normalizedExpenses
      .filter((exp) => {
        const matchesSearch =
          query.length === 0 ||
          [exp.description || "", exp.paid_by || "", String(exp.amount), String(exp.category)]
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesCategory = categoryFilter === "all" || exp.category === categoryFilter;
        const matchesPayer = payerFilter === "all" || exp.paid_by === payerFilter;
        const expDate = exp.date ? new Date(exp.date).toISOString().slice(0, 10) : "";
        const matchesDate = dateFilter === "all" || expDate === dateFilter;
        return matchesSearch && matchesCategory && matchesPayer && matchesDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [normalizedExpenses, search, categoryFilter, payerFilter, dateFilter]);

  const totalSpent = useMemo(
    () => normalizedExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
    [normalizedExpenses]
  );
  const remainingBudget = Number(trip?.budget || 0) - totalSpent;

  const categoryTotals = useMemo(() => {
    const totals: Record<CategoryKey, number> = {
      "Hébergement": 0,
      "Transport": 0,
      "Restauration": 0,
      "Activités": 0,
      "Courses": 0,
      "Autres": 0
    };

    normalizedExpenses.forEach((exp) => {
      totals[normalizeCategory(exp.category)] += Number(exp.amount || 0);
    });

    return totals;
  }, [normalizedExpenses]);

  const donutGradient = useMemo(() => {
    if (totalSpent <= 0) return "conic-gradient(#e8ecf4 0% 100%)";

    let cumulative = 0;
    const slices = CATEGORY_ORDER.map((category) => {
      const share = (categoryTotals[category] / totalSpent) * 100;
      const start = cumulative;
      cumulative += share;
      return `${CATEGORY_CONFIG[category].color} ${start}% ${cumulative}%`;
    }).filter((slice) => !slice.includes("NaN"));

    return `conic-gradient(${slices.join(",")})`;
  }, [categoryTotals, totalSpent]);

  const participantBalances = useMemo(() => {
    const paid: Record<string, number> = {};
    const owed: Record<string, number> = {};

    participants.forEach((participant) => {
      paid[participant.name] = 0;
      owed[participant.name] = 0;
    });

    normalizedExpenses.forEach((expense) => {
      const amount = Number(expense.amount || 0);
      if (expense.paid_by && paid[expense.paid_by] !== undefined) {
        paid[expense.paid_by] += amount;
      }

      const beneficiaries = expense.participants && expense.participants.length > 0
        ? expense.participants.map((participant) => participant.name)
        : participants.map((participant) => participant.name);

      if (beneficiaries.length > 0) {
        const share = amount / beneficiaries.length;
        beneficiaries.forEach((beneficiary) => {
          if (owed[beneficiary] !== undefined) owed[beneficiary] += share;
        });
      }
    });

    return participants.map((participant) => {
      const balance = Number((paid[participant.name] - owed[participant.name]).toFixed(2));
      return {
        ...participant,
        paid: paid[participant.name] || 0,
        balance
      };
    });
  }, [participants, normalizedExpenses]);

  const heroImage = trip?.cover_image_url || "https://images.unsplash.com/photo-1598013246507-cb74f95d4f2d?auto=format&fit=crop&w=1400&q=80";

  const addParticipant = async () => {
    const name = participantName.trim();
    if (!name) {
      setParticipantError("Nom requis");
      return;
    }
    if (!id) {
      setParticipantError("Voyage introuvable");
      return;
    }

    setParticipantError("");
    const res = await apiFetch(`/api/participants/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    if (!res.ok) {
      setParticipantError("Erreur lors de l'ajout");
      return;
    }

    const added = await res.json();
    setParticipants((prev) => [...prev, added]);
    setParticipantName("");
    setShowParticipantForm(false);
  };

  const openBudgetEditor = () => {
    setBudgetError("");
    setBudgetDraft(formatBudgetDraftValue(Number(trip?.budget ?? 0)));
    setShowBudgetForm(true);
  };

  const closeBudgetEditor = () => {
    setBudgetError("");
    setBudgetDraft(formatBudgetDraftValue(Number(trip?.budget ?? 0)));
    setShowBudgetForm(false);
  };

  const saveBudget = async () => {
    if (!trip) {
      setBudgetError("Voyage introuvable");
      return;
    }

    const parsed = parseBudgetDraftValue(budgetDraft);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setBudgetError("Budget invalide");
      return;
    }

    if (Number(trip.budget) === parsed) {
      setBudgetError("");
      return;
    }

    setBudgetSaving(true);
    setBudgetError("");
    try {
      const res = await apiFetch(`/api/trips/${trip.id}`, {
        method: "PUT",
        body: JSON.stringify({ budget: parsed })
      });
      if (!res.ok) throw new Error("update error");
      setTrip((prev) => (prev ? { ...prev, budget: parsed } : prev));
      setBudgetDraft(formatBudgetDraftValue(parsed));
      setShowBudgetForm(false);
    } catch {
      setBudgetError("Erreur lors de la mise à jour");
    } finally {
      setBudgetSaving(false);
    }
  };

  return (
    <div className="budget-page">
      <section className="budget-hero-card">
        <div className="budget-hero-content">
          <h1>{trip?.destination || trip?.title || "Voyage"}</h1>
          <p className="budget-hero-dates">
            <span className="metric-icon-wrap">
              <IconCalendar />
            </span>
            {trip?.start_date ? formatDate(trip.start_date) : "-"} – {trip?.end_date ? formatDate(trip.end_date) : "-"}
          </p>

          <div className="budget-hero-metrics" role="list" aria-label="Résumé du budget">
            <div className="budget-metric budget-metric-budget" role="listitem">
              <span className="metric-head budget-head-row">
                <span className="metric-icon-wrap budget-total-icon">
                  <IconTarget />
                </span>
                Budget total
                <button type="button" className="budget-edit-trigger" onClick={openBudgetEditor} title="Modifier le budget">
                  <IconEdit />
                </button>
              </span>
              <div className="budget-edit-display">
                <strong className="budget-value">{formatCurrency(Number(trip?.budget || 0))}</strong>
              </div>

              {showBudgetForm && (
                <div className="budget-mini-form" role="group" aria-label="Modifier le budget total">
                  <div className="budget-edit-input-wrap">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={budgetDraft}
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (/^[\d\s.,€]*$/.test(raw)) {
                          setBudgetDraft(raw);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void saveBudget();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          closeBudgetEditor();
                        }
                      }}
                      disabled={budgetSaving || !trip}
                      autoFocus
                    />
                    <span>€</span>
                  </div>

                  <div className="budget-mini-actions">
                    <button type="button" className="budget-mini-save" onClick={() => void saveBudget()} disabled={budgetSaving || !trip}>
                      {budgetSaving ? "..." : "Valider"}
                    </button>
                    <button type="button" className="budget-mini-cancel" onClick={closeBudgetEditor} disabled={budgetSaving}>
                      Annuler
                    </button>
                  </div>
                  {budgetError && <p className="budget-edit-error">{budgetError}</p>}
                </div>
              )}
            </div>

            <div className="budget-metric" role="listitem">
              <span className="metric-head">
                <span className="metric-icon-wrap budget-spent-icon">
                  <IconMoney />
                </span>
                Déjà dépensé
              </span>
              <strong>{formatCurrency(totalSpent)}</strong>
            </div>

            <div className="budget-metric" role="listitem">
              <span className="metric-head">
                <span className="metric-icon-wrap budget-remaining-icon">
                  <IconWallet />
                </span>
                Reste
              </span>
              <strong className={remainingBudget < 0 ? "negative" : "positive"}>{formatCurrency(remainingBudget)}</strong>
            </div>
          </div>
        </div>

        <div className="budget-hero-image" aria-hidden="true">
          <img src={heroImage} alt="" loading="lazy" />
          <div className="hero-fade" />
        </div>
      </section>

      <section className="budget-summary-grid">
        <article className="budget-card participants-card">
          <div className="participants-card-header">
            <h2>Participants ({participants.length})</h2>
            <button
              type="button"
              className="participants-add-btn"
              onClick={() => {
                setShowParticipantForm((prev) => !prev);
                setParticipantError("");
              }}
            >
              + Ajouter
            </button>
          </div>

          {showParticipantForm && (
            <div className="participants-inline-form">
              <input
                type="text"
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
                placeholder="Nom du participant"
              />
              <button type="button" onClick={addParticipant}>Valider</button>
            </div>
          )}
          {participantError && <p className="participants-inline-error">{participantError}</p>}

          <ul className="participants-list">
            {participantBalances.map((participant, index) => (
              <li className="participant-row" key={participant.id}>
                <div className="participant-left">
                  <span className="participant-avatar" style={{ backgroundColor: getAvatarColor(participant.name, index) }}>
                    {getInitial(participant.name)}
                  </span>
                  <div>
                    <p className="participant-name">{participant.name}</p>
                    <p className="participant-paid">A payé {formatCurrency(participant.paid)}</p>
                  </div>
                </div>
                <div className="participant-balance-wrap">
                  <p className={participant.balance >= 0 ? "participant-balance-positive" : "participant-balance-negative"}>
                    {participant.balance >= 0 ? "+" : ""}
                    {formatCurrency(participant.balance)}
                  </p>
                  <p className="participant-balance-note">{participant.balance >= 0 ? "doit recevoir" : "doit payer"}</p>
                </div>
              </li>
            ))}
          </ul>

          <button type="button" className="subtle-footer-button">
            Voir le détail des soldes
            <IconArrowRight />
          </button>
        </article>

        <article className="budget-card chart-card">
          <h2>Résumé du budget</h2>
          <div className="chart-layout">
            <div className="donut-wrapper">
              <div className="donut-chart" style={{ background: donutGradient }}>
                <div className="donut-center">
                  <strong>{formatCurrency(totalSpent)}</strong>
                  <span>dépensés</span>
                </div>
              </div>
            </div>

            <ul className="category-legend">
              {CATEGORY_ORDER.map((category) => {
                const config = CATEGORY_CONFIG[category];
                const amount = categoryTotals[category];
                const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
                return (
                  <li key={category} className="legend-row">
                    <div className="legend-label-wrap">
                      <span className="legend-dot" style={{ backgroundColor: config.color }} />
                      <span className="category-mini-icon" style={{ backgroundColor: config.tint, color: config.color }}>
                        {config.icon("legend-icon")}
                      </span>
                      <span className="legend-label">{config.label}</span>
                    </div>
                    <strong>{formatCurrency(amount)}</strong>
                    <span>{percent}%</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <button type="button" className="subtle-footer-button">
            <span className="report-icon">
              <IconFilter />
            </span>
            Voir le rapport détaillé
            <IconArrowRight />
          </button>
        </article>
      </section>

      <section className="expenses-section">
        <div className="expenses-controls">
          <label className="control input-control">
            <span className="control-icon">
              <IconSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une dépense..."
            />
          </label>

          <label className="control select-control">
            <span className="control-icon">
              <IconFilter />
            </span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">Catégorie</option>
              {CATEGORY_ORDER.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="control select-control">
            <span className="control-icon">
              <IconUser />
            </span>
            <select value={payerFilter} onChange={(event) => setPayerFilter(event.target.value)}>
              <option value="all">Paiement par</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.name}>
                  {participant.name}
                </option>
              ))}
            </select>
          </label>

          <label className="control select-control">
            <span className="control-icon">
              <IconCalendar />
            </span>
            <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
              <option value="all">Date</option>
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="add-expense-btn" onClick={() => setShowModal(true)}>
            + Ajouter une dépense
          </button>
        </div>

        <h3>Liste des dépenses</h3>

        <div className="table-shell">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Montant</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Date de paiement</th>
                <th>Paiement par</th>
                <th>Bénéficiaires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense, index) => {
                const category = normalizeCategory(expense.category);
                const categoryConfig = CATEGORY_CONFIG[category];
                const description = splitDescription(expense.description);
                const beneficiariesCount = expense.participants?.length || participants.length;
                return (
                  <tr key={expense.id}>
                    <td data-label="Montant" className="amount-cell">{formatCurrency(Number(expense.amount || 0))}</td>
                    <td data-label="Catégorie">
                      <span className="category-chip" style={{ backgroundColor: categoryConfig.tint, color: categoryConfig.color }}>
                        {categoryConfig.icon("category-chip-icon")}
                        {categoryConfig.label}
                      </span>
                    </td>
                    <td data-label="Description">
                      <span className="description-title">{description.title}</span>
                      {description.subtitle && <span className="description-subtitle">{description.subtitle}</span>}
                    </td>
                    <td data-label="Date de paiement" className="date-cell">{formatDate(expense.date)}</td>
                    <td data-label="Paiement par">
                      <span className="paid-by-wrap">
                        <span className="paid-by-avatar" style={{ backgroundColor: getAvatarColor(expense.paid_by || "?", index) }}>
                          {getInitial(expense.paid_by || "?")}
                        </span>
                        <span className="paid-by-name">{expense.paid_by || "-"}</span>
                      </span>
                    </td>
                    <td data-label="Bénéficiaires">
                      <span className="beneficiaries-wrap">
                        <IconUsers />
                        {beneficiariesCount}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        <button type="button" className="action-btn edit" title="Modifier" onClick={() => setEditExpense(expense)}>
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          title="Supprimer"
                          onClick={async () => {
                            await apiFetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
                            setExpenses((prev) => prev.filter((exp) => exp.id !== expense.id));
                          }}
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-expenses-row">Aucune dépense trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button type="button" className="load-more-btn">
          Voir plus de dépenses
          <IconArrowDown />
        </button>
      </section>

      <section className="bottom-info-grid">
        <article className="bottom-info-card">
          <span className="bottom-info-icon">
            <IconShield />
          </span>
          <div>
            <h4>Équité garantie</h4>
            <p>Les dépenses sont automatiquement réparties équitablement entre tous les participants.</p>
          </div>
        </article>
        <article className="bottom-info-card">
          <span className="bottom-info-icon">
            <IconRefresh />
          </span>
          <div>
            <h4>Soldes en temps réel</h4>
            <p>Les soldes sont mis à jour automatiquement à chaque nouvelle dépense.</p>
          </div>
        </article>
        <article className="bottom-info-card">
          <span className="bottom-info-icon">
            <IconWallet />
          </span>
          <div>
            <h4>Données sécurisées</h4>
            <p>Vos données financières sont chiffrées et sécurisées. Personne d&apos;autre n&apos;y a accès.</p>
          </div>
        </article>
      </section>

      {showModal && (
        <ModalAddExpense
          tripId={id as string}
          participants={participants}
          onClose={() => setShowModal(false)}
          onExpenseAdded={(expense: Expense) => {
            setExpenses((prev) => [...prev, expense]);
            setShowModal(false);
          }}
        />
      )}

      {editExpense && (
        <ModalEditExpense
          expense={editExpense}
          participants={participants}
          onClose={() => setEditExpense(null)}
          onExpenseUpdated={(updated) => {
            setExpenses((prev) => prev.map((exp) => (exp.id === updated.id ? updated : exp)));
            setEditExpense(null);
          }}
        />
      )}
      </div>
  );
}
