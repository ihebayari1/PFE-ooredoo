import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar.component';
import { AuthStateService } from '../../core/services/auth-state.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  pageTitle: string = 'Dashboard';
  breadcrumb: string = '';

  constructor(
    private router: Router,
    private authStateService: AuthStateService
  ) {}

  ngOnInit(): void {
    // Initialize authentication state
    this.authStateService.updateAuthState();
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageInfo(event.url);
      });
  }

  private updatePageInfo(url: string): void {
    // Extract base path for matching (ignore query params and fragments)
    const baseUrl = url.split('?')[0].split('#')[0];
    
    const routeMap: { [key: string]: { title: string; breadcrumb: string } } = {
      '/dashboard': { title: 'Dashboard', breadcrumb: 'Home / Dashboard' },
      '/admin': { title: 'Admin Dashboard', breadcrumb: 'Home / Admin Panel' },
      '/admin-panel': { title: 'Admin Dashboard', breadcrumb: 'Home / Admin Panel' },
      '/user': { title: 'User Dashboard', breadcrumb: 'Home / User Panel' },
      '/user-panel': { title: 'User Dashboard', breadcrumb: 'Home / User Panel' },
      '/department': { title: 'Department Dashboard', breadcrumb: 'Home / Department Panel' },
      '/forms': { title: 'Forms', breadcrumb: 'Home / Forms' },
      '/forms/create': { title: 'Create Form', breadcrumb: 'Home / Forms / Create' },
      '/forms-list': { title: 'Form List', breadcrumb: 'Home / Forms / List' },
      '/form-builder': { title: 'Form Builder', breadcrumb: 'Home / Forms / Builder' },
      '/submissions': { title: 'Submissions', breadcrumb: 'Home / Submissions' },
      '/reports': { title: 'Reports', breadcrumb: 'Home / Reports' },
      '/api-test': { title: 'API Testing', breadcrumb: 'Home / API Test' },
      '/management/enterprises': { title: 'Enterprise Management', breadcrumb: 'Home / Management / Enterprises' },
      '/management/users': { title: 'User Management', breadcrumb: 'Home / Management / Users' },
      '/management/regions': { title: 'Region Management', breadcrumb: 'Home / Management / Regions' },
      '/management/zones': { title: 'Zone Management', breadcrumb: 'Home / Management / Zones' },
      '/management/sectors': { title: 'Sector Management', breadcrumb: 'Home / Management / Sectors' },
      '/management/pos': { title: 'POS Management', breadcrumb: 'Home / Management / POS' },
      '/management/roles': { title: 'Role Management', breadcrumb: 'Home / Management / Roles' },
      '/management/role-actions': { title: 'Role Actions', breadcrumb: 'Home / Management / Role Actions' },
      '/management/flash': { title: 'Flash Management', breadcrumb: 'Home / Management / Flash' },
    };

    // Check for dynamic routes (forms/:id/edit, forms/:id/submit, etc.)
    let pageInfo = routeMap[baseUrl];
    
    if (!pageInfo) {
      // Check if it's a form edit route
      if (baseUrl.match(/^\/forms\/[^/]+\/edit$/)) {
        pageInfo = { title: 'Edit Form', breadcrumb: 'Home / Forms / Edit' };
      }
      // Check if it's a form submit route
      else if (baseUrl.match(/^\/forms\/[^/]+\/submit$/)) {
        pageInfo = { title: 'Submit Form', breadcrumb: 'Home / Forms / Submit' };
      }
      // Check if it's a form submissions route
      else if (baseUrl.match(/^\/forms\/[^/]+\/submissions$/)) {
        pageInfo = { title: 'Form Submissions', breadcrumb: 'Home / Forms / Submissions' };
      }
      // Check if it's a submission details route
      else if (baseUrl.match(/^\/submissions\/[^/]+\/details$/)) {
        pageInfo = { title: 'Submission Details', breadcrumb: 'Home / Submissions / Details' };
      }
    }

    pageInfo = pageInfo || { title: 'Dashboard', breadcrumb: 'Home' };
    this.pageTitle = pageInfo.title;
    this.breadcrumb = pageInfo.breadcrumb;
  }
}
