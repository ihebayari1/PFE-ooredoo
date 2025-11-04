import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';

import { Role, RoleAction, User } from '../../core/models/enterprise.model';
import { RoleService } from '../../core/services/role.service';
import { RoleActionService } from '../../core/services/role-action.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTabsModule,
    MatExpansionModule
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  roleActions: RoleAction[] = [];
  users: User[] = [];
  displayedColumns: string[] = ['name', 'actions', 'usersCount', 'createdDate', 'actions'];
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isDeleting = false;
  isAssigning = false;
  showCreateForm = false;
  showEditForm = false;
  selectedRole: Role | null = null;
  selectedTabIndex = 0;
  expandedRoleId: number | null = null;
  selectedPermissions: Set<number> = new Set();
  searchQuery = '';

  roleForm: FormGroup;

  constructor(
    private roleService: RoleService,
    private roleActionService: RoleActionService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      actionIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadRoleActions();
    this.loadUsers();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.roleService.getAllRoles().subscribe({
      next: (page) => {
        this.roles = page.content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.snackBar.open('Error loading roles', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadRoleActions(): void {
    this.roleActionService.getAllRoleActions().subscribe({
      next: (roleActions) => {
        this.roleActions = roleActions;
      },
      error: (error) => {
        console.error('Error loading role actions:', error);
      }
    });
  }

  onCreateRole(): void {
    this.showCreateForm = true;
    this.roleForm.reset();
  }

  onEditRole(role: Role): void {
    this.selectedRole = role;
    this.showEditForm = true;
    this.selectedPermissions.clear();
    
    // Set selected permissions
    if (role.actions) {
      role.actions.forEach(action => {
        if (action.id) {
          this.selectedPermissions.add(action.id);
        }
      });
    }
    
    this.roleForm.patchValue({
      name: role.name,
      actionIds: Array.from(this.selectedPermissions)
    });
  }

  onSubmitForm(): void {
    if (this.roleForm.valid) {
      const formData = this.roleForm.value;
      
      if (this.showCreateForm) {
        this.createRole(formData);
      } else if (this.showEditForm && this.selectedRole) {
        this.updateRole(this.selectedRole.id!, formData);
      }
    }
  }

  createRole(formData: any): void {
    this.isCreating = true;
    const roleData = {
      name: formData.name
    };
    
    this.roleService.createRole(roleData).subscribe({
      next: (role) => {
        // After creating the role, assign actions if any are selected
        if (formData.actionIds && formData.actionIds.length > 0) {
          const selectedActions = this.roleActions.filter(action => 
            formData.actionIds.includes(action.id)
          );
          this.roleService.assignActionsToRole(role.id!, selectedActions).subscribe({
            next: () => {
              this.isCreating = false;
              this.snackBar.open('Role created successfully with permissions', 'Close', { duration: 3000 });
              this.loadRoles();
              this.showCreateForm = false;
              this.roleForm.reset();
              this.selectedPermissions.clear();
            },
            error: (error) => {
              this.isCreating = false;
              console.error('Error assigning actions to role:', error);
              this.snackBar.open('Role created but failed to assign permissions: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
              this.loadRoles();
              this.showCreateForm = false;
              this.roleForm.reset();
              this.selectedPermissions.clear();
            }
          });
        } else {
          this.isCreating = false;
          this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
          this.loadRoles();
          this.showCreateForm = false;
          this.roleForm.reset();
          this.selectedPermissions.clear();
        }
      },
      error: (error) => {
        this.isCreating = false;
        console.error('Error creating role:', error);
        this.snackBar.open('Error creating role: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
      }
    });
  }

  updateRole(id: number, formData: any): void {
    this.isUpdating = true;
    const roleData = {
      name: formData.name
    };
    
    this.roleService.updateRole(id, roleData).subscribe({
      next: (role) => {
        // After updating the role, assign actions if any are selected
        if (formData.actionIds && formData.actionIds.length > 0) {
          const selectedActions = this.roleActions.filter(action => 
            formData.actionIds.includes(action.id)
          );
          this.roleService.assignActionsToRole(role.id!, selectedActions).subscribe({
            next: () => {
              this.isUpdating = false;
              this.snackBar.open('Role updated successfully with permissions', 'Close', { duration: 3000 });
              this.loadRoles();
              this.showEditForm = false;
              this.selectedRole = null;
              this.roleForm.reset();
              this.selectedPermissions.clear();
            },
            error: (error) => {
              this.isUpdating = false;
              console.error('Error assigning actions to role:', error);
              this.snackBar.open('Role updated but failed to assign permissions: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
              this.loadRoles();
              this.showEditForm = false;
              this.selectedRole = null;
              this.roleForm.reset();
              this.selectedPermissions.clear();
            }
          });
        } else {
          // If no actions selected, we still need to clear existing actions
          this.roleService.assignActionsToRole(role.id!, []).subscribe({
            next: () => {
              this.isUpdating = false;
              this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
              this.loadRoles();
              this.showEditForm = false;
              this.selectedRole = null;
              this.roleForm.reset();
              this.selectedPermissions.clear();
            },
            error: (error) => {
              this.isUpdating = false;
              console.error('Error clearing actions from role:', error);
              this.snackBar.open('Role updated but failed to clear permissions: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
              this.loadRoles();
              this.showEditForm = false;
              this.selectedRole = null;
              this.roleForm.reset();
              this.selectedPermissions.clear();
            }
          });
        }
      },
      error: (error) => {
        this.isUpdating = false;
        console.error('Error updating role:', error);
        this.snackBar.open('Error updating role: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
      }
    });
  }

  onDeleteRole(role: Role): void {
    if (confirm(`Are you sure you want to delete "${role.name}"? This action cannot be undone.`)) {
      this.isDeleting = true;
      this.roleService.deleteRole(role.id!).subscribe({
        next: () => {
          this.isDeleting = false;
          this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
          this.loadRoles();
        },
        error: (error) => {
          this.isDeleting = false;
          console.error('Error deleting role:', error);
          this.snackBar.open('Error deleting role: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
        }
      });
    }
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedRole = null;
    this.roleForm.reset();
    this.selectedPermissions.clear();
  }

  getActionNames(role: Role): string[] {
    return role.actions?.map(action => action.actionKey) || [];
  }

  getUsersCount(role: Role): number {
    return role.users ? role.users.length : 0;
  }

  onPermissionChange(event: any, actionId: number | undefined): void {
    if (!actionId) return;
    
    if (event.checked) {
      this.selectedPermissions.add(actionId);
    } else {
      this.selectedPermissions.delete(actionId);
    }
    
    this.roleForm.get('actionIds')?.setValue(Array.from(this.selectedPermissions));
  }

  isPermissionSelected(actionId: number | undefined): boolean {
    if (!actionId) return false;
    return this.selectedPermissions.has(actionId);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  loadUsers(): void {
    // Load users only when a role is expanded, with reasonable page size
    // This prevents loading 1000+ users unnecessarily
    if (this.expandedRoleId) {
      this.userService.getAllUsers(0, 50).subscribe({
        next: (page) => {
          this.users = page.content;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
    }
  }

  getUsersWithRole(role: Role): User[] {
    return this.users.filter(user => 
      user.role?.id === role.id
    );
  }

  getUsersWithoutRole(role: Role): User[] {
    return this.users.filter(user => 
      !user.role || user.role.id !== role.id
    );
  }

  onAssignRoleToUser(role: Role, userId: number): void {
    this.isAssigning = true;
    
    // Optimistic update: Update user's role in local state
    const userIndex = this.users.findIndex(u => u.id === userId);
    const originalUser = userIndex > -1 ? { ...this.users[userIndex] } : null;
    if (userIndex > -1 && this.users[userIndex]) {
      this.users[userIndex].role = role;
    }
    
    this.userService.assignRoleToUser(userId, role.id!).subscribe({
      next: (updatedUser) => {
        this.isAssigning = false;
        this.snackBar.open(`Role "${role.name}" assigned to user successfully`, 'Close', { duration: 3000 });
        // Update user with server response
        if (userIndex > -1) {
          this.users[userIndex] = updatedUser;
        }
        // Refresh roles to ensure counts are accurate
        this.loadRoles();
      },
      error: (error) => {
        // Rollback on error
        if (userIndex > -1 && originalUser) {
          this.users[userIndex] = originalUser;
        }
        this.isAssigning = false;
        console.error('Error assigning role to user:', error);
        this.snackBar.open('Error assigning role to user: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
      }
    });
  }

  onRemoveRoleFromUser(role: Role, userId: number): void {
    if (confirm(`Are you sure you want to remove "${role.name}" role from this user?`)) {
      this.isAssigning = true;
      
      // Optimistic update: Remove role from user in local state
      const userIndex = this.users.findIndex(u => u.id === userId);
      const originalUser = userIndex > -1 ? { ...this.users[userIndex] } : null;
      if (userIndex > -1 && this.users[userIndex]) {
        this.users[userIndex].role = undefined;
      }
      
      this.userService.removeRoleFromUser(userId, role.id!).subscribe({
        next: (updatedUser) => {
          this.isAssigning = false;
          this.snackBar.open(`Role "${role.name}" removed from user successfully`, 'Close', { duration: 3000 });
          // Update user with server response
          if (userIndex > -1) {
            this.users[userIndex] = updatedUser;
          }
          // Refresh roles to ensure counts are accurate
          this.loadRoles();
        },
        error: (error) => {
          // Rollback on error
          if (userIndex > -1 && originalUser) {
            this.users[userIndex] = originalUser;
          }
          this.isAssigning = false;
          console.error('Error removing role from user:', error);
          this.snackBar.open('Error removing role from user: ' + (error.error?.message || error.message), 'Close', { duration: 5000 });
        }
      });
    }
  }

  toggleRoleExpansion(roleId: number): void {
    const wasExpanded = this.expandedRoleId === roleId;
    this.expandedRoleId = wasExpanded ? null : roleId;
    // Load users when role is expanded for the first time
    if (!wasExpanded && this.expandedRoleId) {
      this.loadUsers();
    }
  }

  isRoleExpanded(roleId: number): boolean {
    return this.expandedRoleId === roleId;
  }

  getUserName(user: User): string {
    return `${user.first_Name} ${user.last_Name}`;
  }

  getUserEmail(user: User): string {
    return user.email;
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getSelectedPermissionsCount(): number {
    return this.selectedPermissions.size;
  }

  getSelectedPermissionIds(): number[] {
    return Array.from(this.selectedPermissions);
  }

  getActionName(actionId: number): string {
    const action = this.roleActions.find(a => a.id === actionId);
    return action ? action.actionKey : 'Unknown';
  }

  onSearchChange(): void {
    // Search functionality is handled by the filteredRoles getter
    // This method can be used for additional search logic if needed
  }

  get filteredRoles(): Role[] {
    if (!this.searchQuery.trim()) {
      return this.roles;
    }
    return this.roles.filter(role => 
      role.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      this.getActionNames(role).some(action => 
        action.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }
}
