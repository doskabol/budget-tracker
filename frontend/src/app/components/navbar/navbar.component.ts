import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfileFull().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => console.error(err)
    });
  }

  logout() {
    this.authService.logout();
  }
}