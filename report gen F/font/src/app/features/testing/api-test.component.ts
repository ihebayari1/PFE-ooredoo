import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth/auth.service';
import { FormService } from '../../core/services/form.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="api-test-container">
      <h1>API Integration Test</h1>
      
      <!-- Authentication Test -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Authentication Test</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="testLogin()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password">
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">
              Test Login
            </button>
          </form>
          
          <div *ngIf="authStatus" class="test-result">
            <mat-icon [color]="authStatus.success ? 'primary' : 'warn'">
              {{ authStatus.success ? 'check_circle' : 'error' }}
            </mat-icon>
            <span>{{ authStatus.message }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Form API Test -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Form API Test</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="test-actions">
            <button mat-raised-button color="accent" (click)="testGetForms()">
              Test Get Forms
            </button>
            <button mat-raised-button color="accent" (click)="testCreateForm()">
              Test Create Form
            </button>
          </div>
          
          <div *ngIf="formTestResult" class="test-result">
            <mat-icon [color]="formTestResult.success ? 'primary' : 'warn'">
              {{ formTestResult.success ? 'check_circle' : 'error' }}
            </mat-icon>
            <span>{{ formTestResult.message }}</span>
            <pre *ngIf="formTestResult.data" class="test-data">{{ formTestResult.data | json }}</pre>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Connection Status -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Connection Status</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="connection-info">
            <p><strong>Backend URL:</strong> {{ backendUrl }}</p>
            <p><strong>Status:</strong> 
              <span [class]="connectionStatus.success ? 'success' : 'error'">
                {{ connectionStatus.message }}
              </span>
            </p>
            <button mat-button (click)="testConnection()">
              <mat-icon>refresh</mat-icon>
              Test Connection
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .api-test-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .test-card {
      margin-bottom: 24px;
    }

    .test-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .test-result {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      border-radius: 4px;
      background-color: #f5f5f5;
    }

    .test-data {
      background-color: #f0f0f0;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-top: 8px;
      overflow-x: auto;
    }

    .connection-info p {
      margin: 8px 0;
    }

    .success {
      color: #4caf50;
      font-weight: bold;
    }

    .error {
      color: #f44336;
      font-weight: bold;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  loginForm: FormGroup;
  authStatus: { success: boolean; message: string } | null = null;
  formTestResult: { success: boolean; message: string; data?: any } | null = null;
  connectionStatus: { success: boolean; message: string } = { success: false, message: 'Unknown' };
  backendUrl = 'http://localhost:8080/api/v1';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private formService: FormService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.testConnection();
  }

  testLogin(): void {
    if (this.loginForm.invalid) return;

    const credentials = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.authStatus = {
          success: true,
          message: `Login successful! Token received: ${response.token ? 'Yes' : 'No'}`
        };
        this.notificationService.showSuccess('Authentication test passed!');
      },
      error: (error) => {
        this.authStatus = {
          success: false,
          message: `Login failed: ${error.message || error.statusText || 'Unknown error'}`
        };
        this.notificationService.showError('Authentication test failed');
      }
    });
  }

  testGetForms(): void {
    this.formService.getForms().subscribe({
      next: (response) => {
        this.formTestResult = {
          success: true,
          message: `Forms retrieved successfully! Count: ${response?.length || 0}`,
          data: response
        };
        this.notificationService.showSuccess('Get forms test passed!');
      },
      error: (error) => {
        this.formTestResult = {
          success: false,
          message: `Get forms failed: ${error.message || error.statusText || 'Unknown error'}`,
          data: error
        };
        this.notificationService.showError('Get forms test failed');
      }
    });
  }

  testCreateForm(): void {
    const testForm = {
      name: 'Test Form ' + new Date().getTime(),
      description: 'This is a test form created by the API test component'
    };

    this.formService.createForm(testForm).subscribe({
      next: (response) => {
        this.formTestResult = {
          success: true,
          message: `Form created successfully! ID: ${response?.id || 'Unknown'}`,
          data: response
        };
        this.notificationService.showSuccess('Create form test passed!');
      },
      error: (error) => {
        this.formTestResult = {
          success: false,
          message: `Create form failed: ${error.message || error.statusText || 'Unknown error'}`,
          data: error
        };
        this.notificationService.showError('Create form test failed');
      }
    });
  }

  testConnection(): void {
    // Simple ping to test if backend is reachable
    fetch(this.backendUrl + '/health', { 
      method: 'GET',
      mode: 'cors'
    })
    .then(response => {
      if (response.ok) {
        this.connectionStatus = {
          success: true,
          message: 'Backend is reachable'
        };
      } else {
        this.connectionStatus = {
          success: false,
          message: `Backend responded with status: ${response.status}`
        };
      }
    })
    .catch(error => {
      this.connectionStatus = {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    });
  }
}
