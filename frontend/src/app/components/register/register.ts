import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  password2 = '';
  errorMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit(): void {
    if (this.password !== this.password2) {
      this.errorMessage = 'Пароли не совпадают';
      return;
    }

    this.http.post('http://localhost:8000/api/auth/register/', {
      username: this.username,
      email: this.email,
      password: this.password,
      password2: this.password2
    }).subscribe({
      next: (response: any) => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error.error?.username?.[0] || 'Ошибка регистрации';
      }
    });
  }
}