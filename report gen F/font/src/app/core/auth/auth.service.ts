import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { RegisterRequest } from '../models/register-request.model';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { PinVerificationResponse } from '../models/pin-verification-response.model';
import { TokenStorageService } from './token-storage.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  constructor(
    private http: HttpClient, 
    private tokenStorage: TokenStorageService,
    private jwtHelper: JwtHelperService
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.tokenStorage.saveToken(response.token);
        // Save user data from token
        this.saveUserFromToken(response.token);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  private saveUserFromToken(token: string): void {
    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      if (decodedToken) {
        const user = {
          email: decodedToken.sub,
          roles: decodedToken.authorities || [],
          userId: decodedToken.userId || decodedToken.sub,
          exp: decodedToken.exp,
          iat: decodedToken.iat
        };
        this.tokenStorage.saveUser(user);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();
    if (!token) return false;
    
    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  getCurrentUser(): any {
    return this.tokenStorage.getUser();
  }

  logout(): void {
    this.tokenStorage.signOut();
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.tokenStorage.saveToken(response.token);
          this.saveUserFromToken(response.token);
        }
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.logout(); // Clear invalid tokens
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  activateAccount(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/activation-account`, {
      params: { token }
    });
  }

  verifyActivationCode(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-activation-code`, { code });
  }

  resendActivationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-activation`, { email });
  }

  verifyOtp(otpCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { otpCode });
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, { email });
  }

  setupPassword(activationCode: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/setup-password`, { 
      activationCode, 
      password 
    });
  }

  verifyPin(email: string, pin: string): Observable<PinVerificationResponse> {
    return this.http.post<PinVerificationResponse>(`${environment.apiUrl}/users/verify-pin`, { email, pin });
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles || user.roles.length === 0) return false;
    
    // Check if any role matches (token authorities are still an array)
    return user.roles.some((role: string) => 
      role === roleName || role === `ROLE_${roleName}`
    );
  }

  isMainAdmin(): boolean {
    return this.hasRole('MAIN_ADMIN');
  }
} 