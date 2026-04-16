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
    deadline: null
  };
  
  // Для добавления/снятия денег
  showMoneyModal: boolean = false;
  selectedGoal: SavingGoal | null = null;
  moneyAmount: number = 0;
  modalType: 'add' | 'withdraw' = 'add';
  modalTitle: string = '';
  
  // Для редактирования цели
  showEditModal: boolean = false;
  editGoalData: SavingGoal = {
    name: '',
    target_amount: 0,
    current_amount: 0,
    deadline: null
  };
  editGoalId: number = 0;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.apiService.getSavingGoals().subscribe({
      next: (data) => {
        this.goals = data;
      },
      error: (err) => console.error('Ошибка загрузки целей:', err)
    });
  }

  // ========== Создание цели ==========
  addGoal() {
    if (!this.newGoal.name || this.newGoal.name.trim() === '') {
      alert('Введите название цели');
      return;
    }
    
    if (this.newGoal.target_amount <= 0) {
      alert('Целевая сумма должна быть больше 0');
      return;
    }

    const goalToSend = {
      name: this.newGoal.name.trim(),
      target_amount: Number(this.newGoal.target_amount).toFixed(2),
      current_amount: 0,
      deadline: this.newGoal.deadline || null
    };

    this.apiService.createSavingGoal(goalToSend as any).subscribe({
      next: () => {
        this.loadGoals();
        this.newGoal = { name: '', target_amount: 0, current_amount: 0, deadline: null };
        alert('Цель добавлена');
      },
      error: (err) => {
        console.error(err);
        alert('Ошибка при создании цели');
      }
    });
  }

  // ========== Удаление цели ==========
  deleteGoal(id: number) {
    if (confirm('Удалить цель?')) {
      this.apiService.deleteSavingGoal(id).subscribe({
        next: () => this.loadGoals(),
        error: (err) => console.error(err)
      });
    }
  }

  // ========== Редактирование цели ==========
  showEditGoalModal(goal: SavingGoal) {
    this.editGoalId = goal.id!;
    this.editGoalData = {
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editGoalData = { name: '', target_amount: 0, current_amount: 0, deadline: null };
    this.editGoalId = 0;
  }

  updateGoal() {
    if (!this.editGoalData.name || this.editGoalData.name.trim() === '') {
      alert('Введите название цели');
      return;
    }
    
    if (this.editGoalData.target_amount <= 0) {
      alert('Целевая сумма должна быть больше 0');
      return;
    }

    const updateData = {
      name: this.editGoalData.name.trim(),
      target_amount: Number(this.editGoalData.target_amount).toFixed(2),
      deadline: this.editGoalData.deadline || null
    };

    this.apiService.updateSavingGoal(this.editGoalId, updateData as any).subscribe({
      next: () => {
        this.loadGoals();
        this.closeEditModal();
        alert('Цель обновлена');
      },
      error: (err) => {
        console.error('Ошибка:', err);
        alert('Ошибка при обновлении цели');
      }
    });
  }

  // ========== Добавление/снятие денег ==========
  showAddMoneyModal(goal: SavingGoal) {
    this.selectedGoal = goal;
    this.modalType = 'add';
    this.modalTitle = '💰 Добавить деньги';
    this.moneyAmount = 0;
    this.showMoneyModal = true;
  }

  showWithdrawMoneyModal(goal: SavingGoal) {
    this.selectedGoal = goal;
    this.modalType = 'withdraw';
    this.modalTitle = '💸 Снять деньги';
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

    const updateData = {
      current_amount: Number(newAmount).toFixed(2)
    };

    this.apiService.updateSavingGoal(this.selectedGoal.id!, updateData as any).subscribe({
      next: () => {
        this.loadGoals();
        this.closeMoneyModal();
        alert(`Сумма ${this.modalType === 'add' ? 'добавлена' : 'снята'}`);
      },
      error: (err) => {
        console.error('Ошибка:', err);
        alert('Ошибка при обновлении суммы');
      }
    });
  }

  getProgressPercent(goal: SavingGoal): number {
    if (goal.target_amount <= 0) return 0;
    const percent = (goal.current_amount / goal.target_amount) * 100;
    return Math.min(100, Math.round(percent));
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'без срока';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  }

  logout() {
    this.authService.logout();
  }
}