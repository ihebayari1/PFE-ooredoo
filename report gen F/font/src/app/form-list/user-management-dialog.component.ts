import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormService } from '../core/services/form.service';
import { UserService } from '../core/services/user.service';
import { RoleService } from '../core/services/role.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, takeUntil, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { of, Subject, forkJoin } from 'rxjs';

export interface UserManagementDialogData {
  formId: number;
  formName: string;
}

@Component({
  selector: 'app-user-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './user-management-dialog.component.html',
  styles: [`
    .user-management-dialog {
      width: 95vw;
      max-width: 1200px;
      max-height: 90vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    // Enhanced Header
    .dialog-header {
      background: white;
      padding: 1.5rem;
      border-radius: 16px 16px 0 0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          
          .main-icon {
            font-size: 2.5rem;
            width: 2.5rem;
            height: 2.5rem;
            color: #e74c3c;
          }
          
          .title-text {
            h2 {
              margin: 0;
              font-size: 2rem;
              font-weight: 600;
              color: #2c3e50;
              background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            
            .form-name {
              margin: 0.25rem 0 0 0;
              color: #7f8c8d;
              font-size: 1rem;
              font-style: italic;
            }
          }
        }
        
        .header-stats {
          display: flex;
          gap: 1.5rem;
          
          .stat-item {
            text-align: center;
            
            .stat-number {
              display: block;
              font-size: 1.5rem;
              font-weight: 600;
              color: #e74c3c;
            }
            
            .stat-label {
              font-size: 0.8rem;
              color: #7f8c8d;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          }
        }
      }
    }
    
    // Dialog Content
    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }
    
    // Enhanced Search Section
    .search-section {
      background: white;
      padding: 1.5rem;
      margin: 1rem;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      
      .search-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        
        .search-field {
          flex: 2;
        }
        
        .role-filter-field {
          flex: 1;
          min-width: 200px;
        }
      }
      
      .search-summary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
        border-radius: 8px;
        color: #2c3e50;
        font-size: 0.9rem;
        
        mat-icon {
          color: #3498db;
          font-size: 1.2rem;
          width: 1.2rem;
          height: 1.2rem;
        }
      }
    }
    
    // Enhanced Loading State
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      text-align: center;
      background: white;
      margin: 1rem;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      
      mat-spinner {
        margin-bottom: 1rem;
      }
      
      p {
        margin: 0;
        color: #7f8c8d;
        font-size: 1rem;
      }
    }
    
    // Enhanced Tabs Container
    .tabs-container {
      margin: 1rem;
      
      .tabs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        
        h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .tabs-stats {
          display: flex;
          gap: 1rem;
          
          .tab-stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            
            &.assignable {
              background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
              color: #27ae60;
            }
            
            &.assigned {
              background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
              color: #e17055;
            }
            
            mat-icon {
              font-size: 1rem;
              width: 1rem;
              height: 1rem;
            }
          }
        }
      }
      
      .enhanced-tabs {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
    }
    
    // Enhanced Tab Content
    .tab-content {
      padding: 1.5rem;
    }
    
    .no-users {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 2rem;
      text-align: center;
      color: #7f8c8d;
      
      mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
        color: #bdc3c7;
      }
      
      p {
        margin: 0;
        font-size: 1rem;
        line-height: 1.5;
      }
    }
    
    // Enhanced List Header
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #ecf0f1;
      
      .instruction {
        margin: 0;
        color: #2c3e50;
        font-weight: 500;
        font-size: 1rem;
      }
      
      .selection-actions {
        display: flex;
        gap: 0.5rem;
        
        button {
          font-size: 0.8rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          
          &.select-all-btn {
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
            }
          }
          
          &.select-all-role-btn {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
            }
          }
          
          &.deselect-all-btn {
            background: #ecf0f1;
            color: #7f8c8d;
            
            &:hover {
              background: #bdc3c7;
              color: white;
            }
          }
        }
      }
    }
    
    // Enhanced Users Grid
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .user-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      &.selected {
        border-color: #27ae60;
        background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
        box-shadow: 0 4px 16px rgba(39, 174, 96, 0.2);
      }
      
      .user-card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        
        .user-checkbox {
          flex-shrink: 0;
        }
        
        .user-name {
          flex: 1;
          font-weight: 700;
          color: #2c3e50;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          line-height: 1.3;
          
          .selected-indicator {
            background: #27ae60;
            color: white;
            border-radius: 50%;
            width: 1.2rem;
            height: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: bold;
          }
        }
        
        .toggle-btn {
          color: #7f8c8d;
          transition: all 0.3s ease;
          
          &:hover {
            color: #3498db;
            background: rgba(52, 152, 219, 0.1);
          }
        }
      }
      
      .user-card-content {
        .user-email {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
          word-break: break-all;
        }
        
        .user-roles {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          
        .role-badge {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
        }
        }
      }
    }
    
    // Enhanced Dialog Actions
    .dialog-actions {
      background: white;
      padding: 1.5rem 2rem;
      border-radius: 0 0 16px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
      
      .action-summary {
        margin-bottom: 1rem;
        
        .summary-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          
          &.assign {
            background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
            color: #27ae60;
          }
          
          &.unassign {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            color: #e17055;
          }
          
          mat-icon {
            font-size: 1rem;
            width: 1rem;
            height: 1rem;
          }
        }
      }
      
      .action-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        
        .cancel-btn {
          color: #7f8c8d;
          border: 1px solid #bdc3c7;
          
          &:hover {
            background: #ecf0f1;
            color: #2c3e50;
          }
        }
        
        .assign-btn {
          background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
          }
          
          &:disabled {
            background: #bdc3c7;
            color: #7f8c8d;
          }
        }
        
        .unassign-btn {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
          }
          
          &:disabled {
            background: #bdc3c7;
            color: #7f8c8d;
          }
        }
      }
    }
    
    // Enhanced Tab Styling
    ::ng-deep .mat-mdc-tab-header {
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }
    
    ::ng-deep .mat-mdc-tab-label {
      min-width: 140px;
      padding: 1rem 1.5rem;
      font-weight: 500;
    }
    
    ::ng-deep .mat-mdc-tab-label .mat-icon {
      margin-right: 0.5rem;
    }
    
    // Fix dropdown scrolling issue
    ::ng-deep .mat-mdc-select-panel {
      max-height: 300px !important;
      overflow-y: auto !important;
      z-index: 9999 !important;
    }
    
    ::ng-deep .mat-mdc-option {
      min-height: 48px !important;
      line-height: 48px !important;
    }
    
    ::ng-deep .mat-mdc-option.mdc-list-item {
      padding: 0 16px !important;
    }
    
    // Ensure dropdown panel is visible above dialog content
    ::ng-deep .cdk-overlay-pane {
      z-index: 10000 !important;
    }
    
    // Additional styling for better dropdown appearance
    ::ng-deep .mat-mdc-select-panel .mat-mdc-option {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .count-badge {
      background: #e74c3c;
      color: white;
      border-radius: 50%;
      padding: 0.2rem 0.4rem;
      font-size: 0.7rem;
      font-weight: 500;
      margin-left: 0.5rem;
      min-width: 1.2rem;
      text-align: center;
      display: inline-block;
    }
    
    // Responsive Design
    @media (max-width: 1024px) {
      .user-management-dialog {
        width: 95vw;
        max-width: 1000px;
        max-height: 95vh;
      }
      
      .users-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        padding: 1rem;
      }
    }
    
    @media (max-width: 768px) {
      .user-management-dialog {
        width: 95vw;
        max-width: none;
        max-height: 95vh;
      }
      
      .dialog-header {
        padding: 1rem;
        
        .header-content {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
          
          .title-section {
            flex-direction: column;
            gap: 0.5rem;
            
            .title-text h2 {
              font-size: 1.5rem;
            }
          }
          
          .header-stats {
            justify-content: center;
          }
        }
      }
      
      .search-section {
        margin: 0.5rem;
        padding: 1rem;
        
        .search-controls {
          flex-direction: column;
          gap: 0.75rem;
          
          .search-field,
          .role-filter-field {
            flex: none;
            width: 100%;
            min-width: auto;
          }
        }
      }
      
      .tabs-container {
        margin: 0.5rem;
        
        .tabs-header {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
          
          .tabs-stats {
            justify-content: center;
          }
        }
      }
      
      .users-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        padding: 0.5rem;
      }
      
      .user-card {
        padding: 0.75rem;
        
        .user-card-header {
          gap: 0.5rem;
          
          .user-name {
            font-size: 0.9rem;
          }
        }
        
        .user-card-content {
          .user-email {
            font-size: 0.8rem;
          }
        }
      }
      
      .dialog-actions {
        padding: 1rem;
        
        .action-buttons {
          flex-direction: column;
          gap: 0.5rem;
          
          button {
            width: 100%;
          }
        }
      }
    }
    
    @media (max-width: 480px) {
      .user-management-dialog {
        width: 100vw;
        height: 100vh;
        max-height: none;
        border-radius: 0;
      }
      
      .dialog-header {
        border-radius: 0;
      }
      
      .dialog-actions {
        border-radius: 0;
      }
    }
  `]
})
export class UserManagementDialogComponent implements OnInit, OnDestroy {
  allUsers: (any & { 
    selectedForAssign: boolean; 
    selectedForUnassign: boolean; 
    isAssigned: boolean;
    filtered: boolean;
  })[] = [];
  assignedUserIds: number[] = [];
  searchTerm: string = '';
  selectedRoleFilter: string = '';
  availableRoles: any[] = [];
  selectedTabIndex = 0;
  isLoading = true;
  isProcessing = false;
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<UserManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserManagementDialogData,
    private formService: FormService,
    private userService: UserService,
    private roleService: RoleService,
    private toastr: ToastrService
  ) {
    // Validate input data
    if (!data?.formId || !data?.formName) {
      console.error('Invalid dialog data provided');
      this.dialogRef.close();
    }
  }

  ngOnInit(): void {
    this.setupSearch();
    this.loadRoles();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterUsers(searchTerm);
      });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchSubject$.next(searchTerm);
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    // Clear any selections when switching tabs
    this.clearAllSelections();
  }

  private clearAllSelections(): void {
    this.allUsers.forEach(user => {
      user.selectedForAssign = false;
      user.selectedForUnassign = false;
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject$.next('');
  }

  onRoleFilterChange(roleName: string): void {
    this.selectedRoleFilter = roleName;
    this.filterUsers(this.searchTerm);
  }

  clearRoleFilter(): void {
    this.selectedRoleFilter = '';
    this.filterUsers(this.searchTerm);
  }

  loadRoles(): void {
    this.roleService.getAllRoles(0, 1000)
      .pipe(
        takeUntil(this.destroy$),
        map(page => page.content),
        catchError(error => {
          console.error('Error loading roles:', error);
          this.toastr.error('Failed to load roles');
          return of([]);
        })
      )
      .subscribe(roles => {
        this.availableRoles = roles;
        console.log('Loaded roles:', roles);
      });
  }

  trackByUserId(index: number, user: any): number {
    return user.id;
  }

  onSelectionChange(): void {
    // This method can be used for additional selection change logic
  }

  getTotalFilteredUsers(): number {
    return this.allUsers.filter(user => user.filtered).length;
  }

  getUsersByRoleCount(roleName: string): number {
    return this.allUsers.filter(user => 
      user.roles?.some((role: any) => role.name === roleName)
    ).length;
  }

  getTotalUsers(): number {
    return this.allUsers.length;
  }

  getSelectedAssignableCount(): number {
    return this.getAssignableUsers().filter(user => user.selectedForAssign).length;
  }

  getSelectedAssignedCount(): number {
    return this.getAssignedUsers().filter(user => user.selectedForUnassign).length;
  }

  getRoleNames(roles: any): string[] {
    if (!roles) return [];
    
    // If roles is already an array of strings, return it
    if (Array.isArray(roles) && roles.length > 0 && typeof roles[0] === 'string') {
      return roles;
    }
    
    // If roles is an array of objects, extract the name property
    if (Array.isArray(roles) && roles.length > 0 && typeof roles[0] === 'object') {
      return roles.map(role => role.name || role.roleName || role.type || 'Unknown Role');
    }
    
    // If roles is a single object, extract the name
    if (typeof roles === 'object' && roles !== null) {
      return [roles.name || roles.roleName || roles.type || 'Unknown Role'];
    }
    
    // If roles is a string, return it as array
    if (typeof roles === 'string') {
      return [roles];
    }
    
    return ['No Role'];
  }

  private verifyBackendState(operation: 'assign' | 'unassign', userIds: number[]): void {
    // Longer delay to allow backend to process and commit changes
    setTimeout(() => {
      console.log(`Verifying backend state after ${operation} operation...`);
      this.formService.getAssignedUsers(this.data.formId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            const assignedIds = Array.isArray(response) ? response : [];
            console.log(`Backend verification after ${operation}:`, {
              operation,
              expectedUserIds: userIds,
              actualAssignedIds: assignedIds,
              formId: this.data.formId,
              response: response
            });
            
            if (operation === 'assign') {
              const missingAssignments = userIds.filter(id => !assignedIds.includes(id));
              if (missingAssignments.length > 0) {
                console.warn('Some users were not assigned:', missingAssignments);
                // Try to reload data again after another delay
                setTimeout(() => {
                  console.log('Retrying data load after assignment verification...');
                  this.loadData();
                }, 2000);
              } else {
                console.log('All users successfully assigned!');
              }
            } else if (operation === 'unassign') {
              const stillAssigned = userIds.filter(id => assignedIds.includes(id));
              if (stillAssigned.length > 0) {
                console.warn('Some users are still assigned:', stillAssigned);
                // Try to reload data again after another delay
                setTimeout(() => {
                  console.log('Retrying data load after unassignment verification...');
                  this.loadData();
                }, 2000);
              } else {
                console.log('All users successfully unassigned!');
              }
            }
          },
          error: (error) => {
            console.error('Error verifying backend state:', error);
          }
        });
    }, 2000); // Increased to 2 seconds delay
  }

  selectAllAssignable(): void {
    this.getAssignableUsers().forEach(user => {
      user.selectedForAssign = true;
    });
  }

  deselectAllAssignable(): void {
    this.getAssignableUsers().forEach(user => {
      user.selectedForAssign = false;
    });
  }

  selectAllAssignableByRole(): void {
    if (!this.selectedRoleFilter) return;
    this.getAssignableUsers()
      .filter(user => user.roles?.some((role: any) => role.name === this.selectedRoleFilter))
      .forEach(user => {
        user.selectedForAssign = true;
    });
  }

  selectAllAssigned(): void {
    this.getAssignedUsers().forEach(user => {
      user.selectedForUnassign = true;
    });
  }

  selectAllAssignedByRole(): void {
    if (!this.selectedRoleFilter) return;
    this.getAssignedUsers()
      .filter(user => user.roles?.some((role: any) => role.name === this.selectedRoleFilter))
      .forEach(user => {
      user.selectedForUnassign = true;
    });
  }

  deselectAllAssigned(): void {
    this.getAssignedUsers().forEach(user => {
      user.selectedForUnassign = false;
    });
  }

  toggleUserAssign(user: any): void {
    user.selectedForAssign = !user.selectedForAssign;
  }

  toggleUserUnassign(user: any): void {
    user.selectedForUnassign = !user.selectedForUnassign;
  }

  private filterUsers(searchTerm: string): void {
    const term = searchTerm.toLowerCase();
    const roleFilter = this.selectedRoleFilter;

    this.allUsers.forEach(user => {
      let matchesSearch = true;
      let matchesRole = true;

      // Apply search filter
      if (term) {
        matchesSearch = 
        user.first_Name.toLowerCase().includes(term) ||
        user.last_Name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.roles?.some((role: any) => role.name?.toLowerCase().includes(term));
      }

      // Apply role filter
      if (roleFilter) {
        matchesRole = user.roles?.some((role: any) => role.name === roleFilter) || false;
      }

      user.filtered = matchesSearch && matchesRole;
    });
  }

  loadData(): void {
    this.isLoading = true;
    console.log('Loading data for form:', this.data.formId);
    
    // Load both assigned users and all users in parallel
    forkJoin({
      assignedUsers: this.formService.getAssignedUsers(this.data.formId).pipe(
        catchError(error => {
          console.error('Error loading assigned users:', error);
          return of([] as number[]);
        })
      ),
      allUsers: this.userService.getAllUsers(0, 1000).pipe(
        map(page => page.content),
        catchError(error => {
          console.error('Error loading users:', error);
          this.toastr.error('Failed to load users');
          return of([]);
        })
      )
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: ({ assignedUsers, allUsers }) => {
        this.assignedUserIds = Array.isArray(assignedUsers) ? assignedUsers : [];
        console.log('Loaded data:', {
          assignedUserIds: this.assignedUserIds,
          totalUsers: allUsers.length,
          assignedUsersCount: this.assignedUserIds.length
        });
        
        // Process all users and mark assigned ones
        this.allUsers = allUsers.map(user => ({
          ...user,
          selectedForAssign: false,
          selectedForUnassign: false,
          isAssigned: this.assignedUserIds.includes(user.id || 0),
          filtered: true
        }));
        
        console.log('Processed users:', {
          totalUsers: this.allUsers.length,
          assignedUsers: this.allUsers.filter(u => u.isAssigned).length,
          availableUsers: this.allUsers.filter(u => !u.isAssigned).length
        });
        
        this.filterUsers(this.searchTerm);
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.toastr.error('Failed to load user data');
        this.allUsers = [];
      }
    });
  }

  getAssignableUsers() {
    return this.allUsers.filter(user => !user.isAssigned && user.filtered);
  }

  getAssignedUsers() {
    return this.allUsers.filter(user => user.isAssigned && user.filtered);
  }

  hasSelectedUsersForAssign(): boolean {
    return this.getAssignableUsers().some(user => user.selectedForAssign);
  }

  hasSelectedUsersForUnassign(): boolean {
    return this.getAssignedUsers().some(user => user.selectedForUnassign);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAssign(): void {
    const selectedUsers = this.getAssignableUsers().filter(user => user.selectedForAssign);
    
    if (selectedUsers.length === 0) {
      this.toastr.warning('Please select at least one user to assign');
      return;
    }

    // Additional validation
    if (!this.data.formId || this.data.formId <= 0) {
      this.toastr.error('Invalid form ID');
      return;
    }

    const userIds = selectedUsers.map(user => user.id);
    const invalidUserIds = userIds.filter(id => !id || id <= 0);
    if (invalidUserIds.length > 0) {
      this.toastr.error('Invalid user IDs detected');
      return;
    }

    this.isProcessing = true;
    
    console.log('Assigning users to form:', { 
      formId: this.data.formId, 
      userIds, 
      userCount: userIds.length,
      formName: this.data.formName 
    });
    
    this.formService.assignUsersToForm(this.data.formId, userIds)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error assigning users:', error);
          this.toastr.error(`Failed to assign users: ${error.error?.message || error.message || 'Unknown error'}`);
          return of(null);
        }),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: (result) => {
          console.log('Assign result:', result);
          this.toastr.success(`Successfully assigned ${selectedUsers.length} user(s) to "${this.data.formName}". They are now in the Assigned Users tab.`);
          
          // Immediately update local state for better UX
          selectedUsers.forEach(user => {
            user.isAssigned = true;
            user.selectedForAssign = false;
          });
          
          // Reload data to ensure we have the latest assignment state from backend
          this.loadData();
          // Verify backend state
          this.verifyBackendState('assign', userIds);
          // Switch to Assigned Users tab to show the newly assigned users
          this.selectedTabIndex = 1;
        },
        error: (error) => {
          console.error('Error in assign operation:', error);
          this.toastr.error(`Failed to assign users: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      });
  }

  onUnassign(): void {
    const selectedUsers = this.getAssignedUsers().filter(user => user.selectedForUnassign);
    
    if (selectedUsers.length === 0) {
      this.toastr.warning('Please select at least one user to unassign');
      return;
    }

    // Additional validation
    if (!this.data.formId || this.data.formId <= 0) {
      this.toastr.error('Invalid form ID');
      return;
    }

    const userIds = selectedUsers.map(user => user.id);
    const invalidUserIds = userIds.filter(id => !id || id <= 0);
    if (invalidUserIds.length > 0) {
      this.toastr.error('Invalid user IDs detected');
      return;
    }

    this.isProcessing = true;
    
    console.log('Unassigning users from form:', { 
      formId: this.data.formId, 
      userIds, 
      userCount: userIds.length,
      formName: this.data.formName 
    });
    
    // Unassign each selected user with proper error handling
    const unassignObservables = selectedUsers.map(user => 
      this.formService.unassignUserFromForm(this.data.formId, user.id)
        .pipe(
          catchError(error => {
            console.error(`Error unassigning user ${user.id}:`, error);
            return of({ error: true, userId: user.id, message: error.error?.message || error.message });
          })
        )
    );

    forkJoin(unassignObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          console.log('Unassign results:', results);
          const errors = results.filter(result => (result as any).error);
          const successCount = results.length - errors.length;
          
          if (successCount > 0) {
            this.toastr.success(`Successfully removed ${successCount} user(s) from "${this.data.formName}". They are now in the Available Users tab.`);
            
            // Immediately update local state for better UX
            selectedUsers.forEach(user => {
              user.isAssigned = false;
              user.selectedForUnassign = false;
            });
            
            // Reload data to ensure we have the latest assignment state from backend
            this.loadData();
            // Verify backend state
            this.verifyBackendState('unassign', userIds);
            // Switch to Available Users tab to show available users
            this.selectedTabIndex = 0;
          }
          
          if (errors.length > 0) {
            const errorMessages = errors.map(e => (e as any).message).filter(m => m);
            const errorText = errorMessages.length > 0 ? errorMessages.join(', ') : 'Unknown error';
            this.toastr.error(`Failed to unassign ${errors.length} user(s): ${errorText}`);
          }
        },
        error: (error) => {
          console.error('Error in unassign operation:', error);
          this.toastr.error(`Failed to unassign users: ${error.error?.message || error.message || 'Unknown error'}`);
        },
        complete: () => {
          this.isProcessing = false;
        }
      });
  }
}
