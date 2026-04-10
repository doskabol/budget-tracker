import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SavingGoal } from '../../models/saving-goal';

@Component({
  selector: 'app-saving-goals',
  templateUrl: './saving-goals.component.html',
  styleUrls: ['./saving-goals.component.css']
})
export class SavingGoalsComponent implements OnInit {
  goals: SavingGoal[] = [];
  
  newGoal: SavingGoal = {
    name: '',
    target_amount: 0,
    current_amount: 0,
    deadline: '',
    progress_percent: 0
  };
  
  // Модальное окно для добавления/снятия денег
  showMoneyModal: boolean = false;
  selectedGoal: SavingGoal | null = null;
  moneyAmount: number = 0;
  modalType: 'add' | 'withdraw' = 'add';
  
  modalTitle: string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.apiService.getSavingGoals().subscribe(data => {
      this.goals = data;
    });
  }

  addGoal() {
    if (!this.newGoal.name || this.newGoal.target_amount <= 0) {
      alert('Заполните название и целевую сумму');
      return;
    }

    this.apiService.createSavingGoal(this.newGoal).subscribe({
      next: () => {
        this.loadGoals();
        this.newGoal = { name: '', target_amount: 0, current_amount: 0, deadline: '', progress_percent: 0 };
        alert('Цель добавлена');
      },
      error: (err) => {
        console.error('Ошибка:', err);
        alert('Ошибка при создании цели');
      }
    });
  }

  deleteGoal(id: number) {
    if (confirm('Удалить цель?')) {
      this.apiService.deleteSavingGoal(id).subscribe({
        next: () => this.loadGoals(),
        error: (err) => console.error('Ошибка удаления:', err)
      });
    }
  }

  showAddMoneyModal(goal: SavingGoal) {
    this.selectedGoal = goal;
    this.modalType = 'add';
    this.modalTitle = '💰 Добавить деньги на цель';
    this.moneyAmount = 0;
    this.showMoneyModal = true;
  }

  showWithdrawMoneyModal(goal: SavingGoal) {
    this.selectedGoal = goal;
    this.modalType = 'withdraw';
    this.modalTitle = '💸 Снять деньги с цели';
    this.moneyAmount = 0;
    this.showMoneyModal = true;
  }

  closeMoneyModal() {
    this.showMoneyModal = false;
    this.selectedGoal = null;
    this.moneyAmount = 0;
  }

  updateGoalMoney() {
    if (!this.selectedGoal) return;
    if (this.moneyAmount <= 0) {
      alert('Введите сумму больше 0');
      return;
    }

    let newAmount = this.selectedGoal.current_amount;
    
    if (this.modalType === 'add') {
      newAmount += this.moneyAmount;
    } else {
      if (this.moneyAmount > this.selectedGoal.current_amount) {
        alert('Нельзя снять больше, чем есть на цели');
        return;
      }
      newAmount -= this.moneyAmount;
    }

    const updatedGoal = {
      ...this.selectedGoal,
      current_amount: newAmount
    };

    // Используем update (нужно добавить метод в api.service.ts)
    this.apiService.updateSavingGoal(this.selectedGoal.id!, updatedGoal).subscribe({
      next: () => {
        this.loadGoals();
        this.closeMoneyModal();
        alert(`Сумма ${this.modalType === 'add' ? 'добавлена' : 'снята'}`);
      },
      error: (err) => {
        console.error('Ошибка:', err);
        alert('Ошибка при обновлении цели');
      }
    });
  }

  getProgressPercent(goal: SavingGoal): number {
    if (goal.target_amount <= 0) return 0;
    const percent = (goal.current_amount / goal.target_amount) * 100;
    return Math.min(100, Math.round(percent));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  }

  logout() {
    this.authService.logout();
  }
}