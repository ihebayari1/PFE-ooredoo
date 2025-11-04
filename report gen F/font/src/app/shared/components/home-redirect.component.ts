import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RedirectService } from '../../core/services/redirect.service';

@Component({
  selector: 'app-home-redirect',
  template: `
    <div class="redirect-container">
      <div class="redirect-content">
        <div class="spinner-container">
          <div class="spinner"></div>
        </div>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    
    .redirect-content {
      text-align: center;
      padding: 20px;
    }
    
    .spinner-container {
      margin-bottom: 20px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    p {
      color: #666;
      font-size: 16px;
      margin: 0;
    }
  `]
})
export class HomeRedirectComponent implements OnInit {

  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(RedirectService) private redirectService: RedirectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      // Redirect to appropriate dashboard based on role
      this.redirectService.redirectToDashboard();
    } else {
      // Redirect to login if not authenticated
      this.router.navigate(['/login']);
    }
  }
}
