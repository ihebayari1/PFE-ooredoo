import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RedirectService } from '../../core/services/redirect.service';
import { ToastrService } from 'ngx-toastr';
import { FormService, FormResponseDTO } from '../../core/services/form.service';
import { SubmissionService } from '../../core/services/submission.service';
import { FormSubmission } from '../../core/models/form.model';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { UserService } from '../../core/services/user.service';
import { EnterpriseService } from '../../core/services/enterprise.service';
import { RegionService } from '../../core/services/region.service';
import { ZoneService } from '../../core/services/zone.service';
import { SectorService } from '../../core/services/sector.service';
import { POSService } from '../../core/services/pos.service';
import { User, Enterprise, Region, Zone, Sector, POS } from '../../core/models/enterprise.model';
import { catchError, finalize, switchMap, map } from 'rxjs/operators';
import { of, forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatExpansionModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  user: any = null;
  userRole: string = '';
  fullUser: User | null = null;
  
  // Stats properties
  dashboardStats: DashboardStats = {};
  isLoadingStats = true;

  // Assigned forms and submissions
  assignedForms: FormResponseDTO[] = [];
  mySubmissions: FormSubmission[] = [];
  isLoadingAssignedForms = true;
  isLoadingSubmissions = true;

  // Hierarchy data for HEAD_OF_* roles
  hierarchyData: any = null;
  isLoadingHierarchy = false;

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private jwtHelper: JwtHelperService,
    private redirectService: RedirectService,
    private router: Router,
    @Inject(ToastrService) private toastr: ToastrService,
    private formService: FormService,
    private submissionService: SubmissionService,
    private dashboardService: DashboardService,
    private userService: UserService,
    private enterpriseService: EnterpriseService,
    private regionService: RegionService,
    private zoneService: ZoneService,
    private sectorService: SectorService,
    private posService: POSService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Get user data from storage or token
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.userRole = this.user.roles?.[0]?.replace('ROLE_', '') || 'USER';
    } else {
      // Fallback: decode token if user data is not available
      const token = this.tokenStorage.getToken();
      if (token) {
        const decodedToken = this.jwtHelper.decodeToken(token);
        this.user = {
          email: decodedToken.sub,
          roles: decodedToken.authorities || []
        };
        this.userRole = this.user.roles?.[0]?.replace('ROLE_', '') || 'USER';
      }
    }

    // Load full user details and then stats
    this.dashboardService.getCurrentUserFull().subscribe(fullUser => {
      this.fullUser = fullUser;
      this.loadStats();
      this.loadAssignedForms();
      this.loadMySubmissions();
      
      // Load hierarchy data for HEAD_OF_* roles
      if (this.isHeadRole()) {
        this.loadHierarchyData();
      }
    });
  }

  private loadStats(): void {
    this.isLoadingStats = true;
    
    this.dashboardService.loadDashboardStats(this.userRole, this.fullUser || undefined)
      .pipe(
        catchError(error => {
          console.error('Error loading dashboard stats:', error);
          this.toastr.error('Failed to load dashboard statistics');
          return of({});
        }),
        finalize(() => {
          this.isLoadingStats = false;
        })
      )
      .subscribe(stats => {
        this.dashboardStats = stats;
      });
  }

  private loadHierarchyData(): void {
    this.isLoadingHierarchy = true;
    
    this.dashboardService.getHierarchyData(this.userRole, this.fullUser?.id)
      .pipe(
        catchError(error => {
          console.error('Error loading hierarchy data:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoadingHierarchy = false;
        })
      )
      .subscribe(data => {
        this.hierarchyData = data;
        // If no backend endpoint, fetch manually based on role
        if (!data) {
          this.loadHierarchyManually();
        }
      });
  }

  private loadHierarchyManually(): void {
    // Load hierarchy data manually based on user's assignment
    // This is a fallback until backend endpoints are available
    
    if (this.userRole === 'HEAD_OF_REGION' && this.fullUser) {
      // Find region where user is head
      this.regionService.getAllRegions(0, 1000).subscribe(page => {
        const myRegion = page.content.find(r => r.headOfRegion?.id === this.fullUser?.id);
        if (myRegion) {
          this.loadRegionHierarchy(myRegion.id!);
        }
      });
    } else if (this.userRole === 'HEAD_OF_ZONE' && this.fullUser) {
      this.zoneService.getAllZones(0, 1000).subscribe(page => {
        const myZone = page.content.find(z => z.headOfZone?.id === this.fullUser?.id);
        if (myZone) {
          this.loadZoneHierarchy(myZone.id!);
        }
      });
    } else if (this.userRole === 'HEAD_OF_SECTOR' && this.fullUser) {
      this.sectorService.getAllSectors(0, 1000).subscribe(page => {
        const mySector = page.content.find(s => s.headOfSector?.id === this.fullUser?.id);
        if (mySector) {
          this.loadSectorHierarchy(mySector.id!);
        }
      });
    } else if (this.userRole === 'HEAD_OF_POS' && this.fullUser) {
      this.posService.getAllPOS(0, 1000).subscribe(page => {
        const myPOS = page.content.find(p => p.headOfPOS?.id === this.fullUser?.id);
        if (myPOS) {
          this.loadPOSHierarchy(myPOS.id!);
        }
      });
    }
  }

  private loadRegionHierarchy(regionId: number): void {
    forkJoin({
      region: this.regionService.getRegionById(regionId),
      zones: this.regionService.getZonesByRegionId(regionId)
    }).subscribe(results => {
      // Load full hierarchy for each zone (sectors, POS, users)
      const zoneHierarchyPromises = results.zones.map(zone => 
        this.loadZoneFullHierarchy(zone.id!).pipe(
          map(fullZoneData => ({
            ...zone,
            sectors: fullZoneData.sectors || [],
            sectorsCount: fullZoneData.sectors?.length || 0,
            totalPOSCount: fullZoneData.totalPOSCount || 0,
            totalUsersCount: fullZoneData.totalUsersCount || 0
          }))
        )
      );

      forkJoin(zoneHierarchyPromises).subscribe(zonesWithHierarchy => {
        this.hierarchyData = {
          region: results.region,
          zones: zonesWithHierarchy,
          expanded: true
        };
      });
    });
  }

  private loadZoneFullHierarchy(zoneId: number): Observable<any> {
    return forkJoin({
      sectors: this.zoneService.getSectorsByZoneId(zoneId).pipe(catchError(() => of([])))
    }).pipe(
      switchMap(sectorResults => {
        const sectors = sectorResults.sectors || [];
        
        if (sectors.length === 0) {
          return of({ sectors: [], totalPOSCount: 0, totalUsersCount: 0 });
        }
        
        // Load POS for each sector
        const sectorPromises = sectors.map(sector => 
          this.sectorService.getPOSBySectorId(sector.id!).pipe(
            map(posList => ({
              ...sector,
              pos: posList || [],
              posCount: posList?.length || 0,
              usersCount: 0 // Will calculate below
            })),
            catchError(() => of({ ...sector, pos: [], posCount: 0, usersCount: 0 }))
          )
        );

        return forkJoin(sectorPromises).pipe(
          switchMap(sectorsWithPOS => {
            // Collect all POS from all sectors
            const allPOS = sectorsWithPOS.flatMap(sector => sector.pos || []);
            
            if (allPOS.length === 0) {
              return of({
                sectors: sectorsWithPOS,
                totalPOSCount: 0,
                totalUsersCount: 0
              });
            }

            // Load users for each POS
            const posPromises = allPOS.map(pos => 
              this.userService.getUsersByPOS(pos.id!, 0, 1000).pipe(
                map(page => ({
                  ...pos,
                  users: page.content || [],
                  usersCount: page.content?.length || 0
                })),
                catchError(() => of({ ...pos, users: [], usersCount: 0 }))
              )
            );

            return forkJoin(posPromises).pipe(
              map(posWithUsers => {
                // Create a map of POS with users
                const posWithUsersMap = new Map(posWithUsers.map((p: any) => [p.id, p]));
                
                // Update sectors with POS that have users
                sectorsWithPOS.forEach(sector => {
                  sector.pos = sector.pos?.map((p: any) => posWithUsersMap.get(p.id) || p) || [];
                  sector.usersCount = sector.pos.reduce((sum: number, p: any) => sum + (p.usersCount || 0), 0);
                });

                const totalPOSCount = sectorsWithPOS.reduce((sum, s) => sum + (s.posCount || 0), 0);
                const totalUsersCount = sectorsWithPOS.reduce((sum, s) => sum + (s.usersCount || 0), 0);

                return {
                  sectors: sectorsWithPOS,
                  totalPOSCount,
                  totalUsersCount
                };
              })
            );
          })
        );
      }),
      catchError(() => of({ sectors: [], totalPOSCount: 0, totalUsersCount: 0 }))
    );
  }

  private loadZoneHierarchy(zoneId: number): void {
    forkJoin({
      zone: this.zoneService.getZoneById(zoneId),
      sectors: this.zoneService.getSectorsByZoneId(zoneId)
    }).subscribe(results => {
      // Load full hierarchy for each sector (POS, users)
      const sectorHierarchyPromises = results.sectors.map(sector => 
        this.loadSectorFullHierarchy(sector.id!).pipe(
          map(fullSectorData => ({
            ...sector,
            pos: fullSectorData.pos || [],
            posCount: fullSectorData.pos?.length || 0,
            totalUsersCount: fullSectorData.totalUsersCount || 0
          }))
        )
      );

      forkJoin(sectorHierarchyPromises.length > 0 ? sectorHierarchyPromises : [of([])]).subscribe(sectorsWithHierarchy => {
        this.hierarchyData = {
          zone: results.zone,
          sectors: sectorsWithHierarchy.length > 0 ? sectorsWithHierarchy : [],
          expanded: true
        };
      });
    });
  }

  private loadSectorFullHierarchy(sectorId: number): Observable<any> {
    return forkJoin({
      pos: this.sectorService.getPOSBySectorId(sectorId).pipe(catchError(() => of([])))
    }).pipe(
      switchMap(posResults => {
        const posList = posResults.pos || [];
        
        if (posList.length === 0) {
          return of({ pos: [], totalUsersCount: 0 });
        }

        // Load users for each POS
        const posPromises = posList.map(pos => 
          this.userService.getUsersByPOS(pos.id!, 0, 1000).pipe(
            map(page => ({
              ...pos,
              users: page.content || [],
              usersCount: page.content?.length || 0
            })),
            catchError(() => of({ ...pos, users: [], usersCount: 0 }))
          )
        );

        return forkJoin(posPromises).pipe(
          map(posWithUsers => {
            const totalUsersCount = posWithUsers.reduce((sum: number, p: any) => sum + (p.usersCount || 0), 0);
            return {
              pos: posWithUsers,
              totalUsersCount
            };
          })
        );
      }),
      catchError(() => of({ pos: [], totalUsersCount: 0 }))
    );
  }

  private loadSectorHierarchy(sectorId: number): void {
    forkJoin({
      sector: this.sectorService.getSectorById(sectorId),
      pos: this.sectorService.getPOSBySectorId(sectorId)
    }).subscribe(results => {
      // Load users for each POS
      const posPromises = results.pos.map(pos => 
        this.userService.getUsersByPOS(pos.id!, 0, 1000).pipe(
          map(page => ({
            ...pos,
            users: page.content || [],
            usersCount: page.content?.length || 0
          })),
          catchError(() => of({ ...pos, users: [], usersCount: 0 }))
        )
      );

      forkJoin(posPromises.length > 0 ? posPromises : [of([])]).subscribe(posWithUsers => {
        this.hierarchyData = {
          sector: results.sector,
          pos: posWithUsers.length > 0 ? posWithUsers : [],
          expanded: true,
          totalUsersCount: posWithUsers.reduce((sum: number, p: any) => sum + (p.usersCount || 0), 0)
        };
      });
    });
  }

  private loadPOSHierarchy(posId: number): void {
    forkJoin({
      pos: this.posService.getPOSById(posId),
      users: this.userService.getUsersByPOS(posId, 0, 1000).pipe(
        map(page => page.content)
      )
    }).subscribe(results => {
      this.hierarchyData = {
        pos: results.pos,
        users: results.users || [],
        expanded: true,
        usersCount: results.users?.length || 0
      };
    });
  }

  private loadAssignedForms(): void {
    this.isLoadingAssignedForms = true;
    this.formService.getFormsAssignedToMe()
      .pipe(
        catchError(error => {
          console.error('Error loading assigned forms:', error);
          this.toastr.error('Failed to load assigned forms');
          return of([]);
        }),
        finalize(() => {
          this.isLoadingAssignedForms = false;
        })
      )
      .subscribe(forms => {
        this.assignedForms = forms;
      });
  }

  private loadMySubmissions(): void {
    this.isLoadingSubmissions = true;
    this.submissionService.getMySubmissions()
      .pipe(
        catchError(error => {
          console.error('Error loading my submissions:', error);
          this.toastr.error('Failed to load submissions');
          return of([]);
        }),
        finalize(() => {
          this.isLoadingSubmissions = false;
        })
      )
      .subscribe(submissions => {
        this.mySubmissions = submissions.slice(0, 5); // Show only latest 5 submissions
      });
  }


  logout(): void {
    this.authService.logout();
    this.toastr.success('Logged out successfully', 'Success');
    this.router.navigate(['/login']);
  }

  navigateToSubmissions(): void {
    this.router.navigate(['/submissions']);
  }

  navigateToFormSubmission(formId: number): void {
    this.router.navigate(['/forms', formId, 'submit']);
  }

  viewAllSubmissions(): void {
    this.router.navigate(['/submissions']);
  }

  navigateToSettings(): void {
    this.toastr.info('Settings page coming soon!', 'Info');
  }

  hasAdminRole(): boolean {
    return this.userRole === 'MAIN_ADMIN' || this.userRole === 'DEPARTMENT_ADMIN';
  }

  isMainAdmin(): boolean {
    return this.userRole === 'MAIN_ADMIN';
  }

  isEnterpriseAdmin(): boolean {
    return this.userRole === 'ENTERPRISE_ADMIN';
  }

  isHeadRole(): boolean {
    return this.userRole === 'HEAD_OF_REGION' ||
           this.userRole === 'HEAD_OF_ZONE' ||
           this.userRole === 'HEAD_OF_SECTOR' ||
           this.userRole === 'HEAD_OF_POS';
  }

  isSimpleUserRole(): boolean {
    return this.userRole === 'SIMPLE_USER' ||
           this.userRole === 'USER';
  }

  canCreate(): boolean {
    return this.dashboardService.canCreate(this.userRole);
  }

  canEdit(): boolean {
    return this.dashboardService.canEdit(this.userRole);
  }

  canDelete(): boolean {
    return this.dashboardService.canDelete(this.userRole);
  }

  navigateToManagement(): void {
    if (this.isMainAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.redirectService.redirectToDashboard();
    }
  }

  viewSubmissionDetails(submissionId: number | undefined): void {
    if (submissionId) {
      this.router.navigate(['/submissions', submissionId, 'details']);
    }
  }

  // Helper methods for template
  getRoleDisplayName(): string {
    const roleNames: { [key: string]: string } = {
      'MAIN_ADMIN': 'System Administrator',
      'ENTERPRISE_ADMIN': 'Enterprise Administrator',
      'HEAD_OF_REGION': 'Head of Region',
      'HEAD_OF_ZONE': 'Head of Zone',
      'HEAD_OF_SECTOR': 'Head of Sector',
      'HEAD_OF_POS': 'Head of POS',
      'SIMPLE_USER': 'User',
      'USER': 'User'
    };
    return roleNames[this.userRole] || this.userRole;
  }

  // Helper methods for hierarchy counts
  getTotalSectorsCount(): number {
    if (!this.hierarchyData?.zones) return 0;
    return this.hierarchyData.zones.reduce((sum: number, zone: any) => sum + (zone.sectorsCount || 0), 0);
  }

  getTotalPOSCount(): number {
    if (!this.hierarchyData?.zones) return 0;
    return this.hierarchyData.zones.reduce((sum: number, zone: any) => sum + (zone.totalPOSCount || 0), 0);
  }

  getTotalUsersCount(): number {
    if (!this.hierarchyData?.zones) return 0;
    return this.hierarchyData.zones.reduce((sum: number, zone: any) => sum + (zone.totalUsersCount || 0), 0);
  }

  // Helper methods for HEAD_OF_ZONE counts
  getZoneTotalPOSCount(): number {
    if (!this.hierarchyData?.sectors) return 0;
    return this.hierarchyData.sectors.reduce((sum: number, sector: any) => sum + (sector.posCount || 0), 0);
  }

  getZoneTotalUsersCount(): number {
    if (!this.hierarchyData?.sectors) return 0;
    return this.hierarchyData.sectors.reduce((sum: number, sector: any) => sum + (sector.totalUsersCount || 0), 0);
  }
}
