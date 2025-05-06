import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})


export class ActivateAccountComponent implements OnInit {
  loading = true;
  message = '';;
  error: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}


  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.message = 'Invalid activation link';
      this.loading = false;
      
      return;
    }

    this.authService.activateAccount(token).subscribe({
      next: () => {
        this.message = 'Account activated successfully!';
        this.toastr.success('Your account has been activated');
        this.loading = false;
        this.redirectToLogin();
      },
      error: (error) => {
        this.message = 'Failed to activate account. A new activation email will be sent if the token expired.';
        this.toastr.error('Activation failed');
        this.loading = false;
      }
    });
  }
  private redirectToLogin() {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000); // Redirect after 3 seconds
  }
} 

