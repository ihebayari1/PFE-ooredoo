import { inject, Injectable } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenStorageService } from '../auth/token-storage.service';
import { ToastrService } from 'ngx-toastr';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenStorageService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Skip adding token for authentication endpoints
  const authPattern = /\/auth\/(register|authenticate|activate|verify-activation-code|resend-activation)/;
  const isAuthEndpoint = authPattern.test(req.url);

  const token = tokenService.getToken();

  // Add token to request if available and not an auth endpoint
  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.log('Unauthorized request - token may be invalid or expired');
        tokenService.signOut();
        toastr.error('Session expired. Please login again.', 'Authentication Error');
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.log('Forbidden request - insufficient permissions');
        toastr.error('You do not have permission to access this resource.', 'Access Denied');
        return throwError(() => error);
      }

      // Handle 500 errors with "User not found" message
      if (error.status === 500 && error.error?.error === 'User not found') {
        console.log('User not found error - clearing authentication');
        tokenService.signOut();
        toastr.error('User session invalid. Please login again.', 'Session Error');
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
};
