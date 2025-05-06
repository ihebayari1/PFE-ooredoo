import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="unauthorized-container">
      <h1>Unauthorized Access</h1>
      <p>You don't have permission to access this page.</p>
      <button mat-raised-button color="primary" routerLink="/dashboard">Go to Dashboard</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    h1 { color: #f44336; margin-bottom: 1rem; }
    p { margin-bottom: 2rem; }
  `]
})
export class UnauthorizedComponent {} 