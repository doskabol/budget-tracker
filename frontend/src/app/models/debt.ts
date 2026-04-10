export interface Debt {
    id?: number;
    name: string;
    amount: number;
    direction: 'i_owe' | 'owe_me';
    due_date: string;
    is_paid: boolean;
  }