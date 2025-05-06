import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../auth/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenStorageService);
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();

  const token = tokenService.getToken();

  if (!token || jwtHelper.isTokenExpired(token)) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data?.['roles'] as string[];
  const decodedToken = jwtHelper.decodeToken(token);
  const userRoles: string[] = decodedToken?.authorities || [];

  if (expectedRoles && !expectedRoles.some(role => userRoles.includes(`ROLE_${role}`))) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
}; 