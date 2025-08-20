export type ModalAddExpenseProps = {
  tripId: number | string;
  participants: { id: number; name: string }[];
  onClose: () => void;
  onExpenseAdded: (expense: any) => void;
};
export type Expense = {
  id: number;
  trip_id: number;
  category: string;
  amount: number;
  description?: string;
  date: string;
  paid_by?: string;
  participants?: { id: number; name: string }[]; // bénéficiaires
};
