import { Component, OnInit } from '@angular/core';
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
  selector: 'app-password-setup',
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
  templateUrl: './password-setup.component.html',
  styleUrls: ['./password-setup.component.scss']
})
export class PasswordSetupComponent implements OnInit {
  passwordSetupForm: FormGroup;
  isSubmitting = false;
  activationCode: string | null = null;
  email: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.passwordSetupForm = this.fb.group({
      activationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get activation code and email from query parameters
    this.activationCode = this.route.snapshot.queryParamMap.get('code');
    this.email = this.route.snapshot.queryParamMap.get('email');
    
    // Pre-fill activation code if provided
    if (this.activationCode) {
      this.passwordSetupForm.patchValue({
        activationCode: this.activationCode
      });
    }
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
    if (this.passwordSetupForm.invalid) return;
    
    this.isSubmitting = true;
    const formData = this.passwordSetupForm.value;
    
    this.authService.setupPassword(formData.activationCode, formData.password).subscribe({
      next: () => {
        this.toastr.success('Password set successfully! Your account is now activated.');
        this.isSubmitting = false;
        // Redirect to login page
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('Password setup error:', error);
        let errorMessage = 'Failed to set up password. Please check your activation code and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid activation code or password. Please check your information.';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'Activation code expired or invalid. Please request a new activation code.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMessage, 'Password Setup Failed');
        this.isSubmitting = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
