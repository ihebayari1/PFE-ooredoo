import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {

  constructor(
    private router: Router,
    @Inject(AuthService) private authService: AuthService
  ) {}

  /**
   * Redirects user to appropriate dashboard based on their role
   */
  redirectToDashboard(): void {
    if (this.authService.isMainAdmin()) {
      this.router.navigate(['/admin']);
    } else if (this.isSimpleUserRole()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Check if user has one of the simple user roles
   */
  private isSimpleUserRole(): boolean {
    return this.authService.hasRole('SIMPLE_USER') ||
           this.authService.hasRole('HEAD_OF_SECTOR') ||
           this.authService.hasRole('HEAD_OF_ZONE') ||
           this.authService.hasRole('HEAD_OF_REGION') ||
           this.authService.hasRole('HEAD_OF_POS') ||
           this.authService.hasRole('COMMERCIAL_POS') ||
           this.authService.hasRole('USER');
  }

  /**
   * Redirects user to login page
   */
  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Redirects user to unauthorized page
   */
  redirectToUnauthorized(): void {
    this.router.navigate(['/unauthorized']);
  }

  /**
   * Redirects user to home page (dashboard or admin based on role)
   */
  redirectToHome(): void {
    this.redirectToDashboard();
  }
}
