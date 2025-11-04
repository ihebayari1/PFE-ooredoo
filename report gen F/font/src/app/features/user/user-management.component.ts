import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

import { User, Role, Enterprise, POS, UserType } from '../../core/models/enterprise.model';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import { EnterpriseService } from '../../core/services/enterprise.service';
import { POSService } from '../../core/services/pos.service';
import { DialogService } from '../../shared/services/dialog.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatTabsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: Role[] = [];
  enterprises: Enterprise[] = [];
  posList: POS[] = [];
  displayedColumns: string[] = ['select', 'name', 'email', 'userType', 'enterprise', 'pos', 'roles', 'status', 'actions'];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  selectedUser: User | null = null;
  selectedTabIndex = 0;
  searchQuery = '';
  selectedUsers: Set<number> = new Set();

  userForm: FormGroup;
  userTypes = Object.values(UserType);
  hidePin = true;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private enterpriseService: EnterpriseService,
    private posService: POSService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      first_Name: ['', [Validators.required, Validators.minLength(2)]],
      last_Name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      birthdate: [''],
      userType: [UserType.INTERNAL, Validators.required],
      enabled: [true],
      accountLocked: [false],
      enterpriseId: [null],
      posCode: [''],
      roleId: [null],
      pin: ['', [Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]{4}$')]]
    });
  }

  ngOnInit(): void {
    // Parallelize all API calls to reduce total load time
    forkJoin({
      users: this.userService.getAllUsers(),
      roles: this.roleService.getAllRoles(),
      enterprises: this.enterpriseService.getAllEnterprises(),
      pos: this.posService.getAllPOS()
    }).subscribe({
      next: (data) => {
        this.users = data.users.content;
        this.filteredUsers = data.users.content;
        this.roles = data.roles.content;
        this.enterprises = data.enterprises.content;
        this.posList = data.pos.content;
        this.isLoading = false;
        this.cdr.markForCheck(); // Trigger change detection for OnPush
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading data. Please refresh the page.', 'Close', { duration: 5000 });
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (page) => {
        this.users = page.content;
        this.filteredUsers = page.content;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        let errorMessage = 'Failed to load users. Please refresh the page.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to view users.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  searchUsers(): void {
    if (this.searchQuery.trim()) {
      this.userService.searchUsers(this.searchQuery).subscribe({
        next: (page) => {
          this.filteredUsers = page.content;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          let errorMessage = 'Failed to search users. Please try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to search users.';
          } else if (error.status === 0 || error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    } else {
      this.filteredUsers = this.users;
    }
  }

  onSearchChange(): void {
    this.searchUsers();
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedUsers = new Set(this.filteredUsers.map(user => user.id!));
    } else {
      this.selectedUsers.clear();
    }
  }

  onSelectUser(userId: number, checked: boolean): void {
    if (checked) {
      this.selectedUsers.add(userId);
    } else {
      this.selectedUsers.delete(userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUsers.has(userId);
  }

  isAllSelected(): boolean {
    return this.filteredUsers.length > 0 && this.selectedUsers.size === this.filteredUsers.length;
  }

  isIndeterminate(): boolean {
    return this.selectedUsers.size > 0 && this.selectedUsers.size < this.filteredUsers.length;
  }

  onBulkDelete(): void {
    if (this.selectedUsers.size === 0) {
      this.snackBar.open('Please select users to delete', 'Close', { duration: 3000 });
      return;
    }

    this.dialogService.confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${this.selectedUsers.size} selected user(s)? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        const userIds = Array.from(this.selectedUsers);
        
        // Optimistic update: Remove users from UI immediately
        const usersToDelete = this.users.filter(u => userIds.includes(u.id!));
        const originalUsers = [...this.users];
        const originalFiltered = [...this.filteredUsers];
        
        this.users = this.users.filter(u => !userIds.includes(u.id!));
        this.filteredUsers = this.filteredUsers.filter(u => !userIds.includes(u.id!));
        this.selectedUsers.clear();
        
        this.userService.bulkDeleteUsers(userIds).subscribe({
        next: () => {
          this.snackBar.open('Users deleted successfully', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
        },
        error: (error) => {
          // Rollback on error: restore original state
          this.users = originalUsers;
          this.filteredUsers = originalFiltered;
          this.selectedUsers = new Set(userIds);
          
          console.error('Error deleting users:', error);
          let errorMessage = 'Failed to delete users. Please try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to delete users.';
          } else if (error.status === 409) {
            errorMessage = 'Cannot delete some users. They may have active assignments or dependencies.';
          } else if (error.status === 0 || error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        }
        });
      }
    });
  }

  onBulkUpdateStatus(enabled: boolean): void {
    if (this.selectedUsers.size === 0) {
      this.snackBar.open('Please select users to update', 'Close', { duration: 3000 });
      return;
    }

    const userIds = Array.from(this.selectedUsers);
    
    // Optimistic update: Update UI immediately
    this.users.forEach(u => {
      if (userIds.includes(u.id!)) {
        u.enabled = enabled;
      }
    });
    this.filteredUsers.forEach(u => {
      if (userIds.includes(u.id!)) {
        u.enabled = enabled;
      }
    });
    const originalUsers = this.users.map(u => ({ ...u }));
    
    this.selectedUsers.clear();
    
    this.userService.bulkUpdateUserStatus(userIds, enabled).subscribe({
      next: () => {
        this.snackBar.open(`Users ${enabled ? 'enabled' : 'disabled'} successfully`, 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      },
      error: (error) => {
        // Rollback on error: restore original state
        this.users = originalUsers.map(u => ({ ...u }));
        this.filteredUsers = this.users.filter(u => 
          this.filteredUsers.some(fu => fu.id === u.id)
        );
        this.selectedUsers = new Set(userIds);
        
        console.error('Error updating user status:', error);
        let errorMessage = 'Failed to update user status. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to update user status.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (page) => {
        this.roles = page.content;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  loadEnterprises(): void {
    this.enterpriseService.getAllEnterprises().subscribe({
      next: (page) => {
        this.enterprises = page.content;
      },
      error: (error) => {
        console.error('Error loading enterprises:', error);
      }
    });
  }

  loadPOS(): void {
    this.posService.getAllPOS().subscribe({
      next: (page) => {
        this.posList = page.content;
      },
      error: (error) => {
        console.error('Error loading POS:', error);
      }
    });
  }

  onCreateUser(): void {
    this.showCreateForm = true;
    this.selectedTabIndex = 0;
    this.userForm.reset();
    this.userForm.patchValue({
      userType: UserType.INTERNAL,
      enabled: true,
      accountLocked: false
    });
  }

  onEditUser(user: User): void {
    this.selectedUser = user;
    this.showEditForm = true;
    this.selectedTabIndex = 0;
    this.userForm.patchValue({
      first_Name: user.first_Name,
      last_Name: user.last_Name,
      email: user.email,
      birthdate: user.birthdate,
      userType: user.userType,
      enabled: user.enabled,
      accountLocked: user.accountLocked,
      enterpriseId: user.enterprise?.id,
      posCode: user.pos_Code,
      roleId: user.role?.id || null,
      pin: user.pin || ''
    });
  }

  onSubmitForm(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      
      if (this.showCreateForm) {
        this.createUser(formData);
      } else if (this.showEditForm && this.selectedUser) {
        this.updateUser(this.selectedUser.id!, formData);
      }
    }
  }

  createUser(formData: any): void {
    const userData = {
      ...formData,
      // Map enterpriseId to enterprise object
      enterprise: formData.enterpriseId ? { id: formData.enterpriseId } : null,
      // Map roleId to role object
      role: formData.roleId ? { id: formData.roleId } : null,
      // Remove enterpriseId and roleId from the data since we're using objects
      enterpriseId: undefined,
      roleId: undefined,
      // No password - user will set it via email activation
    };

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        // Optimistic update: Add new user to list
        this.users = [user, ...this.users];
        this.filteredUsers = [user, ...this.filteredUsers];
        
        this.snackBar.open('User created successfully! Password setup email sent.', 'Close', { duration: 5000 });
        this.cdr.markForCheck();
        this.showCreateForm = false;
        this.userForm.reset();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        let errorMessage = 'Failed to create user. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid user data. Please check all required fields and ensure email format is correct.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create users.';
        } else if (error.status === 409) {
          errorMessage = 'Email address already exists. Please use a different email.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  updateUser(id: number, formData: any): void {
    const userData = {
      ...formData,
      // Map enterpriseId to enterprise object
      enterprise: formData.enterpriseId ? { id: formData.enterpriseId } : null,
      // Map roleId to role object
      role: formData.roleId ? { id: formData.roleId } : null,
      // Remove enterpriseId and roleId from the data since we're using objects
      enterpriseId: undefined,
      roleId: undefined,
    };

    this.userService.updateUser(id, userData).subscribe({
      next: (user) => {
        // Optimistic update: Update user in list
        const index = this.users.findIndex(u => u.id === id);
        if (index > -1) {
          this.users[index] = user;
        }
        const filteredIndex = this.filteredUsers.findIndex(u => u.id === id);
        if (filteredIndex > -1) {
          this.filteredUsers[filteredIndex] = user;
        }
        
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
        this.showEditForm = false;
        this.selectedUser = null;
        this.userForm.reset();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        let errorMessage = 'Failed to update user. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid user data. Please check all required fields.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to update this user.';
        } else if (error.status === 404) {
          errorMessage = 'User not found. It may have been deleted.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  onDeleteUser(user: User): void {
    this.dialogService.confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.first_Name} ${user.last_Name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        // Optimistic update: Remove user from UI immediately
        const originalUsers = [...this.users];
        const originalFiltered = [...this.filteredUsers];
        this.users = this.users.filter(u => u.id !== user.id);
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
        
        this.userService.deleteUser(user.id!).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.cdr.markForCheck();
        },
      error: (error) => {
        // Rollback on error: restore original state
        this.users = originalUsers;
        this.filteredUsers = originalFiltered;
        
        console.error('Error deleting user:', error);
        let errorMessage = 'Failed to delete user. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to delete this user.';
        } else if (error.status === 404) {
          errorMessage = 'User not found. It may have already been deleted.';
        } else if (error.status === 409) {
          errorMessage = 'Cannot delete user. User may have active assignments or dependencies.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
        });
      }
    });
  }

  onAssignRoles(user: User, roleIds: number[]): void {
    this.userService.assignRolesToUser(user.id!, roleIds).subscribe({
      next: (updatedUser) => {
        this.snackBar.open('Roles assigned successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error assigning roles:', error);
        this.snackBar.open('Error assigning roles', 'Close', { duration: 3000 });
      }
    });
  }

  onAssignRole(user: User, roleId: number): void {
    this.userService.assignRoleToUser(user.id!, roleId).subscribe({
      next: (updatedUser) => {
        this.snackBar.open('Role assigned successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error assigning role:', error);
        this.snackBar.open('Error assigning role', 'Close', { duration: 3000 });
      }
    });
  }

  onRemoveRole(user: User, roleId: number): void {
    this.userService.removeRoleFromUser(user.id!, roleId).subscribe({
      next: (updatedUser) => {
        this.snackBar.open('Role removed successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error removing role:', error);
        this.snackBar.open('Error removing role', 'Close', { duration: 3000 });
      }
    });
  }

  getUserAvailableRoles(user: User): Role[] {
    // Return all roles except the one currently assigned to the user
    if (user.role?.id) {
      return this.roles.filter(role => role.id !== user.role?.id);
    }
    return this.roles;
  }

  hasRole(user: User, roleId: number): boolean {
    return user.role?.id === roleId || false;
  }

  onLinkToPOS(user: User, posCode: string): void {
    this.userService.linkUserToPOS(user.id!, posCode).subscribe({
      next: (updatedUser) => {
        this.snackBar.open('User linked to POS successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error linking user to POS:', error);
        this.snackBar.open('Error linking user to POS', 'Close', { duration: 3000 });
      }
    });
  }

  onUnlinkFromPOS(user: User): void {
    this.userService.unlinkUserFromPOS(user.id!).subscribe({
      next: (updatedUser) => {
        this.snackBar.open('User unlinked from POS successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error unlinking user from POS:', error);
        this.snackBar.open('Error unlinking user from POS', 'Close', { duration: 3000 });
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedUser = null;
    this.userForm.reset();
  }

  getUserName(user: User): string {
    return `${user.first_Name} ${user.last_Name}`;
  }

  getEnterpriseName(user: User): string {
    return user.enterprise?.enterpriseName || 'No Enterprise';
  }

  getPOSName(user: User): string {
    return user.pos?.posName || 'No POS';
  }

  getRoleNames(user: User): string[] {
    return user.role ? [user.role.name] : [];
  }

  getUserStatus(user: User): string {
    if (user.accountLocked) return 'Locked';
    if (!user.enabled) return 'Disabled';
    return 'Active';
  }

  getUserStatusColor(user: User): string {
    if (user.accountLocked) return 'warn';
    if (!user.enabled) return 'accent';
    return 'primary';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getActiveUsersCount(): number {
    return this.users.filter(user => user.enabled && !user.accountLocked).length;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  }

  getTypeIcon(userType: string): string {
    switch (userType) {
      case 'POS': return 'store';
      case 'INTERNAL': return 'person';
      case 'USER_ADMIN': return 'admin_panel_settings';
      default: return 'person';
    }
  }

  removeRoleFromSelection(roleId: number): void {
    const currentRoles = this.userForm.get('roleIds')?.value || [];
    const updatedRoles = currentRoles.filter((id: number) => id !== roleId);
    this.userForm.patchValue({ roleIds: updatedRoles });
  }

  togglePinVisibility() {
    this.hidePin = !this.hidePin;
    this.cdr.markForCheck();
  }
}
