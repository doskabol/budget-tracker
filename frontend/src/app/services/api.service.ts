import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction';
import { Category } from '../models/category';
import { SavingGoal } from '../models/saving-goal';
import { Debt } from '../models/debt';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Transactions
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/`);
  }
  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions/`, transaction);
  }
  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}/`, transaction);
  }
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}/`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }
  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories/`, category);
  }

  // Saving Goals
  getSavingGoals(): Observable<SavingGoal[]> {
    return this.http.get<SavingGoal[]>(`${this.apiUrl}/saving-goals/`);
  }
  createSavingGoal(goal: SavingGoal): Observable<SavingGoal> {
    return this.http.post<SavingGoal>(`${this.apiUrl}/saving-goals/`, goal);
  }
  deleteSavingGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/saving-goals/${id}/`);
  }

  // Debts
  getDebts(): Observable<Debt[]> {
    return this.http.get<Debt[]>(`${this.apiUrl}/debts/`);
  }
  createDebt(debt: Debt): Observable<Debt> {
    return this.http.post<Debt>(`${this.apiUrl}/debts/`, debt);
  }
  deleteDebt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/debts/${id}/`);
  }

  // Stats
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/`);
  }

  updateSavingGoal(id: number, goal: SavingGoal): Observable<SavingGoal> {
    return this.http.put<SavingGoal>(`${this.apiUrl}/saving-goals/${id}/`, goal);
  }
}