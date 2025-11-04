import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})


export class ActivateAccountComponent implements OnInit {
  loading = false;
  message = '';
  error: string | null = null;
  email: string | null = null;
  activationForm: FormGroup;
  passwordSetupForm: FormGroup;
  isSubmitting = false;
  showPasswordSetup = false;
  activationCode: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(ToastrService) private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.activationForm = this.fb.group({
      activationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
    
    this.passwordSetupForm = this.fb.group({
      activationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }


  ngOnInit() {
    // Check if user came from registration (with email) or from email link (with token)
    this.email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');
    const setup = this.route.snapshot.queryParamMap.get('setup');

    console.log('Activation component - email:', this.email, 'token:', token, 'setup:', setup);

    if (token) {
      // Handle email link activation
      this.handleEmailLinkActivation(token);
    } else if (this.email) {
      // Show activation code input form
      this.message = `Please enter the 6-digit activation code sent to ${this.email}`;
    } else if (setup === 'true') {
      // User came from password setup invitation - show password setup form directly
      this.showPasswordSetup = true;
      this.message = 'Please enter your activation code and set up your password';
      console.log('Showing password setup form');
    } else {
      this.error = 'Invalid activation link';
    }
  }

  handleEmailLinkActivation(token: string) {
    this.loading = true;
    this.authService.activateAccount(token).subscribe({
      next: () => {
        this.message = 'Account activated successfully!';
        this.toastr.success('Your account has been activated');
        this.loading = false;
        this.redirectToLogin();
      },
      error: (error) => {
        console.error('Account activation error:', error);
        let errorMessage = 'Failed to activate account. Please check your activation link and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Invalid activation token. Please check your email for the correct activation link.';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'Activation token expired or invalid. Please request a new activation email.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.error = errorMessage;
        this.toastr.error(errorMessage, 'Activation Failed');
        this.loading = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.showPasswordSetup) {
      this.onPasswordSetup();
    } else {
      this.onActivationCodeSubmit();
    }
  }

  onActivationCodeSubmit() {
    if (this.activationForm.invalid) return;
    
    this.isSubmitting = true;
    const activationCode = this.activationForm.value.activationCode;
    this.activationCode = activationCode;
    
    this.authService.verifyActivationCode(activationCode).subscribe({
      next: () => {
        // User has password - account activated successfully
        this.message = 'Account activated successfully!';
        this.toastr.success('Your account has been activated');
        this.isSubmitting = false;
        this.redirectToLogin();
      },
      error: (error) => {
        console.error('Activation code verification error:', error);
        if (error.error && error.error.includes('PASSWORD_SETUP_REQUIRED')) {
          // User needs password setup (admin-created user)
          this.showPasswordSetup = true;
          this.message = 'Please set up your password to complete account activation';
          this.toastr.info('Please set up your password to complete activation', 'Password Setup Required');
          this.isSubmitting = false;
        } else {
          let errorMessage = 'Invalid activation code. Please check your email and try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Invalid activation code format. Please enter the 6-digit code from your email.';
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = 'Activation code expired or invalid. Please request a new activation code.';
          } else if (error.status === 0 || error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          this.error = errorMessage;
          this.toastr.error(errorMessage, 'Activation Failed');
          this.isSubmitting = false;
        }
      }
    });
  }

  onPasswordSetup() {
    if (this.passwordSetupForm.invalid) return;
    
    this.isSubmitting = true;
    const password = this.passwordSetupForm.value.password;
    const activationCode = this.activationCode || this.passwordSetupForm.value.activationCode;
    
    this.authService.setupPassword(activationCode, password).subscribe({
      next: () => {
        this.message = 'Account activated successfully!';
        this.toastr.success('Your account has been activated');
        this.isSubmitting = false;
        this.redirectToLogin();
      },
      error: (error) => {
        console.error('Password setup error:', error);
        let errorMessage = 'Failed to set up password. Please check your activation code and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid activation code or password. Password must be at least 8 characters long.';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'Activation code expired or invalid. Please request a new activation code.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.error = errorMessage;
        this.toastr.error(errorMessage, 'Password Setup Failed');
        this.isSubmitting = false;
      }
    });
  }

  resendActivationCode() {
    if (!this.email) return;
    
    this.authService.resendActivationEmail(this.email).subscribe({
      next: () => {
        this.toastr.success('Activation code resent to your email');
      },
      error: (error) => {
        console.error('Resend activation code error:', error);
        let errorMessage = 'Failed to resend activation code. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment before requesting a new activation code.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMessage, 'Resend Failed');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private redirectToLogin() {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000); // Redirect after 3 seconds
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
} 

