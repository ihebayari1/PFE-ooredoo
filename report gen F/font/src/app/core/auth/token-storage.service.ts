import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private TOKEN_KEY = 'auth_token';
  private USER_KEY = 'auth_user';
  private REFRESH_TOKEN_KEY = 'refresh_token';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  public saveToken(token: string): void {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(this.TOKEN_KEY, token);
        console.log('Token saved successfully');
      } catch (error) {
        console.error('Error saving token:', error);
      }
    }
  }

  public getToken(): string | null {
    if (this.isBrowser()) {
      try {
        return localStorage.getItem(this.TOKEN_KEY);
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    }
    return null;
  }

  public removeToken(): void {
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.TOKEN_KEY);
        console.log('Token removed successfully');
      } catch (error) {
        console.error('Error removing token:', error);
      }
    }
  }

  public saveUser(user: any): void {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        console.log('User data saved successfully');
      } catch (error) {
        console.error('Error saving user:', error);
      }
    }
  }

  public getUser(): any {
    if (this.isBrowser()) {
      try {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
      } catch (error) {
        console.error('Error getting user:', error);
        return null;
      }
    }
    return null;
  }

  public removeUser(): void {
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.USER_KEY);
        console.log('User data removed successfully');
      } catch (error) {
        console.error('Error removing user:', error);
      }
    }
  }

  public saveRefreshToken(refreshToken: string): void {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      } catch (error) {
        console.error('Error saving refresh token:', error);
      }
    }
  }

  public getRefreshToken(): string | null {
    if (this.isBrowser()) {
      try {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
      } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
      }
    }
    return null;
  }

  public removeRefreshToken(): void {
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      } catch (error) {
        console.error('Error removing refresh token:', error);
      }
    }
  }

  public signOut(): void {
    this.removeToken();
    this.removeUser();
    this.removeRefreshToken();
    console.log('All authentication data cleared');
  }

  public hasValidToken(): boolean {
    const token = this.getToken();
    return token !== null && token.length > 0;
  }
}