import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../models/transaction';
import { Category } from '../../models/category';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  showForm = false;
  newTransaction: Transaction = {
    amount: 0,
    type: 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 0
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getTransactions().subscribe(data => this.transactions = data);
    this.apiService.getCategories().subscribe(data => this.categories = data);
  }

  saveTransaction() {
    this.apiService.createTransaction(this.newTransaction).subscribe(() => {
      this.loadData();
      this.showForm = false;
      this.newTransaction = {
        amount: 0,
        type: 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: 0
      };
    });
  }

  deleteTransaction(id: number) {
    if (confirm('Удалить транзакцию?')) {
      this.apiService.deleteTransaction(id).subscribe(() => this.loadData());
    }
  }

  editTransaction(transaction: Transaction) {
    alert('Редактирование: ' + JSON.stringify(transaction));
  }

  logout() {
    this.authService.logout();
  }
}