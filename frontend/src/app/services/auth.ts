import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'access_token';
  private subscriptionKey = 'subscription';

  constructor(private router: Router) {}

  setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.tokenKey, access);
    localStorage.setItem('refresh_token', refresh);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  hasSubscription(): boolean {
    const sub = localStorage.getItem(this.subscriptionKey);
    if (!sub) return false;
    
    const subscription = JSON.parse(sub);
    return subscription.active && new Date(subscription.expires) > new Date();
  }

  getSubscriptionType(): 'free' | 'premium' {
    return this.hasSubscription() ? 'premium' : 'free';
  }

  activateSubscription(days: number): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    
    localStorage.setItem(this.subscriptionKey, JSON.stringify({
      active: true,
      expires: expires.toISOString(),
      activatedAt: new Date().toISOString()
    }));
  }
}