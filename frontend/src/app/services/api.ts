import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login/`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/`, userData);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/`);
  }

  updateProfile(data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/`, data);
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/`);
  }

  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions/`);
  }

  createTransaction(transaction: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions/`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}/`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories/`, category);
  }

  getGoals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/goals/`);
  }

  createGoal(goal: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/goals/`, goal);
  }

  getDebts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/debts/`);
  }

  createDebt(debt: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/debts/`, debt);
  }

  updateDebt(id: number, debt: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/debts/${id}/`, debt);
  }

  deleteDebt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/debts/${id}/`);
  }
}