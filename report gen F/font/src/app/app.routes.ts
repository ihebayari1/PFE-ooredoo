import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  { path: '', loadComponent: () => import('./shared/components/home-redirect.component').then(m => m.HomeRedirectComponent) },

  { path: 'login', loadComponent: () => import('./core/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./core/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'activate-account', loadComponent: () => import('./core/auth/activate-account.component').then(m => m.ActivateAccountComponent) },
  { path: 'password-setup', loadComponent: () => import('./core/auth/password-setup.component').then(m => m.PasswordSetupComponent) },
  { path: 'otp', loadComponent: () => import('./core/auth/otp-verification.component').then(m => m.OtpVerificationComponent) },
  { path: 'pin-verification', loadComponent: () => import('./core/auth/pin-verification.component').then(m => m.PinVerificationComponent) },
  
  {
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout.component').then(m => m.MainLayoutComponent), // ⬅️ wraps all protected pages
    canActivate: [authGuard],
    children: [
      // API Testing Route (for development)
      { path: 'api-test', loadComponent: () => import('./features/testing/api-test.component').then(m => m.ApiTestComponent) },
      
      // Form Builder Routes
      { path: 'form-builder', loadComponent: () => import('./form-builder/form-builder.component').then(m => m.FormBuilderComponent) },
      { path: 'forms/:id/edit', loadComponent: () => import('./form-builder/form-builder.component').then(m => m.FormBuilderComponent) },
      
      // Form Creation Routes
      { path: 'forms', loadComponent: () => import('./form-creation/form-creation.component').then(m => m.FormCreationComponent) },
      { path: 'forms-list', loadComponent: () => import('./form-list/forms-list.component').then(m => m.FormsListComponent), data: { roles: ['MAIN_ADMIN', 'USER', 'SIMPLE_USER', 'HEAD_OF_SECTOR', 'HEAD_OF_ZONE', 'HEAD_OF_REGION', 'HEAD_OF_POS', 'COMMERCIAL_POS'] } },
      
      // Form Submission Routes
      { path: 'forms/:id/submit', loadComponent: () => import('./features/submissions/form-submission.component').then(m => m.FormSubmissionComponent) },
      {
        path: 'dashboard',
        data: { roles: ['MAIN_ADMIN', 'USER', 'POS', 'SIMPLE_USER', 'HEAD_OF_SECTOR', 'HEAD_OF_ZONE', 'HEAD_OF_REGION', 'HEAD_OF_POS', 'COMMERCIAL_POS'] },
        loadComponent: () => import('./features/user/user-dashboard.component').then(m => m.UserDashboardComponent),
       
      },
      {
        path: 'admin',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/admin/main-admin-dashboard.component').then(m => m.MainAdminDashboardComponent),
         
      },
      {
        path: 'admin-panel',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/admin/main-admin-dashboard.component').then(m => m.MainAdminDashboardComponent),
         
      },

      {
        path: 'user',
        data: { roles: ['USER'] },
        loadComponent: () => import('./features/user/user-dashboard.component').then(m => m.UserDashboardComponent),
         
      },
      {
        path: 'user-panel',
        data: { roles: ['USER'] },
        loadComponent: () => import('./features/user/user-dashboard.component').then(m => m.UserDashboardComponent),
         
      },
      
      // Submission Management Routes
      {
        path: 'forms/:id/submissions',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/submissions/submission-management.component').then(m => m.SubmissionManagementComponent),
         
      },
      {
        path: 'submissions',
        data: { roles: ['MAIN_ADMIN', 'USER', 'SIMPLE_USER', 'HEAD_OF_SECTOR', 'HEAD_OF_ZONE', 'HEAD_OF_REGION', 'HEAD_OF_POS', 'COMMERCIAL_POS'] },
        loadComponent: () => import('./features/submissions/submission-management.component').then(m => m.SubmissionManagementComponent),
         
      },
      {
        path: 'submissions/:id/details',
        data: { roles: ['MAIN_ADMIN', 'USER', 'SIMPLE_USER', 'HEAD_OF_SECTOR', 'HEAD_OF_ZONE', 'HEAD_OF_REGION', 'HEAD_OF_POS', 'COMMERCIAL_POS'] },
        loadComponent: () => import('./features/submissions/submission-details.component').then(m => m.SubmissionDetailsComponent),
         
      },

      // Management System Routes
      {
        path: 'management/enterprises',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/enterprise/enterprise-management.component').then(m => m.EnterpriseManagementComponent),
      },
      {
        path: 'management/users',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/user/user-management.component').then(m => m.UserManagementComponent),
      },
      {
        path: 'management/regions',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/region/region-management.component').then(m => m.RegionManagementComponent),
      },
      {
        path: 'management/zones',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/zone/zone-management.component').then(m => m.ZoneManagementComponent),
      },
      {
        path: 'management/sectors',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/sector/sector-management.component').then(m => m.SectorManagementComponent),
      },
      {
        path: 'management/pos',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/pos/pos-management.component').then(m => m.POSManagementComponent),
      },
      {
        path: 'management/roles',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/role/role-management.component').then(m => m.RoleManagementComponent),
      },
      {
        path: 'management/role-actions',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/role-action/role-action-management.component').then(m => m.RoleActionManagementComponent),
      },
      {
        path: 'management/flash',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/flash/flash-management.component').then(m => m.FlashManagementComponent),
      },
      {
        path: 'management/components',
        data: { roles: ['MAIN_ADMIN'] },
        loadComponent: () => import('./features/component/component-management.component').then(m => m.ComponentManagementComponent),
      },
    ]
  },

  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/unauthorized.component').then(m => m.UnauthorizedComponent),
     
  },

  { path: '**', redirectTo: 'login' }
];
