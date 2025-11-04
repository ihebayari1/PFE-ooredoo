import { Routes } from '@angular/router';

export const serverRoutes: Routes = [
  // Define server-side routes for dynamic parameters
  {
    path: 'forms/:id/edit',
    loadComponent: () => import('./form-builder/form-builder.component').then(m => m.FormBuilderComponent)
  },
  {
    path: 'forms/:id/submit', 
    loadComponent: () => import('./features/submissions/form-submission.component').then(m => m.FormSubmissionComponent)
  },
  {
    path: 'forms/:id/submissions',
    loadComponent: () => import('./features/submissions/submission-management.component').then(m => m.SubmissionManagementComponent)
  }
];