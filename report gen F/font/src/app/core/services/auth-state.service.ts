import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    // Check if user is authenticated on service initialization
    const isAuth = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();
    
    this.isAuthenticatedSubject.next(isAuth);
    this.currentUserSubject.next(user);
  }

  public updateAuthState(): void {
    const isAuth = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();
    
    this.isAuthenticatedSubject.next(isAuth);
    this.currentUserSubject.next(user);
  }

  public logout(): void {
    this.authService.logout();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  public get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  public get currentUser(): any {
    return this.currentUserSubject.value;
  }
}
