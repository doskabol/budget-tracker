import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-premium',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './premium.html',
  styleUrls: ['./premium.css']
})
export class PremiumComponent {
  plans = [
    { days: 30, price: 990, popular: false, save: 0 },
    { days: 90, price: 2490, popular: true, save: 20 },
    { days: 365, price: 7990, popular: false, save: 40 }
  ];

  message = '';
  messageType = '';

  constructor(private authService: AuthService, private router: Router) {}

  buyPlan(days: number, price: number): void {
    // Активируем подписку
    this.authService.activateSubscription(days);
    
    this.message = `✅ Подписка на ${days} дней активирована!`;
    this.messageType = 'success';
    
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  hasSubscription(): boolean {
    return this.authService.hasSubscription();
  }

  getExpiryDate(): string {
    const sub = localStorage.getItem('subscription');
    if (!sub) return '';
    const data = JSON.parse(sub);
    return new Date(data.expires).toLocaleDateString('ru-RU');
  }
}