import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  stats: any = null;
  goalsCount: number = 0;
  debtsCount: number = 0;
  
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  editData = {
    email: '',
    first_name: '',
    last_name: '',
    phone: ''
  };

  selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadStats();
    this.loadCounts();
  }

  loadProfile() {
    this.authService.getProfileFull().subscribe({
      next: (data) => {
        this.user = data;
        this.editData = {
          email: data.email,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || ''
        };
      },
      error: (err) => console.error('Ошибка загрузки профиля:', err)
    });
  }

  loadStats() {
    this.apiService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error(err)
    });
  }

  loadCounts() {
    this.apiService.getSavingGoals().subscribe({
      next: (data) => this.goalsCount = data.length
    });
    this.apiService.getDebts().subscribe({
      next: (data) => this.debtsCount = data.length
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.authService.uploadAvatar(file).subscribe({
        next: (res) => {
          this.loadProfile();
          alert('Аватар загружен');
        },
        error: (err) => {
          console.error(err);
          alert('Ошибка загрузки аватара');
        }
      });
    }
  }

  updateProfile() {
    this.authService.updateProfileFull(this.editData).subscribe({
      next: () => {
        this.loadProfile();
        alert('Профиль обновлён');
      },
      error: (err) => {
        console.error(err);
        alert('Ошибка при обновлении');
      }
    });
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword) {
      alert('Заполните все поля');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    if (this.newPassword.length < 6) {
      alert('Новый пароль должен быть минимум 6 символов');
      return;
    }

    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        alert('Пароль изменён. Войдите заново');
        localStorage.setItem('auth_token', res.token);
        this.authService.logout();
      },
      error: (err) => {
        alert('Ошибка: ' + (err.error?.error || 'Неверный старый пароль'));
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }

  logout() {
    this.authService.logout();
  }
} 