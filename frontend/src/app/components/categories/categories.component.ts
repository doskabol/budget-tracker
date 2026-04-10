import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/category';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  newCategoryName: string = '';
  
  allTransactions: Transaction[] = [];
  selectedCategory: Category | null = null;
  
  categoryIncomeCache: { [key: number]: number } = {};
  categoryExpenseCache: { [key: number]: number } = {};
  categoryTransactionsCache: { [key: number]: Transaction[] } = {};

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getCategories().subscribe(data => {
      this.categories = data;
      this.loadTransactions();
    });
  }

  loadTransactions() {
    this.apiService.getTransactions().subscribe(data => {
      this.allTransactions = data;
      this.calculateCategoryStats();
    });
  }

  calculateCategoryStats() {
    // Очищаем кэш
    this.categoryIncomeCache = {};
    this.categoryExpenseCache = {};
    this.categoryTransactionsCache = {};

    console.log('Все транзакции:', this.allTransactions);

    this.allTransactions.forEach(t => {
      const catId = t.category;
      if (!catId) return;

      // Убеждаемся, что amount — число
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as any);
      if (isNaN(amount)) return;

      // Считаем доходы/расходы
      if (t.type === 'income') {
        const current = this.categoryIncomeCache[catId] || 0;
        this.categoryIncomeCache[catId] = current + amount;
      } else if (t.type === 'expense') {
        const current = this.categoryExpenseCache[catId] || 0;
        this.categoryExpenseCache[catId] = current + amount;
      }

      // Сохраняем транзакции по категориям
      if (!this.categoryTransactionsCache[catId]) {
        this.categoryTransactionsCache[catId] = [];
      }
      this.categoryTransactionsCache[catId].push(t);
    });

    console.log('Кэш доходов:', this.categoryIncomeCache);
    console.log('Кэш расходов:', this.categoryExpenseCache);
  }

  getCategoryIncome(categoryId: number): number {
    const val = this.categoryIncomeCache[categoryId] || 0;
    return Math.round(val * 100) / 100;
  }

  getCategoryExpense(categoryId: number): number {
    const val = this.categoryExpenseCache[categoryId] || 0;
    return Math.round(val * 100) / 100;
  }

  getCategoryBalance(categoryId: number): number {
    const balance = this.getCategoryIncome(categoryId) - this.getCategoryExpense(categoryId);
    return Math.round(balance * 100) / 100;
  }

  getCategoryTransactions(categoryId: number): Transaction[] {
    const transactions = this.categoryTransactionsCache[categoryId] || [];
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addCategory() {
    if (!this.newCategoryName.trim()) {
      alert('Введите название категории');
      return;
    }

    this.apiService.createCategory({ name: this.newCategoryName }).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.loadData();
      },
      error: (err) => {
        console.error('Ошибка:', err);
        alert('Ошибка при создании категории');
      }
    });
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
  }

  closeModal() {
    this.selectedCategory = null;
  }

  logout() {
    this.authService.logout();
  }
}