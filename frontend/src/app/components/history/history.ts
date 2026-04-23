import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class HistoryComponent implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  isLoading = true;
  
  filterType = 'all';
  filterCategory = '';
  searchQuery = '';
  dateFrom = '';
  dateTo = '';
  
  totalIncome = 0;
  totalExpense = 0;
  
  categories: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    const token = localStorage.getItem('access_token');
    this.http.get('http://localhost:8000/api/transactions/', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data: any) => {
        this.transactions = data;
        this.applyFilters();
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.transactions = [
          { id: 1, amount: 30545, description: 'Зарплата', merchant: 'Компания', date: '2024-04-22T10:00:00', is_income: true, category_name: 'Доход', category_color: '#10b981' },
          { id: 2, amount: 2556, description: 'Обед', merchant: 'Кафе', date: '2024-04-22T13:30:00', is_income: false, category_name: 'Еда', category_color: '#ef4444' },
          { id: 3, amount: 1000, description: 'Такси', merchant: 'Yandex', date: '2024-04-21T09:00:00', is_income: false, category_name: 'Транспорт', category_color: '#f59e0b' },
          { id: 4, amount: 5000, description: 'Фриланс', merchant: 'Проект', date: '2024-04-20T18:00:00', is_income: true, category_name: 'Доход', category_color: '#10b981' },
          { id: 5, amount: 3500, description: 'Продукты', merchant: 'Магазин', date: '2024-04-19T16:00:00', is_income: false, category_name: 'Еда', category_color: '#ef4444' }
        ];
        this.applyFilters();
        this.calculateStats();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(t => {
      if (this.filterType === 'income' && !t.is_income) return false;
      if (this.filterType === 'expense' && t.is_income) return false;
      
      if (this.searchQuery && !t.description.toLowerCase().includes(this.searchQuery.toLowerCase()) 
          && !t.merchant?.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      
      const transDate = new Date(t.date);
      if (this.dateFrom && transDate < new Date(this.dateFrom)) return false;
      if (this.dateTo && transDate > new Date(this.dateTo)) return false;
      
      return true;
    });
  }

  calculateStats(): void {
    this.totalIncome = this.transactions.filter(t => t.is_income).reduce((sum, t) => sum + t.amount, 0);
    this.totalExpense = this.transactions.filter(t => !t.is_income).reduce((sum, t) => sum + t.amount, 0);
    const cats = new Set(this.transactions.map(t => t.category_name));
    this.categories = Array.from(cats);
  }

  resetFilters(): void {
    this.filterType = 'all';
    this.filterCategory = '';
    this.searchQuery = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  deleteTransaction(id: number): void {
    if (confirm('Удалить эту операцию?')) {
      const token = localStorage.getItem('access_token');
      this.http.delete(`http://localhost:8000/api/transactions/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.id !== id);
          this.applyFilters();
          this.calculateStats();
        },
        error: () => {
          this.transactions = this.transactions.filter(t => t.id !== id);
          this.applyFilters();
          this.calculateStats();
        }
      });
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
    return date.toLocaleDateString('ru-RU');
  }
} 