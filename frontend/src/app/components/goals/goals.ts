import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './goals.html',
  styleUrls: ['./goals.css']
})
export class GoalsComponent implements OnInit {
  goals: any[] = [];
  isLoading = true;
  
  // Новая цель
  showAddForm = false;
  newGoal = {
    name: '',
    target_amount: 0,
    current_amount: 0,
    deadline: ''
  };
  
  // Статистика
  totalSaved = 0;
  totalTarget = 0;
  activeGoalsCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    const token = localStorage.getItem('access_token');
    this.http.get('http://localhost:8000/api/goals/', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data: any) => {
        this.goals = data;
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        // Демо данные
        this.goals = [
          { id: 1, name: 'Новый ноутбук', target_amount: 300000, current_amount: 150000, deadline: '2024-12-31', progress_percent: 50 },
          { id: 2, name: 'Отпуск', target_amount: 200000, current_amount: 80000, deadline: '2025-06-01', progress_percent: 40 },
          { id: 3, name: 'Подушка безопасности', target_amount: 500000, current_amount: 200000, deadline: '2025-12-31', progress_percent: 40 }
        ];
        this.calculateStats();
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalSaved = this.goals.reduce((sum, g) => sum + g.current_amount, 0);
    this.totalTarget = this.goals.reduce((sum, g) => sum + g.target_amount, 0);
    this.activeGoalsCount = this.goals.length;
  }

  addGoal(): void {
    if (!this.newGoal.name || this.newGoal.target_amount <= 0) {
      alert('Заполните название и сумму цели');
      return;
    }

    const token = localStorage.getItem('access_token');
    this.http.post('http://localhost:8000/api/goals/', this.newGoal, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.loadGoals();
        this.showAddForm = false;
        this.newGoal = { name: '', target_amount: 0, current_amount: 0, deadline: '' };
        alert('✅ Цель добавлена!');
      },
      error: () => {
        // Демо добавление
        this.goals.push({
          id: this.goals.length + 1,
          ...this.newGoal,
          progress_percent: 0,
          current_amount: 0
        });
        this.calculateStats();
        this.showAddForm = false;
        this.newGoal = { name: '', target_amount: 0, current_amount: 0, deadline: '' };
        alert('✅ Цель добавлена (демо режим)');
      }
    });
  }

  addMoney(goal: any): void {
    const amount = prompt(`Сколько хотите добавить к цели "${goal.name}"?`, '10000');
    if (amount && !isNaN(Number(amount))) {
      const newAmount = goal.current_amount + Number(amount);
      
      const token = localStorage.getItem('access_token');
      this.http.put(`http://localhost:8000/api/goals/${goal.id}/`, {
        ...goal,
        current_amount: newAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          goal.current_amount = newAmount;
          goal.progress_percent = Math.floor((newAmount / goal.target_amount) * 100);
          this.calculateStats();
          alert(`✅ Добавлено ${amount} ₸ к цели "${goal.name}"!`);
        },
        error: () => {
          goal.current_amount = newAmount;
          goal.progress_percent = Math.floor((newAmount / goal.target_amount) * 100);
          this.calculateStats();
          alert(`✅ Добавлено ${amount} ₸ (демо режим)`);
        }
      });
    }
  }

  deleteGoal(id: number): void {
    if (confirm('Удалить эту цель?')) {
      const token = localStorage.getItem('access_token');
      this.http.delete(`http://localhost:8000/api/goals/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.goals = this.goals.filter(g => g.id !== id);
          this.calculateStats();
        },
        error: () => {
          this.goals = this.goals.filter(g => g.id !== id);
          this.calculateStats();
        }
      });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Не указана';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  }
}