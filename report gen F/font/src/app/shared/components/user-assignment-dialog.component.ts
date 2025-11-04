import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { Enterprise, User } from '../../core/models/enterprise.model';
import { UserService } from '../../core/services/user.service';
import { EnterpriseService } from '../../core/services/enterprise.service';

export interface UserAssignmentDialogData {
  enterprise: Enterprise;
  mode: 'assign' | 'unassign';
}

@Component({
  selector: 'app-user-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="user-assignment-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.mode === 'assign' ? 'person_add' : 'person_remove' }}</mat-icon>
        {{ data.mode === 'assign' ? 'Assign Users to' : 'Remove Users from' }} {{ data.enterprise.enterpriseName }}
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <!-- Search and Filter -->
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search users</mat-label>
              <input matInput [(ngModel)]="searchQuery" (input)="filterUsers()" placeholder="Search by name or email">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <!-- Loading State -->
          <div class="loading-container" *ngIf="isLoading">
            <mat-spinner diameter="30"></mat-spinner>
            <p>Loading users...</p>
          </div>

          <!-- Users List -->
          <div class="users-container" *ngIf="!isLoading">
            <div class="users-section" *ngIf="data.mode === 'assign'">
              <h3>Available Users</h3>
              <div class="users-list">
                <div class="user-item" *ngFor="let user of availableUsers" (click)="toggleUserSelection(user)">
                  <div class="user-info">
                    <mat-icon class="user-icon">person</mat-icon>
                    <div class="user-details">
                      <span class="user-name">{{ user.first_Name }} {{ user.last_Name }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                  </div>
                  <mat-icon class="selection-icon" [class.selected]="isUserSelected(user)">
                    {{ isUserSelected(user) ? 'check_circle' : 'radio_button_unchecked' }}
                  </mat-icon>
                </div>
              </div>
            </div>

            <div class="users-section" *ngIf="data.mode === 'unassign'">
              <h3>Current Enterprise Users</h3>
              <div class="users-list">
                <div class="user-item" *ngFor="let user of enterpriseUsers" (click)="toggleUserSelection(user)">
                  <div class="user-info">
                    <mat-icon class="user-icon">person</mat-icon>
                    <div class="user-details">
                      <span class="user-name">{{ user.first_Name }} {{ user.last_Name }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                  </div>
                  <mat-icon class="selection-icon" [class.selected]="isUserSelected(user)">
                    {{ isUserSelected(user) ? 'check_circle' : 'radio_button_unchecked' }}
                  </mat-icon>
                </div>
              </div>
            </div>

            <!-- No Users Message -->
            <div class="no-users" *ngIf="getCurrentUsersList().length === 0">
              <mat-icon>person_off</mat-icon>
              <p>{{ data.mode === 'assign' ? 'No available users to assign' : 'No users in this enterprise' }}</p>
            </div>
          </div>

          <!-- Selected Users Summary -->
          <div class="selected-summary" *ngIf="selectedUsers.length > 0">
            <h4>Selected Users ({{ selectedUsers.length }})</h4>
            <div class="selected-chips">
              <mat-chip-set>
                <mat-chip *ngFor="let user of selectedUsers" (removed)="removeUserFromSelection(user)">
                  {{ user.first_Name }} {{ user.last_Name }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                [disabled]="selectedUsers.length === 0 || isProcessing"
                (click)="onConfirm()">
          <mat-spinner *ngIf="isProcessing" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!isProcessing">{{ data.mode === 'assign' ? 'person_add' : 'person_remove' }}</mat-icon>
          {{ data.mode === 'assign' ? 'Assign Users' : 'Remove Users' }} ({{ selectedUsers.length }})
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-assignment-dialog {
      min-width: 500px;
      max-width: 700px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #333;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: 500px;
      overflow-y: auto;
    }

    .search-section {
      .search-field {
        width: 100%;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      
      p {
        margin-top: 16px;
        color: #666;
        font-size: 14px;
      }
    }

    .users-container {
      .users-section {
        h3 {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 16px;
          font-weight: 500;
        }
      }
    }

    .users-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px;
    }

    .user-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .user-icon {
          color: #666;
          font-size: 20px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .user-name {
            font-weight: 500;
            color: #333;
            font-size: 14px;
          }

          .user-email {
            color: #666;
            font-size: 12px;
          }
        }
      }

      .selection-icon {
        color: #ccc;
        font-size: 20px;
        transition: color 0.2s;

        &.selected {
          color: #1976d2;
        }
      }
    }

    .no-users {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      color: #666;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .selected-summary {
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;

      h4 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }

      .selected-chips {
        mat-chip-set {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
      border-top: 1px solid #e0e0e0;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    // Responsive design
    @media (max-width: 600px) {
      .user-assignment-dialog {
        min-width: 300px;
        max-width: 100%;
      }

      .users-list {
        max-height: 200px;
      }
    }
  `]
})
export class UserAssignmentDialogComponent implements OnInit {
  users: User[] = [];
  enterpriseUsers: User[] = [];
  availableUsers: User[] = [];
  selectedUsers: User[] = [];
  searchQuery = '';
  isLoading = false;
  isProcessing = false;

  constructor(
    public dialogRef: MatDialogRef<UserAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserAssignmentDialogData,
    private userService: UserService,
    private enterpriseService: EnterpriseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    
    if (this.data.mode === 'assign') {
      // Load all users and filter out those already in enterprise
      this.userService.getAllUsers(0, 1000).subscribe({
        next: (page) => {
          this.users = page.content;
          this.filterAvailableUsers();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      // Load users currently in the enterprise
      this.enterpriseService.getUsersInEnterprise(this.data.enterprise.id!, 0, 1000).subscribe({
        next: (page) => {
          this.enterpriseUsers = page.content;
          this.users = page.content;
          this.filterUsers();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading enterprise users:', error);
          this.snackBar.open('Error loading enterprise users', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  filterAvailableUsers(): void {
    const enterpriseUserIds = this.data.enterprise.usersInEnterprise?.map(u => u.id) || [];
    this.availableUsers = this.users.filter(user => !enterpriseUserIds.includes(user.id));
    this.filterUsers();
  }

  filterUsers(): void {
    if (!this.searchQuery.trim()) {
      if (this.data.mode === 'assign') {
        this.availableUsers = this.users.filter(user => 
          !this.data.enterprise.usersInEnterprise?.some(eu => eu.id === user.id)
        );
      } else {
        this.enterpriseUsers = this.users;
      }
    } else {
      const query = this.searchQuery.toLowerCase();
      if (this.data.mode === 'assign') {
        this.availableUsers = this.users.filter(user => 
          !this.data.enterprise.usersInEnterprise?.some(eu => eu.id === user.id) &&
          (user.first_Name.toLowerCase().includes(query) ||
           user.last_Name.toLowerCase().includes(query) ||
           user.email.toLowerCase().includes(query))
        );
      } else {
        this.enterpriseUsers = this.users.filter(user =>
          user.first_Name.toLowerCase().includes(query) ||
          user.last_Name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      }
    }
  }

  getCurrentUsersList(): User[] {
    return this.data.mode === 'assign' ? this.availableUsers : this.enterpriseUsers;
  }

  toggleUserSelection(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isUserSelected(user: User): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  removeUserFromSelection(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    }
  }

  onConfirm(): void {
    if (this.selectedUsers.length === 0) return;

    this.isProcessing = true;
    
    // Process users sequentially to avoid overwhelming the server
    this.processUsersSequentially(0);
  }

  private processUsersSequentially(index: number): void {
    if (index >= this.selectedUsers.length) {
      // All users processed successfully
      this.snackBar.open(
        `${this.selectedUsers.length} user(s) ${this.data.mode === 'assign' ? 'assigned to' : 'removed from'} enterprise successfully`,
        'Close',
        { duration: 3000 }
      );
      this.dialogRef.close({ success: true, users: this.selectedUsers });
      return;
    }

    const user = this.selectedUsers[index];
    const operation = this.data.mode === 'assign' 
      ? this.enterpriseService.addUserToEnterprise(this.data.enterprise.id!, user.id!)
      : this.enterpriseService.removeUserFromEnterprise(this.data.enterprise.id!, user.id!);

    operation.subscribe({
      next: () => {
        // Process next user
        this.processUsersSequentially(index + 1);
      },
      error: (error) => {
        console.error('Error processing user assignment:', error);
        this.snackBar.open(`Error ${this.data.mode === 'assign' ? 'assigning' : 'removing'} user ${user.first_Name} ${user.last_Name}`, 'Close', { duration: 3000 });
        this.isProcessing = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
