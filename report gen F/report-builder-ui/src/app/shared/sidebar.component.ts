import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TokenStorageService } from '../core/auth/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  roles: string[] = [];

  constructor(
    private tokenService: TokenStorageService,
    private jwtHelper: JwtHelperService
  ) {
    const token = this.tokenService.getToken();
    if (token) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.roles = decoded?.authorities || [];
    }
  }

  hasRole(role: string): boolean {
    return this.roles.includes(`ROLE_${role}`);
  }
}
