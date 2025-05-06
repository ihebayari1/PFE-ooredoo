import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],

  
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;
  loading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private toastr: ToastrService,
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
    const { email, password } = this.loginForm.value;
    

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.toastr.success('Login successful');
        this.tokenStorage.saveToken(response.token);
    
        const decodedToken = this.jwtHelper.decodeToken(response.token);
        const roles: string[] = decodedToken.authorities;
    
        if (roles.includes('ROLE_MAIN_ADMIN')) {
          this.router.navigate(['/admin']);
        } else if (roles.includes('ROLE_DEPARTMENT_ADMIN')) {
          this.router.navigate(['/department']);
        } else {
          this.router.navigate(['/user']);
        }
    
        this.isSubmitting = false;
        this.loginForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Invalid credentials or account not activated');
        this.isSubmitting = false;
      }
    });
  }
} 
