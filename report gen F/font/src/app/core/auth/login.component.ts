import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router, RouterModule } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],

  
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;
  loading = false;
  isSubmitting = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    @Inject(ToastrService) private toastr: ToastrService,
    private jwtHelper: JwtHelperService,
  )  {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.error = null; // Clear any previous error
    const { email, password } = this.loginForm.value;
    

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.error = null; // Clear error on success
        this.toastr.success('Login successful! Please check your email for OTP code.');
        // Token and user data are automatically saved by the auth service
    
        // Redirect to OTP verification page instead of dashboard
        this.router.navigate(['/otp'], { 
          queryParams: { email: email } 
        });
    
        this.isSubmitting = false;
        this.loginForm.reset();
      },
      error: (err) => {
        console.error('Login error:', err);
        let errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        
        if (err.status === 403) {
          errorMessage = 'Account not activated. Please check your email for activation code.';
          this.error = errorMessage;
          this.toastr.error(errorMessage, 'Account Not Activated');
          this.router.navigate(['/activate-account'], { 
            queryParams: { email: email } 
          });
        } else if (err.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          this.error = errorMessage;
          this.toastr.error(errorMessage, 'Authentication Failed');
        } else if (err.status === 404) {
          errorMessage = 'User account not found. Please check your email address.';
          this.error = errorMessage;
          this.toastr.error(errorMessage, 'User Not Found');
        } else if (err.error?.message) {
          errorMessage = err.error.message;
          this.error = errorMessage;
          this.toastr.error(errorMessage, 'Login Failed');
        } else if (err.status === 0 || err.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
          this.error = errorMessage;
          this.toastr.error(errorMessage, 'Server Error');
        } else {
          this.error = errorMessage;
          this.toastr.error(errorMessage, 'Login Failed');
        }
        this.isSubmitting = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
} 
