// Calcule les remboursements optimisés façon Tricount
type Participant = { id: number; name: string };
type Expense = { amount: number | string; paid_by?: string; participants?: { id: number; name: string }[] };
export function computeSettlements(participants: Participant[], expenses: Expense[]) {

  // 1. Calcule ce que chaque participant a payé
  const paid: { [key: string]: number } = {};
  participants.forEach((p: Participant) => { paid[p.name] = 0; });
  expenses.forEach(e => {
    if (e.paid_by && paid[e.paid_by] !== undefined) {
      paid[e.paid_by] += Number(e.amount);
    }
  });

  // 2. Calcule ce que chacun doit (part égale, mais seulement pour les bénéficiaires de chaque dépense)
  const owed: { [key: string]: number } = {};
  participants.forEach((p: Participant) => { owed[p.name] = 0; });
  expenses.forEach(e => {
    const amount = Number(e.amount);
    const benefs: string[] = e.participants && e.participants.length > 0
      ? e.participants.map((p: { id: number; name: string }) => p.name)
      : participants.map((p: Participant) => p.name);
    const part = amount / benefs.length;
    benefs.forEach((name: string) => {
      if (owed[name] !== undefined) owed[name] += part;
    });
  });

  // 3. Solde de chaque participant
  const balances = participants.map(p => ({
    name: p.name,
    balance: +(paid[p.name] - owed[p.name]).toFixed(2)
  }));

  // 4. Sépare créanciers/débiteurs
  let creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  let debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const settlements: { from: string; to: string; amount: number }[] = [];

  // 5. Appariement greedy
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const c = creditors[i];
    const d = debtors[j];
    const amount = Math.min(c.balance, -d.balance);
    settlements.push({ from: d.name, to: c.name, amount: +amount.toFixed(2) });
    c.balance -= amount;
    d.balance += amount;
    if (Math.abs(c.balance) < 0.01) i++;
    if (Math.abs(d.balance) < 0.01) j++;

  return settlements;
  }
  return settlements;
}
