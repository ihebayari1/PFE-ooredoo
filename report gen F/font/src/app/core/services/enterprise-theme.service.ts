import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnterpriseThemeData } from '../models/pin-verification-response.model';
import { isPlatformBrowser } from '@angular/common';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  enterpriseName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseThemeService {
  private defaultTheme: ThemeConfig = {
    primaryColor: '#1976d2', // Default Material blue
    secondaryColor: '#ff4081', // Default Material pink
    logoUrl: '/favicon.ico' // Use existing favicon as default
  };

  private currentThemeSubject = new BehaviorSubject<ThemeConfig>(this.defaultTheme);
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setEnterpriseTheme(enterpriseTheme: EnterpriseThemeData | null): void {
    if (enterpriseTheme) {
      const theme: ThemeConfig = {
        primaryColor: enterpriseTheme.primaryColor || this.defaultTheme.primaryColor,
        secondaryColor: enterpriseTheme.secondaryColor || this.defaultTheme.secondaryColor,
        logoUrl: enterpriseTheme.logoUrl || this.defaultTheme.logoUrl,
        enterpriseName: enterpriseTheme.enterpriseName
      };
      this.currentThemeSubject.next(theme);
      this.applyThemeToDocument(theme);
    } else {
      this.setDefaultTheme();
    }
  }

  setDefaultTheme(): void {
    this.currentThemeSubject.next(this.defaultTheme);
    this.applyThemeToDocument(this.defaultTheme);
  }

  getCurrentTheme(): ThemeConfig {
    return this.currentThemeSubject.value;
  }

  private applyThemeToDocument(theme: ThemeConfig): void {
    // Only apply theme in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Apply CSS custom properties to the document root
    const root = document.documentElement;
    root.style.setProperty('--enterprise-primary-color', theme.primaryColor);
    root.style.setProperty('--enterprise-secondary-color', theme.secondaryColor);
    
    // Update favicon if logo is provided
    if (theme.logoUrl && theme.logoUrl !== this.defaultTheme.logoUrl) {
      this.updateFavicon(theme.logoUrl);
    }
  }

  private updateFavicon(logoUrl: string): void {
    // Only update favicon in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = logoUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}
