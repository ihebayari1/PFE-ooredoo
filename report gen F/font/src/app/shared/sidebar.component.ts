import { Component, OnInit, Inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TokenStorageService } from '../core/auth/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  roles: string[] = [];
  user: any = null;
  userRole: string = '';
  pendingSubmissions: number = 0;
  currentRoute: string = '';
  isAdminPage: boolean = false;

  constructor(
    private tokenService: TokenStorageService,
    private jwtHelper: JwtHelperService,
    private router: Router,
    @Inject(ToastrService) private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.trackRouteChanges();
  }

  private trackRouteChanges(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.isAdminPage = this.currentRoute.includes('/admin');
        console.log('Current route:', this.currentRoute, 'Is admin page:', this.isAdminPage);
      });
    
    // Set initial route
    this.currentRoute = this.router.url;
    this.isAdminPage = this.currentRoute.includes('/admin');
  }

  private loadUserData(): void {
    const token = this.tokenService.getToken();
    if (token) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.roles = decoded?.authorities || [];
      this.user = this.tokenService.getUser();
      
      if (this.user) {
        // Try multiple ways to get the role
        this.userRole = this.user.role || this.user.roles?.[0]?.replace('ROLE_', '') || 'USER';
      } else if (decoded) {
        // Fallback: get role from token
        this.userRole = decoded.role || decoded.authorities?.[0]?.replace('ROLE_', '') || 'USER';
      }
      
      // Debug logging
      console.log('Sidebar - User:', this.user);
      console.log('Sidebar - Roles:', this.roles);
      console.log('Sidebar - UserRole:', this.userRole);
      console.log('Sidebar - Decoded Token:', decoded);
      console.log('Sidebar - hasRole MAIN_ADMIN:', this.hasRole('MAIN_ADMIN'));
      console.log('Sidebar - shouldShowAdminNavigation:', this.shouldShowAdminNavigation());
      console.log('Sidebar - shouldShowSimpleUserNavigation:', this.shouldShowSimpleUserNavigation());
    }
  }

  hasRole(role: string): boolean {
    return this.roles.includes(`ROLE_${role}`);
  }

  isSimpleUserRole(): boolean {
    // Check roles array first
    const hasSimpleRole = this.hasRole('SIMPLE_USER') ||
           this.hasRole('HEAD_OF_SECTOR') ||
           this.hasRole('HEAD_OF_ZONE') ||
           this.hasRole('HEAD_OF_REGION') ||
           this.hasRole('HEAD_OF_POS') ||
           this.hasRole('COMMERCIAL_POS') ||
           this.hasRole('USER');
    
    // Also check userRole string
    const hasSimpleUserRole = this.userRole === 'SIMPLE_USER' ||
           this.userRole === 'HEAD_OF_SECTOR' ||
           this.userRole === 'HEAD_OF_ZONE' ||
           this.userRole === 'HEAD_OF_REGION' ||
           this.userRole === 'HEAD_OF_POS' ||
           this.userRole === 'COMMERCIAL_POS' ||
           this.userRole === 'USER';
    
    return hasSimpleRole || hasSimpleUserRole;
  }

  shouldShowAdminNavigation(): boolean {
    // Show admin navigation if user has MAIN_ADMIN role regardless of current page
    const hasMainAdminRole = this.hasRole('MAIN_ADMIN') || 
                            this.userRole === 'MAIN_ADMIN' ||
                            this.userRole === 'ROLE_MAIN_ADMIN' ||
                            this.roles.includes('MAIN_ADMIN') ||
                            this.roles.includes('ROLE_MAIN_ADMIN');
    
    // Fallback: if on admin page and no clear role detected, assume admin
    const fallbackAdmin = this.isAdminPage && (this.userRole === 'USER' || !this.userRole);
    
    const result = hasMainAdminRole || fallbackAdmin;
    
    console.log('shouldShowAdminNavigation check:', {
      hasRole: this.hasRole('MAIN_ADMIN'),
      userRole: this.userRole,
      roles: this.roles,
      isAdminPage: this.isAdminPage,
      hasMainAdminRole,
      fallbackAdmin,
      result
    });
    
    return result;
  }

  isEnterpriseAdmin(): boolean {
    return this.hasRole('ENTERPRISE_ADMIN') || this.userRole === 'ENTERPRISE_ADMIN';
  }

  isHeadOfRegion(): boolean {
    return this.hasRole('HEAD_OF_REGION') || this.userRole === 'HEAD_OF_REGION';
  }

  isHeadOfZone(): boolean {
    return this.hasRole('HEAD_OF_ZONE') || this.userRole === 'HEAD_OF_ZONE';
  }

  isHeadOfSector(): boolean {
    return this.hasRole('HEAD_OF_SECTOR') || this.userRole === 'HEAD_OF_SECTOR';
  }

  isHeadOfPOS(): boolean {
    return this.hasRole('HEAD_OF_POS') || this.userRole === 'HEAD_OF_POS';
  }

  isAnyHeadRole(): boolean {
    return this.isHeadOfRegion() || this.isHeadOfZone() || this.isHeadOfSector() || this.isHeadOfPOS();
  }

  shouldShowSimpleUserNavigation(): boolean {
    // Show simple user navigation if user is not MAIN_ADMIN and not on admin page
    return !this.shouldShowAdminNavigation() && !this.isAdminPage && !this.isEnterpriseAdmin() && !this.isAnyHeadRole();
  }

  // Check if user is MAIN_ADMIN
  isMainAdmin(): boolean {
    return this.hasRole('MAIN_ADMIN') || this.userRole === 'MAIN_ADMIN';
  }

  // Force show admin navigation when on admin page (for debugging)
  isOnAdminPage(): boolean {
    return this.isAdminPage;
  }

  logout(): void {
    this.tokenService.signOut();
    this.toastr.success('Logged out successfully', 'Success');
    this.router.navigate(['/login']);
  }
}
