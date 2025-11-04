import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { UserType } from '../models/register-request.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  userTypes = Object.values(UserType);
  hidePassword = true;
  hidePin = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(ToastrService) private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      pinHash: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      userType: [UserType.INTERNAL, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.isSubmitting = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.toastr.success('Registration successful! Please check your email for activation code.');
        this.router.navigate(['/login']);
        this.isSubmitting = false;
        this.registerForm.reset();
      },
      error: (err) => {
        console.error('Registration error:', err);
        let errorMessage = 'Registration failed. Please check your information and try again.';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.error) {
          errorMessage = err.error.error;
        } else if (err.status === 400) {
          errorMessage = 'Invalid registration data. Please check all fields and try again.';
        } else if (err.status === 409) {
          errorMessage = 'Email address already registered. Please use a different email or try logging in.';
        } else if (err.status === 0 || err.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMessage, 'Registration Failed');
        this.isSubmitting = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  togglePinVisibility() {
    this.hidePin = !this.hidePin;
  }
} 