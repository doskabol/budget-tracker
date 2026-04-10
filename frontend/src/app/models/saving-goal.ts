export interface SavingGoal {
    id?: number;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
    progress_percent?: number;
  }