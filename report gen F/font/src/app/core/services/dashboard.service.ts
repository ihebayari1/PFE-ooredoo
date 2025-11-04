import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserService } from './user.service';
import { EnterpriseService } from './enterprise.service';
import { RegionService } from './region.service';
import { ZoneService } from './zone.service';
import { SectorService } from './sector.service';
import { POSService } from './pos.service';
import { FormService } from './form.service';
import { SubmissionService } from './submission.service';
import { AuthService } from '../auth/auth.service';
import { User, Enterprise, Region, Zone, Sector, POS } from '../models/enterprise.model';

export interface DashboardStats {
  users?: number;
  regions?: number;
  zones?: number;
  sectors?: number;
  pos?: number;
  forms?: number;
  submissions?: number;
  enterprise?: Enterprise;
  assignedRegion?: Region;
  assignedZone?: Zone;
  assignedSector?: Sector;
  assignedPOS?: POS;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private currentUserFull: any = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private enterpriseService: EnterpriseService,
    private regionService: RegionService,
    private zoneService: ZoneService,
    private sectorService: SectorService,
    private posService: POSService,
    private formService: FormService,
    private submissionService: SubmissionService
  ) {}

  /**
   * Get full user details including enterprise/region/zone/sector/POS assignments
   */
  getCurrentUserFull(): Observable<User> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.email) {
      return of(null as any);
    }
    
    return this.userService.getUserByEmail(user.email).pipe(
      map(fullUser => {
        this.currentUserFull = fullUser;
        return fullUser;
      }),
      catchError(() => of(null as any))
    );
  }

  /**
   * Load dashboard stats based on user role
   */
  loadDashboardStats(userRole: string, user?: User): Observable<DashboardStats> {
    if (!userRole) return of({});

    switch (userRole) {
      case 'MAIN_ADMIN':
        return this.loadMainAdminStats();
      case 'ENTERPRISE_ADMIN':
        return this.loadEnterpriseAdminStats(user);
      case 'HEAD_OF_REGION':
        return this.loadHeadOfRegionStats(user);
      case 'HEAD_OF_ZONE':
        return this.loadHeadOfZoneStats(user);
      case 'HEAD_OF_SECTOR':
        return this.loadHeadOfSectorStats(user);
      case 'HEAD_OF_POS':
        return this.loadHeadOfPOSStats(user);
      case 'SIMPLE_USER':
      default:
        return this.loadSimpleUserStats();
    }
  }

  private loadMainAdminStats(): Observable<DashboardStats> {
    return forkJoin({
      users: this.userService.getAllUsers(0, 1000).pipe(
        map(page => page.content),
        catchError(() => of([]))
      ),
      enterprises: this.enterpriseService.getAllEnterprises(0, 1000).pipe(
        map(page => page.content),
        catchError(() => of([]))
      ),
      regions: this.regionService.getAllRegions(0, 1000).pipe(
        map(page => page.content),
        catchError(() => of([]))
      ),
      zones: this.zoneService.getAllZones(0, 1000).pipe(
        map(page => page.content),
        catchError(() => of([]))
      ),
      sectors: this.sectorService.getAllSectors(0, 1000).pipe(
        map(page => page.content),
        catchError(() => of([]))
      ),
      pos: this.posService.getAllPOS(0, 1000).pipe(
        map(page => page.content),
        catchError(() => of([]))
      ),
      forms: this.formService.getAllForms().pipe(catchError(() => of([])))
    }).pipe(
      map(results => ({
        users: results.users.length,
        regions: results.regions.length,
        zones: results.zones.length,
        sectors: results.sectors.length,
        pos: results.pos.length,
        forms: results.forms.length,
        // Store enterprises count in a custom property if needed
      } as DashboardStats))
    );
  }

  private loadEnterpriseAdminStats(user?: User): Observable<DashboardStats> {
    if (!user || !user.enterprise) {
      return of({});
    }

    const enterpriseId = typeof user.enterprise === 'number' 
      ? user.enterprise 
      : user.enterprise.id;

    if (!enterpriseId) {
      return of({});
    }

    return forkJoin({
      enterprise: this.enterpriseService.getEnterpriseById(enterpriseId).pipe(
        catchError(() => of(undefined))
      ),
      users: this.enterpriseService.getUsersInEnterprise(enterpriseId, 0, 1000).pipe(
        map(page => page.content),
        catchError(() => of([]))
      ),
      regions: this.regionService.getAllRegions(0, 1000).pipe(
        map(page => page.content.filter(r => {
          // Filter regions by enterprise - assuming regions belong to enterprise indirectly
          // You may need to adjust this based on your data model
          return true; // For now, return all and filter in UI
        })),
        catchError(() => of([]))
      ),
      forms: this.formService.getAllForms().pipe(catchError(() => of([])))
    }).pipe(
      map(results => ({
        enterprise: results.enterprise || undefined,
        users: results.users.length,
        forms: results.forms.length
      } as DashboardStats))
    );
  }

  private loadHeadOfRegionStats(user?: User): Observable<DashboardStats> {
    // Get user's assigned region
    return this.getCurrentUserFull().pipe(
      map(fullUser => {
        if (!fullUser) return {};
        // Find region where user is head - this would need backend support
        // For now, return empty stats
        return {};
      }),
      catchError(() => of({}))
    );
  }

  private loadHeadOfZoneStats(user?: User): Observable<DashboardStats> {
    return this.getCurrentUserFull().pipe(
      map(fullUser => {
        if (!fullUser) return {};
        return {};
      }),
      catchError(() => of({}))
    );
  }

  private loadHeadOfSectorStats(user?: User): Observable<DashboardStats> {
    return this.getCurrentUserFull().pipe(
      map(fullUser => {
        if (!fullUser) return {};
        return {};
      }),
      catchError(() => of({}))
    );
  }

  private loadHeadOfPOSStats(user?: User): Observable<DashboardStats> {
    return this.getCurrentUserFull().pipe(
      map(fullUser => {
        if (!fullUser) return {};
        return {};
      }),
      catchError(() => of({}))
    );
  }

  private loadSimpleUserStats(): Observable<DashboardStats> {
    return forkJoin({
      forms: this.formService.getFormsAssignedToMe().pipe(catchError(() => of([]))),
      submissions: this.submissionService.getMySubmissions().pipe(catchError(() => of([])))
    }).pipe(
      map(results => ({
        forms: results.forms.length,
        submissions: results.submissions.length
      }))
    );
  }

  /**
   * Get hierarchy data for HEAD_OF_* roles
   */
  getHierarchyData(role: string, userId?: number): Observable<any> {
    switch (role) {
      case 'HEAD_OF_REGION':
        return this.getRegionHierarchy(userId);
      case 'HEAD_OF_ZONE':
        return this.getZoneHierarchy(userId);
      case 'HEAD_OF_SECTOR':
        return this.getSectorHierarchy(userId);
      case 'HEAD_OF_POS':
        return this.getPOSHierarchy(userId);
      default:
        return of(null);
    }
  }

  private getRegionHierarchy(userId?: number): Observable<any> {
    // This would need backend endpoint like /regions/my-region
    // For now, return empty
    return of(null);
  }

  private getZoneHierarchy(userId?: number): Observable<any> {
    return of(null);
  }

  private getSectorHierarchy(userId?: number): Observable<any> {
    return of(null);
  }

  private getPOSHierarchy(userId?: number): Observable<any> {
    return of(null);
  }

  /**
   * Helper method to determine if user can create entities
   */
  canCreate(role: string): boolean {
    return role === 'MAIN_ADMIN' || role === 'ENTERPRISE_ADMIN';
  }

  /**
   * Helper method to determine if user can edit entities
   */
  canEdit(role: string): boolean {
    return ['MAIN_ADMIN', 'ENTERPRISE_ADMIN', 'HEAD_OF_REGION', 'HEAD_OF_ZONE', 
            'HEAD_OF_SECTOR', 'HEAD_OF_POS'].includes(role);
  }

  /**
   * Helper method to determine if user can delete entities
   */
  canDelete(role: string): boolean {
    return role === 'MAIN_ADMIN' || role === 'ENTERPRISE_ADMIN';
  }

  getCurrentUserFullSync(): any {
    return this.currentUserFull;
  }
}

