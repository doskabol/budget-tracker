import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit(): void {
    this.http.post('http://localhost:8000/api/auth/login/', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = 'Неверное имя пользователя или пароль';
      }
    });
  }
}