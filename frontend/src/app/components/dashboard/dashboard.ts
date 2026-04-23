import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  balance = 144500;
  totalIncome = 150000;
  totalExpense = 5500;
  
  incomeAmount = 0;
  incomeDate = '';
  incomeDescription = '';
  incomeCategory = '';
  
  expenseAmount = 0;
  expenseDate = '';
  expenseDescription = '';
  expenseCategory = '';
  
  transactions: any[] = [];
  
  incomeCategories = ['Зарплата', 'Фриланс', 'Подарок', 'Возврат долга'];
  expenseCategories = ['Еда', 'Транспорт', 'Развлечения', 'Подарки', 'Услуги', 'Аптека', 'Дети'];
  
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      { data: [], label: 'Доходы', backgroundColor: 'rgba(16,185,129,0.2)', borderColor: '#10b981', borderWidth: 2, tension: 0.4, fill: true },
      { data: [], label: 'Расходы', backgroundColor: 'rgba(239,68,68,0.2)', borderColor: '#ef4444', borderWidth: 2, tension: 0.4, fill: true }
    ],
    labels: []
  };
  
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };
  
  public lineChartType: ChartType = 'line';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.incomeDate = today;
    this.expenseDate = today;
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage(): void {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      this.transactions = JSON.parse(saved);
      this.updateStats();
      if (this.authService.hasSubscription()) this.updateChart();
    }
  }

  updateStats(): void {
    this.totalIncome = this.transactions.filter(t => t.is_income).reduce((s, t) => s + t.amount, 0);
    this.totalExpense = this.transactions.filter(t => !t.is_income).reduce((s, t) => s + t.amount, 0);
    this.balance = this.totalIncome - this.totalExpense;
    this.saveToLocalStorage();
  }

  updateChart(): void {
    const last7Days = this.getLast7Days();
    const incomeData: number[] = [];
    const expenseData: number[] = [];
    
    last7Days.forEach(day => {
      let inc = 0, exp = 0;
      this.transactions.forEach(t => {
        if (new Date(t.date).toISOString().split('T')[0] === day) {
          t.is_income ? inc += t.amount : exp += t.amount;
        }
      });
      incomeData.push(inc);
      expenseData.push(exp);
    });
    
    this.lineChartData = {
      datasets: [
        { ...this.lineChartData.datasets[0], data: incomeData },
        { ...this.lineChartData.datasets[1], data: expenseData }
      ],
      labels: last7Days.map((_, i) => ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i])
    };
  }

  getLast7Days(): string[] {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }

  saveToLocalStorage(): void {
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
    localStorage.setItem('balance', this.balance.toString());
    localStorage.setItem('totalIncome', this.totalIncome.toString());
    localStorage.setItem('totalExpense', this.totalExpense.toString());
  }

  addIncome(): void {
    if (this.incomeAmount <= 0) { alert('Введите сумму'); return; }
    this.transactions.unshift({
      id: Date.now(),
      amount: this.incomeAmount,
      date: this.incomeDate,
      description: this.incomeDescription || 'Доход',
      category: this.incomeCategory,
      is_income: true
    });
    this.updateStats();
    if (this.authService.hasSubscription()) this.updateChart();
    this.incomeAmount = 0;
    this.incomeDescription = '';
    this.incomeCategory = '';
    alert('✅ Доход добавлен!');
  }

  addExpense(): void {
    if (this.expenseAmount <= 0) { alert('Введите сумму'); return; }
    this.transactions.unshift({
      id: Date.now(),
      amount: this.expenseAmount,
      date: this.expenseDate,
      description: this.expenseDescription || 'Расход',
      category: this.expenseCategory,
      is_income: false
    });
    this.updateStats();
    if (this.authService.hasSubscription()) this.updateChart();
    this.expenseAmount = 0;
    this.expenseDescription = '';
    this.expenseCategory = '';
    alert('✅ Расход добавлен!');
  }
}