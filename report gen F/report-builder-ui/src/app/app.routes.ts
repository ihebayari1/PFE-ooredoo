import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login.component';
import { RegisterComponent } from './core/auth/register.component';
import { ActivateAccountComponent } from './core/auth/activate-account.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'test', loadComponent: () => import('./form-builder/form-builder.component').then(m => m.FormBuilderComponent)},
  { path: 'register', component: RegisterComponent },
  { path: 'activation-account', component: ActivateAccountComponent },

  {
    path: '',
    component: MainLayoutComponent, // ⬅️ wraps all protected pages
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        data: { roles: ['MAIN_ADMIN', 'DEPARTMENT_ADMIN', 'USER'] },
        loadComponent: () => import('./features/admin/main-admin-dashboard.component').then(m => m.MainAdminDashboardComponent)
      },
      {
        path: 'admin-panel',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/admin/main-admin-dashboard.component').then(m => m.MainAdminDashboardComponent)
      },
      {
        path: 'dept-panel',
        data: { roles: ['DEPARTMENT_ADMIN'] },
        loadComponent: () => import('./features/department/dept-admin-dashboard.component').then(m => m.DeptAdminDashboardComponent)
      },
      {
        path: 'user-panel',
        data: { roles: ['USER'] },
        loadComponent: () => import('./features/user/user-dashboard.component').then(m => m.UserDashboardComponent)
      },
    ]
  },

  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  { path: '**', redirectTo: 'login' }
];
