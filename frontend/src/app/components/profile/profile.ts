import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile = {
    id: 1,
    username: 'dos',
    email: 'dos@gmail.com',
    first_name: '',
    last_name: '',
    phone: '',
    avatar: ''
  };
  
  isEditing = false;
  editProfile = { ...this.profile };
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  stats = {
    transactionsCount: 2,
    categoriesCount: 0,
    goalsCount: 0,
    memberSince: 'Апрель 2024'
  };
  
  isLoading = false;
  message = { text: '', type: '' };

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadStats();
  }

  loadProfile(): void {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      this.profile = JSON.parse(savedProfile);
      this.editProfile = { ...this.profile };
    }
  }

  loadStats(): void {
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar(): void {
    if (!this.selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profile.avatar = e.target.result;
      this.saveProfile();
      this.showMessage('✅ Аватар обновлен!', 'success');
      this.selectedFile = null;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  startEdit(): void {
    this.isEditing = true;
    this.editProfile = { ...this.profile };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editProfile = { ...this.profile };
  }

  saveProfile(): void {
    this.profile = { ...this.editProfile };
    localStorage.setItem('userProfile', JSON.stringify(this.profile));
    this.isEditing = false;
    this.showMessage('✅ Профиль обновлен!', 'success');
  }

  showMessage(text: string, type: string): void {
    this.message = { text, type };
    setTimeout(() => {
      this.message = { text: '', type: '' };
    }, 3000);
  }

  getAvatarUrl(): string {
    if (this.profile.avatar) {
      return this.profile.avatar;
    }
    return `https://ui-avatars.com/api/?background=667eea&color=fff&name=${this.profile.username}`;
  }
}