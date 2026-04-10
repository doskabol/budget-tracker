import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Debt } from '../../models/debt';

@Component({
  selector: 'app-debts',
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.css']
})
export class DebtsComponent implements OnInit {
  debts: Debt[] = [];
  debtsOwe: Debt[] = [];
  debtsOweMe: Debt[] = [];
  
  newDebt: Debt = {
    name: '',
    amount: 0,
    direction: 'i_owe',
    due_date: '',
    is_paid: false
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDebts();
  }

  loadDebts() {
    this.apiService.getDebts().subscribe({
      next: (data) => {
        this.debts = data;
        this.debtsOwe = data.filter(d => d.direction === 'i_owe');
        this.debtsOweMe = data.filter(d => d.direction === 'owe_me');
      },
      error: (err) => console.error('Ошибка загрузки долгов:', err)
    });
  }

  addDebt() {
    if (!this.newDebt.name || this.newDebt.name.trim() === '') {
      alert('Введите имя');
      return;
    }
    if (this.newDebt.amount <= 0) {
      alert('Введите сумму больше 0');
      return;
    }

    const debtToSend = {
      name: this.newDebt.name,
      amount: this.newDebt.amount,
      direction: this.newDebt.direction,
      due_date: this.newDebt.due_date || null,
      is_paid: this.newDebt.is_paid
    };

    console.log('Отправка долга:', debtToSend);

    this.apiService.createDebt(debtToSend as Debt).subscribe({
      next: (res) => {
        console.log('Долг добавлен:', res);
        this.loadDebts();
        this.newDebt = { name: '', amount: 0, direction: 'i_owe', due_date: '', is_paid: false };
      },
      error: (err) => {
        console.error('Ошибка при добавлении:', err);
        alert('Ошибка: ' + (err.error?.error || JSON.stringify(err.error) || err.message));
      }
    });
  }

  deleteDebt(id: number) {
    if (confirm('Удалить долг?')) {
      this.apiService.deleteDebt(id).subscribe({
        next: () => this.loadDebts(),
        error: (err) => console.error('Ошибка удаления:', err)
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}