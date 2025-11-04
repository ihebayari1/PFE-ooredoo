import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../auth/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenStorageService);
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();

  const token = tokenService.getToken();

  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    // During SSR, we can't access localStorage, so we return true
    // The client-side will handle the actual authentication check
    return true;
  }

  // No token means user is not authenticated
  if (!token) {
    console.log('No token found, redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  // Check if token is expired
  if (jwtHelper.isTokenExpired(token)) {
    console.log('Token expired, redirecting to login');
    tokenService.signOut(); // Clear expired token
    router.navigate(['/login']);
    return false;
  }

  // Check role-based access
  const expectedRoles = route.data?.['roles'] as string[];
  if (expectedRoles && expectedRoles.length > 0) {
    const decodedToken = jwtHelper.decodeToken(token);
    const userRoles: string[] = decodedToken?.authorities || [];

    const hasRequiredRole = expectedRoles.some(role => 
      userRoles.includes(`ROLE_${role}`) || userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      console.log('Insufficient permissions, redirecting to unauthorized');
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
}; 