export interface Transaction {
    id?: number;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
    category: number;
    category_name?: string;
  }