export type Expense = {
  id: number;
  trip_id: number;
  category: string;
  amount: number;
  description?: string;
  date: string;
  paid_by?: string;
};
