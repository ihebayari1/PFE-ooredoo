import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RedirectService } from '../services/redirect.service';
import { EnterpriseThemeService } from '../services/enterprise-theme.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pin-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './pin-verification.component.html',
  styleUrls: ['./pin-verification.component.scss']
})
export class PinVerificationComponent implements OnInit {
  pinForm: FormGroup;
  isSubmitting = false;
  email: string | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  hidePin = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private jwtHelper: JwtHelperService,
    private redirectService: RedirectService,
    private enterpriseThemeService: EnterpriseThemeService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(ToastrService) private toastr: ToastrService
  ) {
    this.pinForm = this.fb.group({
      pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
  }

  ngOnInit() {
    // Get email from query params or state
    this.email = this.route.snapshot.queryParamMap.get('email');
    if (!this.email) {
      this.toastr.error('No email found. Please login again.');
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.pinForm.invalid) return;
    
    this.isSubmitting = true;
    const pin = this.pinForm.value.pin;
    
    if (!this.email) {
      this.toastr.error('No email found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }
    
    this.authService.verifyPin(this.email, pin).subscribe({
      next: (response) => {
        if (response.valid) {
          // Apply enterprise theme if available
          this.enterpriseThemeService.setEnterpriseTheme(response.enterpriseTheme || null);
          
          this.toastr.success('PIN verified successfully! Redirecting to dashboard...', 'Success');
          this.isSubmitting = false;
          this.redirectBasedOnRole();
        } else {
          this.toastr.error('The PIN you entered is incorrect. Please check your PIN and try again.', 'Invalid PIN');
          this.isSubmitting = false;
          this.pinForm.reset();
        }
      },
      error: (error) => {
        console.error('PIN verification error:', error);
        let errorMessage = 'The PIN you entered is incorrect. Please check your PIN and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'Invalid or expired session. Please login again.';
        } else if (error.status === 404) {
          errorMessage = 'User account not found. Please contact support.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMessage, 'PIN Verification Failed');
        this.isSubmitting = false;
        this.pinForm.reset();
      }
    });
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }

  togglePinVisibility() {
    this.hidePin = !this.hidePin;
  }

  private redirectBasedOnRole(): void {
    try {
      this.redirectService.redirectToDashboard();
    } catch (error) {
      console.error('Error determining user role:', error);
      // Fallback to dashboard on error
      this.router.navigate(['/dashboard']);
    }
  }
}
