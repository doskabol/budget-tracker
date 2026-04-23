import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './debts.html',
  styleUrls: ['./debts.css']
})
export class DebtsComponent implements OnInit {
  debts: any[] = [];
  isLoading = true;
  showAddForm = false;
  newDebt = { person_name: '', amount: 0, debt_type: 'owe_me', description: '', due_date: '' };
  totalOweMe = 0;
  totalIOwe = 0;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.hasSubscription()) {
      this.router.navigate(['/premium']);
      return;
    }
    this.loadDebts();
  }

  loadDebts(): void {
    const token = localStorage.getItem('access_token');
    this.http.get('http://localhost:8000/api/debts/', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data: any) => {
        this.debts = data;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: () => {
        this.debts = [];
        this.calculateTotals();
        this.isLoading = false;
      }
    });
  }

  calculateTotals(): void {
    this.totalOweMe = this.debts.filter(d => d.debt_type === 'owe_me' && !d.is_paid).reduce((sum, d) => sum + d.amount, 0);
    this.totalIOwe = this.debts.filter(d => d.debt_type === 'i_owe' && !d.is_paid).reduce((sum, d) => sum + d.amount, 0);
  }

  getOweMeDebts(): any[] { return this.debts.filter(d => d.debt_type === 'owe_me' && !d.is_paid); }
  getIOweDebts(): any[] { return this.debts.filter(d => d.debt_type === 'i_owe' && !d.is_paid); }
  getOweMeCount(): number { return this.getOweMeDebts().length; }
  getIOweCount(): number { return this.getIOweDebts().length; }

  addDebt(): void {
    if (!this.newDebt.person_name || this.newDebt.amount <= 0) {
      alert('Заполните имя и сумму');
      return;
    }
    const token = localStorage.getItem('access_token');
    this.http.post('http://localhost:8000/api/debts/', this.newDebt, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.loadDebts();
        this.showAddForm = false;
        this.newDebt = { person_name: '', amount: 0, debt_type: 'owe_me', description: '', due_date: '' };
        alert('✅ Долг добавлен!');
      },
      error: () => alert('Ошибка при добавлении долга')
    });
  }

  markAsPaid(debt: any): void {
    const token = localStorage.getItem('access_token');
    this.http.put(`http://localhost:8000/api/debts/${debt.id}/`, { ...debt, is_paid: true }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.loadDebts();
        alert(`✅ Долг от ${debt.person_name} отмечен как оплаченный!`);
      },
      error: () => alert('Ошибка при обновлении долга')
    });
  }

  deleteDebt(id: number): void {
    if (confirm('Удалить запись о долге?')) {
      const token = localStorage.getItem('access_token');
      this.http.delete(`http://localhost:8000/api/debts/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => this.loadDebts(),
        error: () => alert('Ошибка при удалении долга')
      });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Не указана';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  }

  getDaysLeft(dueDate: string): number {
    if (!dueDate) return 0;
    const diffTime = new Date(dueDate).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}