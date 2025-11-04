import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RedirectService } from '../services/redirect.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-otp-verification',
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
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss']
})
export class OtpVerificationComponent implements OnInit {
  otpForm: FormGroup;
  isSubmitting = false;
  email: string | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private jwtHelper: JwtHelperService,
    private redirectService: RedirectService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(ToastrService) private toastr: ToastrService
  ) {
    this.otpForm = this.fb.group({
      otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
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
    if (this.otpForm.invalid) return;
    
    this.isSubmitting = true;
    const otpCode = this.otpForm.value.otpCode;
    
    this.authService.verifyOtp(otpCode).subscribe({
      next: () => {
        this.toastr.success('OTP verified successfully! Redirecting to PIN verification...', 'Success');
        this.isSubmitting = false;
        // Redirect to PIN verification instead of dashboard
        this.router.navigate(['/pin-verification'], { 
          queryParams: { email: this.email } 
        });
      },
      error: (error) => {
        console.error('OTP verification error:', error);
        let errorMessage = 'Invalid OTP code. Please check your email and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid OTP code format. Please enter the 6-digit code from your email.';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'OTP code expired or invalid. Please request a new code.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMessage, 'OTP Verification Failed');
        this.isSubmitting = false;
        this.otpForm.reset();
      }
    });
  }

  resendOtp() {
    if (!this.email) return;
    
    this.loading = true;
    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.toastr.success('OTP code resent to your email');
        this.loading = false;
      },
      error: (error) => {
        console.error('Resend OTP error:', error);
        let errorMessage = 'Failed to resend OTP code. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment before requesting a new OTP.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMessage, 'Resend Failed');
        this.loading = false;
      }
    });
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
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
