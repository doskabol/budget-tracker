import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    if (token) {
      this.loadProfile().subscribe({
        next: (user) => this.userSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  register(username: string, password: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, { username, password, email })
      .pipe(tap((res: any) => this.handleAuth(res)));
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, { username, password })
      .pipe(tap((res: any) => this.handleAuth(res)));
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout/`, {}).subscribe();
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleAuth(data: any): void {
    localStorage.setItem(this.tokenKey, data.token);
    this.userSubject.next(data.user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile/`);
  }

  updateProfile(data: { email?: string; first_name?: string; last_name?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/update/`, data);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  loadProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile/`);
  }

  getProfileFull(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile-full/`);
  }
  
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(`${this.apiUrl}/upload-avatar/`, formData);
  }
  
  updateProfileFull(data: { email?: string; first_name?: string; last_name?: string; phone?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile-full/`, data);
  }
}