import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../core/services/auth-state.service';
import { TokenStorageService } from '../core/auth/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-auth-check',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-check" *ngIf="showDebugInfo">
      <h3>Authentication Status</h3>
      <div class="status-item">
        <strong>Is Authenticated:</strong> {{ isAuthenticated }}
      </div>
      <div class="status-item">
        <strong>Has Token:</strong> {{ hasToken }}
      </div>
      <div class="status-item">
        <strong>Token Valid:</strong> {{ isTokenValid }}
      </div>
      <div class="status-item" *ngIf="currentUser">
        <strong>User Email:</strong> {{ currentUser.email }}
      </div>
      <div class="status-item" *ngIf="currentUser">
        <strong>User Roles:</strong> {{ currentUser.roles?.join(', ') }}
      </div>
      <div class="status-item">
        <strong>Token (first 50 chars):</strong> {{ tokenPreview }}
      </div>
    </div>
  `,
  styles: [`
    .auth-check {
      background: #f5f5f5;
      padding: 15px;
      margin: 10px;
      border-radius: 5px;
      font-family: monospace;
    }
    .status-item {
      margin: 5px 0;
    }
  `]
})
export class AuthCheckComponent implements OnInit {
  isAuthenticated = false;
  hasToken = false;
  isTokenValid = false;
  currentUser: any = null;
  tokenPreview = '';
  showDebugInfo = false; // Set to true for debugging

  constructor(
    private authStateService: AuthStateService,
    private tokenStorage: TokenStorageService,
    private jwtHelper: JwtHelperService
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    
    // Subscribe to auth state changes
    this.authStateService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.authStateService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private checkAuthStatus() {
    const token = this.tokenStorage.getToken();
    this.hasToken = !!token;
    
    if (token) {
      this.tokenPreview = token.substring(0, 50) + '...';
      try {
        this.isTokenValid = !this.jwtHelper.isTokenExpired(token);
      } catch (error) {
        this.isTokenValid = false;
      }
    } else {
      this.tokenPreview = 'No token';
    }
  }
}
