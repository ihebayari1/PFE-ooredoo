import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
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

import { POS, Sector, User } from '../../core/models/enterprise.model';
import { POSService } from '../../core/services/pos.service';
import { SectorService } from '../../core/services/sector.service';
import { UserService } from '../../core/services/user.service';
import { EnterpriseService } from '../../core/services/enterprise.service';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-pos-management',
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
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './pos-management.component.html',
  styleUrls: ['./pos-management.component.scss']
})
export class POSManagementComponent implements OnInit {
  posList: POS[] = [];
  sectors: Sector[] = [];
  users: User[] = [];
  availableUsers: User[] = [];
  displayedColumns: string[] = ['name', 'code', 'sector', 'headOfPOS', 'usersCount', 'createdDate', 'actions'];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  showUserAssignment = false;
  selectedPOS: POS | null = null;
  posUsers: User[] = [];
  selectedUsersForAssignment: Set<number> = new Set();

  posForm: FormGroup;

  constructor(
    private posService: POSService,
    private sectorService: SectorService,
    private userService: UserService,
    private enterpriseService: EnterpriseService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogService: DialogService
  ) {
    this.posForm = this.fb.group({
      posName: ['', Validators.required],
      codeOfPOS: ['', Validators.required],
      sectorId: [null, Validators.required],
      headOfPOSId: [null]
    });
  }

  ngOnInit(): void {
    this.loadPOS();
    this.loadSectors();
    this.loadUsers();
  }

  loadPOS(): void {
    this.isLoading = true;
    this.posService.getAllPOS().subscribe({
      next: (page) => {
        this.posList = page.content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading POS:', error);
        this.snackBar.open('Error loading POS', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadSectors(): void {
    this.sectorService.getAllSectors().subscribe({
      next: (page) => {
        this.sectors = page.content;
      },
      error: (error) => {
        console.error('Error loading sectors:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAvailableHeadsByRole('HEAD_OF_POS').subscribe({
      next: (page) => {
        this.users = page.content;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  onCreatePOS(): void {
    this.showCreateForm = true;
    this.posForm.reset();
  }

  onEditPOS(pos: POS): void {
    this.selectedPOS = pos;
    this.showEditForm = true;
    this.posForm.patchValue({
      posName: pos.posName,
      codeOfPOS: pos.codeOfPOS,
      sectorId: pos.sector?.id,
      headOfPOSId: pos.headOfPOS?.id
    });
  }

  onSubmitForm(): void {
    if (this.posForm.valid) {
      const formData = this.posForm.value;
      
      if (this.showCreateForm) {
        this.createPOS(formData);
      } else if (this.showEditForm && this.selectedPOS) {
        this.updatePOS(this.selectedPOS.id!, formData);
      }
    }
  }

  createPOS(formData: any): void {
    const posData: any = {
      posName: formData.posName,
      codeOfPOS: formData.codeOfPOS,
      sector: { id: formData.sectorId }
    };
    
    // Add headOfPOS if provided
    if (formData.headOfPOSId) {
      posData.headOfPOS = { id: formData.headOfPOSId };
    }
    
    this.posService.createPOS(posData).subscribe({
      next: (pos) => {
        this.snackBar.open('POS created successfully', 'Close', { duration: 3000 });
        this.loadPOS();
        this.showCreateForm = false;
        this.posForm.reset();
      },
      error: (error) => {
        console.error('Error creating POS:', error);
        let errorMessage = 'Failed to create POS. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid POS data. Please check all required fields and ensure POS code is unique.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create POS.';
        } else if (error.status === 409) {
          errorMessage = 'A POS with this code or name already exists. Please use a different code or name.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  updatePOS(id: number, formData: any): void {
    const posData: any = {
      posName: formData.posName,
      codeOfPOS: formData.codeOfPOS,
      sector: { id: formData.sectorId }
    };
    
    // Add headOfPOS if provided
    if (formData.headOfPOSId) {
      posData.headOfPOS = { id: formData.headOfPOSId };
    }
    
    this.posService.updatePOS(id, posData).subscribe({
      next: (pos) => {
        this.snackBar.open('POS updated successfully', 'Close', { duration: 3000 });
        this.loadPOS();
        this.showEditForm = false;
        this.selectedPOS = null;
        this.posForm.reset();
      },
      error: (error) => {
        console.error('Error updating POS:', error);
        let errorMessage = 'Failed to update POS. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid POS data. Please check all required fields.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to update this POS.';
        } else if (error.status === 404) {
          errorMessage = 'POS not found. It may have been deleted.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  onDeletePOS(pos: POS): void {
    this.dialogService.confirm({
      title: 'Delete POS',
      message: `Are you sure you want to delete "${pos.posName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.posService.deletePOS(pos.id!).subscribe({
        next: () => {
          this.snackBar.open('POS deleted successfully', 'Close', { duration: 3000 });
          this.loadPOS();
        },
        error: (error) => {
          console.error('Error deleting POS:', error);
          let errorMessage = 'Failed to delete POS. Please try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to delete this POS.';
          } else if (error.status === 404) {
            errorMessage = 'POS not found. It may have already been deleted.';
          } else if (error.status === 409) {
            errorMessage = 'Cannot delete POS. It may have associated users. Please reassign them first.';
          } else if (error.status === 0 || error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        }
        });
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedPOS = null;
    this.posForm.reset();
  }

  getSectorName(pos: POS): string {
    return pos.sector?.sectorName || 'No Sector';
  }

  getHeadName(pos: POS): string {
    return pos.headOfPOS ? `${pos.headOfPOS.first_Name} ${pos.headOfPOS.last_Name}` : 'No Head';
  }

  getUsersCount(pos: POS): number {
    return pos.users ? pos.users.length : 0;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // === USER ASSIGNMENT METHODS ===

  onManageUsers(pos: POS): void {
    this.selectedPOS = pos;
    this.showUserAssignment = true;
    this.loadPOSUsers(pos.id!);
    this.loadAvailableUsers();
  }

  loadPOSUsers(posId: number): void {
    this.posService.getUsersByPOS(posId).subscribe({
      next: (users) => {
        this.posUsers = users;
      },
      error: (error) => {
        console.error('Error loading POS users:', error);
        this.snackBar.open('Error loading POS users', 'Close', { duration: 3000 });
      }
    });
  }

  loadAvailableUsers(): void {
    // Load users that can be assigned (from enterprise for ENTERPRISE_ADMIN, or all for MAIN_ADMIN)
    this.userService.getAllUsers(0, 1000).subscribe({
      next: (page) => {
        this.availableUsers = page.content.filter(user => {
          // Filter out users already assigned to this POS
          return !this.posUsers.some(posUser => posUser.id === user.id);
        });
      },
      error: (error) => {
        console.error('Error loading available users:', error);
      }
    });
  }

  assignUserToPOS(userId: number): void {
    if (!this.selectedPOS?.id) return;

    this.posService.assignUserToPOS(this.selectedPOS.id, userId).subscribe({
      next: (pos) => {
        this.snackBar.open('User assigned to POS successfully', 'Close', { duration: 3000 });
        this.loadPOSUsers(this.selectedPOS!.id!);
        this.loadAvailableUsers();
        // Update the POS in the list
        const index = this.posList.findIndex(p => p.id === pos.id);
        if (index > -1) {
          this.posList[index] = pos;
        }
      },
      error: (error) => {
        console.error('Error assigning user to POS:', error);
        let errorMessage = 'Failed to assign user to POS.';
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to assign users to this POS.';
        }
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  unassignUserFromPOS(userId: number): void {
    if (!this.selectedPOS?.id) return;

    this.dialogService.confirm({
      title: 'Unassign User',
      message: 'Are you sure you want to unassign this user from the POS?',
      confirmText: 'Unassign',
      cancelText: 'Cancel',
      type: 'warning'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.posService.unassignUserFromPOS(this.selectedPOS!.id!, userId).subscribe({
          next: (pos) => {
            this.snackBar.open('User unassigned from POS successfully', 'Close', { duration: 3000 });
            this.loadPOSUsers(this.selectedPOS!.id!);
            this.loadAvailableUsers();
            // Update the POS in the list
            const index = this.posList.findIndex(p => p.id === pos.id);
            if (index > -1) {
              this.posList[index] = pos;
            }
          },
          error: (error) => {
            console.error('Error unassigning user from POS:', error);
            let errorMessage = 'Failed to unassign user from POS.';
            if (error.error?.error) {
              errorMessage = error.error.error;
            } else if (error.status === 403) {
              errorMessage = 'You do not have permission to unassign users from this POS.';
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }

  assignSelectedUsers(): void {
    if (!this.selectedPOS?.id || this.selectedUsersForAssignment.size === 0) return;

    const userIds = Array.from(this.selectedUsersForAssignment);
    this.posService.assignUsersToPOS(this.selectedPOS.id, userIds).subscribe({
      next: (pos) => {
        this.snackBar.open(`Successfully assigned ${userIds.length} user(s) to POS`, 'Close', { duration: 3000 });
        this.selectedUsersForAssignment.clear();
        this.loadPOSUsers(this.selectedPOS!.id!);
        this.loadAvailableUsers();
        // Update the POS in the list
        const index = this.posList.findIndex(p => p.id === pos.id);
        if (index > -1) {
          this.posList[index] = pos;
        }
      },
      error: (error) => {
        console.error('Error assigning users to POS:', error);
        let errorMessage = 'Failed to assign users to POS.';
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to assign users to this POS.';
        }
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  toggleUserSelection(userId: number): void {
    if (this.selectedUsersForAssignment.has(userId)) {
      this.selectedUsersForAssignment.delete(userId);
    } else {
      this.selectedUsersForAssignment.add(userId);
    }
  }

  cancelUserAssignment(): void {
    this.showUserAssignment = false;
    this.selectedPOS = null;
    this.posUsers = [];
    this.selectedUsersForAssignment.clear();
  }
}
