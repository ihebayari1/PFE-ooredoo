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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { Enterprise, User, UserInfoDTO } from '../../core/models/enterprise.model';
import { EnterpriseService } from '../../core/services/enterprise.service';
import { UserService } from '../../core/services/user.service';
import { UserAssignmentDialogComponent } from '../../shared/components/user-assignment-dialog.component';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-enterprise-management',
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
    MatCheckboxModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './enterprise-management.component.html',
  styleUrls: ['./enterprise-management.component.scss']
})
export class EnterpriseManagementComponent implements OnInit {
  enterprises: Enterprise[] = [];
  users: User[] = [];
  enterpriseAdmins: UserInfoDTO[] = [];
  displayedColumns: string[] = ['select', 'name', 'manager', 'usersCount', 'createdDate', 'actions'];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  selectedEnterprise: Enterprise | null = null;
  selectedEnterprises: Set<number> = new Set();
  showBulkActions = false;

  enterpriseForm: FormGroup;

  constructor(
    private enterpriseService: EnterpriseService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.enterpriseForm = this.fb.group({
      enterpriseName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      logoUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      primaryColor: ['#1976d2', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      secondaryColor: ['#42a5f5', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      managerId: [null]
    });
  }

  ngOnInit(): void {
    this.loadEnterprises();
    this.loadUsers();
  }

  loadEnterprises(): void {
    this.isLoading = true;
    this.enterpriseService.getAllEnterprises().subscribe({
      next: (page) => {
        this.enterprises = page.content;
        this.isLoading = false;
        this.cdr.markForCheck(); // Trigger change detection for OnPush
      },
      error: (error) => {
        this.handleApiError(error, 'loading enterprises');
        this.isLoading = false;
      }
    });
  }

  loadUsers(): void {
    // Optimized: Only load ENTERPRISE_ADMIN users for manager dropdown instead of all users
    this.userService.getUsersByRole('ENTERPRISE_ADMIN', 0, 100).subscribe({
      next: (page) => {
        // Map to UserInfoDTO for manager dropdown
        this.enterpriseAdmins = page.content.map(user => ({
          id: user.id,
          first_Name: user.first_Name,
          last_Name: user.last_Name,
          email: user.email,
          birthdate: user.birthdate,
          enabled: user.enabled,
          accountLocked: user.accountLocked,
          pos_Code: user.pos_Code,
          userType: user.userType,
          role: user.role,
          created_Date: user.created_Date,
          updated_Date: user.updated_Date
        }));
        
        // Debug logging
        console.log('Enterprise admins loaded:', this.enterpriseAdmins.length);
        this.cdr.markForCheck(); // Trigger change detection for OnPush
      },
      error: (error) => {
        console.error('Error loading enterprise admins:', error);
        // Fallback: Load all users if role-based query fails
        this.userService.getAllUsers(0, 100).subscribe({
          next: (page) => {
            this.enterpriseAdmins = page.content
              .filter(user => user.role && user.role.name === 'ENTERPRISE_ADMIN')
              .map(user => ({
                id: user.id,
                first_Name: user.first_Name,
                last_Name: user.last_Name,
                email: user.email,
                birthdate: user.birthdate,
                enabled: user.enabled,
                accountLocked: user.accountLocked,
                pos_Code: user.pos_Code,
                userType: user.userType,
                role: user.role,
                created_Date: user.created_Date,
                updated_Date: user.updated_Date
              }));
          }
        });
      }
    });
  }

  onCreateEnterprise(): void {
    this.showCreateForm = true;
    this.enterpriseForm.reset();
    this.enterpriseForm.patchValue({
      primaryColor: '#1976d2',
      secondaryColor: '#42a5f5'
    });
  }

  onEditEnterprise(enterprise: Enterprise): void {
    this.selectedEnterprise = enterprise;
    this.showEditForm = true;
    this.enterpriseForm.patchValue({
      enterpriseName: enterprise.enterpriseName,
      logoUrl: enterprise.logoUrl,
      primaryColor: enterprise.primaryColor,
      secondaryColor: enterprise.secondaryColor,
      managerId: enterprise.manager?.id
    });
  }

  onSubmitForm(): void {
    if (this.enterpriseForm.valid) {
      const formData = this.enterpriseForm.value;
      console.log('Form data:', formData);
      console.log('Manager ID selected:', formData.managerId);
      
      if (this.showCreateForm) {
        this.createEnterprise(formData);
      } else if (this.showEditForm && this.selectedEnterprise) {
        this.updateEnterprise(this.selectedEnterprise.id!, formData);
      }
    }
  }

  createEnterprise(formData: any): void {
    const enterpriseData: any = {
      enterpriseName: formData.enterpriseName,
      logoUrl: formData.logoUrl,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      managerId: formData.managerId
    };
    
    console.log('Sending enterprise data:', enterpriseData);
    
    this.enterpriseService.createEnterprise(enterpriseData).subscribe({
      next: (enterprise) => {
        // Optimistic update: Add new enterprise to list immediately
        this.enterprises = [enterprise, ...this.enterprises];
        this.cdr.markForCheck();
        
        this.snackBar.open('Enterprise created successfully', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.showCreateForm = false;
        this.enterpriseForm.reset();
      },
      error: (error) => {
        this.handleApiError(error, 'creating enterprise');
      }
    });
  }

  updateEnterprise(id: number, formData: any): void {
    const enterpriseData: any = {
      enterpriseName: formData.enterpriseName,
      logoUrl: formData.logoUrl,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      managerId: formData.managerId
    };
    
    this.enterpriseService.updateEnterprise(id, enterpriseData).subscribe({
      next: (enterprise) => {
        // Optimistic update: Update enterprise in list immediately
        const index = this.enterprises.findIndex(e => e.id === id);
        if (index > -1) {
          this.enterprises[index] = enterprise;
        }
        this.cdr.markForCheck();
        
        this.snackBar.open('Enterprise updated successfully', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.showEditForm = false;
        this.selectedEnterprise = null;
        this.enterpriseForm.reset();
      },
      error: (error) => {
        this.handleApiError(error, 'updating enterprise');
      }
    });
  }

  onDeleteEnterprise(enterprise: Enterprise): void {
    this.dialogService.confirm({
      title: 'Delete Enterprise',
      message: `Are you sure you want to delete "${enterprise.enterpriseName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        // Optimistic update: Remove enterprise from UI immediately
        const originalEnterprises = [...this.enterprises];
        this.enterprises = this.enterprises.filter(e => e.id !== enterprise.id);
        this.cdr.markForCheck();
        
        this.enterpriseService.deleteEnterprise(enterprise.id!).subscribe({
          next: () => {
            this.snackBar.open('Enterprise deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            // Rollback on error: restore original state
            this.enterprises = originalEnterprises;
            this.cdr.markForCheck();
            
            console.error('Error deleting enterprise:', error);
            let errorMessage = 'Failed to delete enterprise. Please try again.';
            
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.error) {
              errorMessage = error.error.error;
            } else if (error.status === 403) {
              errorMessage = 'You do not have permission to delete this enterprise.';
            } else if (error.status === 404) {
              errorMessage = 'Enterprise not found. It may have already been deleted.';
            } else if (error.status === 409) {
              errorMessage = 'Cannot delete enterprise. It may have associated users. Please reassign them first.';
            } else if (error.status === 0 || error.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            }
            
            this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }

  // User Assignment Methods
  onAssignUsersToEnterprise(enterprise: Enterprise): void {
    const dialogRef = this.dialog.open(UserAssignmentDialogComponent, {
      width: '600px',
      data: { enterprise, mode: 'assign' }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.loadEnterprises();
      }
    });
  }

  onRemoveUsersFromEnterprise(enterprise: Enterprise): void {
    const dialogRef = this.dialog.open(UserAssignmentDialogComponent, {
      width: '600px',
      data: { enterprise, mode: 'unassign' }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.loadEnterprises();
      }
    });
  }

  onViewEnterpriseUsers(enterprise: Enterprise): void {
    const dialogRef = this.dialog.open(UserAssignmentDialogComponent, {
      width: '600px',
      data: { enterprise, mode: 'unassign' }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // Just for viewing, no action needed
    });
  }

  // Bulk Operations
  toggleEnterpriseSelection(enterprise: Enterprise): void {
    if (this.selectedEnterprises.has(enterprise.id!)) {
      this.selectedEnterprises.delete(enterprise.id!);
    } else {
      this.selectedEnterprises.add(enterprise.id!);
    }
    this.updateBulkActionsVisibility();
  }

  toggleAllEnterprisesSelection(): void {
    if (this.selectedEnterprises.size === this.enterprises.length) {
      this.selectedEnterprises.clear();
    } else {
      this.enterprises.forEach(enterprise => {
        this.selectedEnterprises.add(enterprise.id!);
      });
    }
    this.updateBulkActionsVisibility();
  }

  isEnterpriseSelected(enterprise: Enterprise): boolean {
    return this.selectedEnterprises.has(enterprise.id!);
  }

  isAllEnterprisesSelected(): boolean {
    return this.enterprises.length > 0 && this.selectedEnterprises.size === this.enterprises.length;
  }

  updateBulkActionsVisibility(): void {
    this.showBulkActions = this.selectedEnterprises.size > 0;
  }

  onBulkDeleteEnterprises(): void {
    const selectedCount = this.selectedEnterprises.size;
    if (selectedCount === 0) {
      this.snackBar.open('Please select enterprises to delete', 'Close', { duration: 3000 });
      return;
    }

    this.dialogService.confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${selectedCount} selected enterprise(s)? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        const enterpriseIds = Array.from(this.selectedEnterprises);
        // Optimistic update: Remove enterprises from UI immediately
        const originalEnterprises = [...this.enterprises];
        this.enterprises = this.enterprises.filter(e => !enterpriseIds.includes(e.id!));
        this.selectedEnterprises.clear();
        this.updateBulkActionsVisibility();
        this.cdr.markForCheck();
        
        this.enterpriseService.bulkDeleteEnterprises(enterpriseIds).subscribe({
          next: () => {
            this.snackBar.open(`${selectedCount} enterprise(s) deleted successfully`, 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error bulk deleting enterprises:', error);
            let errorMessage = 'Failed to delete enterprises. Please try again.';
            
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.error) {
              errorMessage = error.error.error;
            } else if (error.status === 403) {
              errorMessage = 'You do not have permission to delete enterprises.';
            } else if (error.status === 409) {
              errorMessage = 'Cannot delete some enterprises. They may have associated users.';
            } else if (error.status === 0 || error.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            }
            
            this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }

  onBulkAssignUsers(): void {
    if (this.selectedEnterprises.size === 0) return;
    
    // For now, we'll assign users to the first selected enterprise
    // In a more advanced implementation, you might want to create a multi-enterprise assignment dialog
    const firstEnterprise = this.enterprises.find(e => this.selectedEnterprises.has(e.id!));
    if (firstEnterprise) {
      this.onAssignUsersToEnterprise(firstEnterprise);
    }
  }

  clearSelection(): void {
    this.selectedEnterprises.clear();
    this.updateBulkActionsVisibility();
  }

  // Form Validation Methods
  getFieldError(fieldName: string): string {
    const field = this.enterpriseForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldLabel(fieldName)} format is invalid`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      enterpriseName: 'Enterprise Name',
      logoUrl: 'Logo URL',
      primaryColor: 'Primary Color',
      secondaryColor: 'Secondary Color',
      managerId: 'Manager'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.enterpriseForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  // Enhanced Error Handling
  handleApiError(error: any, operation: string): void {
    console.error(`Error ${operation}:`, error);
    let errorMessage = `Failed to ${operation}. Please try again.`;
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.message && error.message !== 'Http failure response') {
      errorMessage = error.message;
    }
    
    // Add context-specific messages based on HTTP status
    if (error.status === 400) {
      errorMessage = `Invalid data for ${operation}. Please check all required fields.`;
    } else if (error.status === 403) {
      errorMessage = `You do not have permission to ${operation}.`;
    } else if (error.status === 404) {
      errorMessage = `Resource not found. It may have been deleted.`;
    } else if (error.status === 409) {
      errorMessage = `Conflict: ${operation} cannot be completed. The resource may already exist or have dependencies.`;
    } else if (error.status === 0 || error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    this.snackBar.open(errorMessage, 'Close', { 
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedEnterprise = null;
    this.enterpriseForm.reset();
  }

  getManagerName(enterprise: Enterprise): string {
    return enterprise.manager ? `${enterprise.manager.first_Name} ${enterprise.manager.last_Name}` : 'No Manager';
  }

  getUsersCount(enterprise: Enterprise): number {
    // Use the usersCount from backend if available, otherwise calculate from usersInEnterprise
    if (enterprise.usersCount !== undefined) {
      return enterprise.usersCount;
    }
    return enterprise.usersInEnterprise ? enterprise.usersInEnterprise.length : 0;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    
    console.log('Formatting date:', dateString, 'Type:', typeof dateString);
    
    try {
      // Handle different date formats
      let date: Date;
      
      if (typeof dateString === 'string') {
        // Try parsing as ISO string first
        if (dateString.includes('T')) {
          date = new Date(dateString);
        } else {
          // Handle other formats
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return 'N/A';
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'N/A';
    }
  }

  hasEnterpriseAdminRole(user: UserInfoDTO): boolean {
    return !!(user.role && user.role.name === 'ENTERPRISE_ADMIN');
  }

  loadUsersForEnterprise(enterprise: Enterprise): void {
    if (!enterprise.id) return;
    this.enterpriseService.getUsersInEnterprise(enterprise.id, 0, 1000).subscribe({
      next: (page) => {
        enterprise.usersInEnterprise = page.content.map(user => ({
          id: user.id,
          first_Name: user.first_Name,
          last_Name: user.last_Name,
          email: user.email,
          birthdate: user.birthdate,
          enabled: user.enabled,
          accountLocked: user.accountLocked,
          pos_Code: user.pos_Code,
          userType: user.userType,
          role: user.role,
          created_Date: user.created_Date,
          updated_Date: user.updated_Date
        }));
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading enterprise users:', error);
      }
    });
  }
}
