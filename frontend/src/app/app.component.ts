import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isMenuOpen = false;
  isLoggedIn = false;

  constructor(public authService: AuthService) {
    setInterval(() => {
      this.isLoggedIn = this.authService.isLoggedIn();
    }, 1000);
  }

  toggleMenu() { 
    this.isMenuOpen = !this.isMenuOpen; 
  }
  
  closeMenu() { 
    this.isMenuOpen = false; 
  }
  
  logout() { 
    this.authService.logout(); 
    this.closeMenu(); 
  }
}