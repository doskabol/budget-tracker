import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProfileComponent } from './components/profile/profile';
import { HistoryComponent } from './components/history/history';
import { CategoriesComponent } from './components/categories/categories';
import { GoalsComponent } from './components/goals/goals';
import { DebtsComponent } from './components/debts/debts';
import { MapComponent } from './components/map/map';
import { PremiumComponent } from './components/premium/premium';
import { AuthGuard } from './guards/auth-guard';
import { PremiumGuard } from './guards/premium.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'goals', component: GoalsComponent, canActivate: [AuthGuard] },
  { path: 'debts', component: DebtsComponent, canActivate: [AuthGuard, PremiumGuard] },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'premium', component: PremiumComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];