import { Injectable, inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface MenuItem {
  path: string;
  icon: string;
  label: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private tokenService = inject(TokenStorageService);
  private jwtHelper = new JwtHelperService();

  private menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      roles: ['MAIN_ADMIN', 'DEPARTMENT_ADMIN', 'USER']
    },
    {
      path: '/admin-panel',
      icon: 'admin_panel_settings',
      label: 'Admin Panel',
      roles: ['MAIN_ADMIN']
    },
    {
      path: '/form-builder',
      icon: 'edit_document',
      label: 'Create Forms',
      roles: ['DEPARTMENT_ADMIN']
    },
    {
      path: '/form-fill',
      icon: 'assignment',
      label: 'My Forms',
      roles: ['USER']
    }
  ];

  getUserRoles(): string[] {
    const token = this.tokenService.getToken();
    if (!token) return [];

    const decoded = this.jwtHelper.decodeToken(token);
    return decoded?.authorities || [];
  }

  getAuthorizedMenuItems(): MenuItem[] {
    const userRoles = this.getUserRoles();
    return this.menuItems.filter(item =>
      item.roles.some(role => userRoles.includes(`ROLE_${role}`))
    );
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(`ROLE_${role}`);
  }
} 