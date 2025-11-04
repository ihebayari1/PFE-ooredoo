import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

import { RoleAction } from '../../core/models/enterprise.model';
import { RoleActionService } from '../../core/services/role-action.service';

@Component({
  selector: 'app-role-action-management',
  standalone: true,
  imports: [
    CommonModule,
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
    MatProgressSpinnerModule
  ],
  templateUrl: './role-action-management.component.html',
  styleUrls: ['./role-action-management.component.scss']
})
export class RoleActionManagementComponent implements OnInit {
  roleActions: RoleAction[] = [];
  displayedColumns: string[] = ['actionKey', 'description', 'endpointPattern', 'createdAt', 'actions'];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  selectedRoleAction: RoleAction | null = null;

  roleActionForm: FormGroup;

  constructor(
    private roleActionService: RoleActionService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.roleActionForm = this.fb.group({
      actionKey: ['', Validators.required],
      description: [''],
      endpointPattern: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoleActions();
  }

  loadRoleActions(): void {
    this.isLoading = true;
    this.roleActionService.getAllRoleActions().subscribe({
      next: (roleActions) => {
        this.roleActions = roleActions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading role actions:', error);
        this.snackBar.open('Error loading role actions', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onCreateRoleAction(): void {
    this.showCreateForm = true;
    this.roleActionForm.reset();
  }

  onEditRoleAction(roleAction: RoleAction): void {
    this.selectedRoleAction = roleAction;
    this.showEditForm = true;
    this.roleActionForm.patchValue({
      actionKey: roleAction.actionKey,
      description: roleAction.description,
      endpointPattern: roleAction.endpointPattern
    });
  }

  onSubmitForm(): void {
    if (this.roleActionForm.valid) {
      const formData = this.roleActionForm.value;
      
      if (this.showCreateForm) {
        this.createRoleAction(formData);
      } else if (this.showEditForm && this.selectedRoleAction) {
        this.updateRoleAction(this.selectedRoleAction.id!, formData);
      }
    }
  }

  createRoleAction(formData: any): void {
    this.roleActionService.createRoleAction(formData).subscribe({
      next: (roleAction) => {
        this.snackBar.open('Role action created successfully', 'Close', { duration: 3000 });
        this.loadRoleActions();
        this.showCreateForm = false;
        this.roleActionForm.reset();
      },
      error: (error) => {
        console.error('Error creating role action:', error);
        this.snackBar.open('Error creating role action', 'Close', { duration: 3000 });
      }
    });
  }

  updateRoleAction(id: number, formData: any): void {
    this.roleActionService.updateRoleAction(id, formData).subscribe({
      next: (roleAction) => {
        this.snackBar.open('Role action updated successfully', 'Close', { duration: 3000 });
        this.loadRoleActions();
        this.showEditForm = false;
        this.selectedRoleAction = null;
        this.roleActionForm.reset();
      },
      error: (error) => {
        console.error('Error updating role action:', error);
        this.snackBar.open('Error updating role action', 'Close', { duration: 3000 });
      }
    });
  }

  onDeleteRoleAction(roleAction: RoleAction): void {
    if (confirm(`Are you sure you want to delete "${roleAction.actionKey}"?`)) {
      this.roleActionService.deleteRoleAction(roleAction.id!).subscribe({
        next: () => {
          this.snackBar.open('Role action deleted successfully', 'Close', { duration: 3000 });
          this.loadRoleActions();
        },
        error: (error) => {
          console.error('Error deleting role action:', error);
          this.snackBar.open('Error deleting role action', 'Close', { duration: 3000 });
        }
      });
    }
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedRoleAction = null;
    this.roleActionForm.reset();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}
