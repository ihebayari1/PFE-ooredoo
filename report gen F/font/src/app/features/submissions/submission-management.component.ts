import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Core services and models
import { SubmissionService } from '../../core/services/submission.service';
import { FormService } from '../../core/services/form.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { DialogService } from '../../shared/services/dialog.service';
import { FormSubmission, Form, SubmissionValue } from '../../core/models/form.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface SubmissionDisplayData {
  id: number;
  submittedAt: string;
  submittedBy: string;
  values: { [key: string]: string };
}

@Component({
  selector: 'app-submission-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './submission-management.component.html',
  styles: [`
    .submissions-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .submission-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: box-shadow 0.2s ease;
    }

    .submission-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .submission-info {
      padding: 1rem;
    }

    .submission-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .submission-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }

    .submission-date {
      background: #f5f5f5;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #666;
    }

    .submission-details {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-id, .values-count {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .submitted-by {
      background: #f3e5f5;
      color: #7b1fa2;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .submission-actions {
      display: flex;
      justify-content: flex-end;
    }

    .view-details-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-content h1 {
      margin: 0;
      color: #333;
    }

    .header-content p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .search-card {
      margin-bottom: 24px;
    }

    .search-filters {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 200px;
    }

    .date-field {
      width: 150px;
    }

    .table-card {
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .submissions-table {
      width: 100%;
    }

    .field-value {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .no-data {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      color: #999;
    }

    .no-data p {
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .submission-management-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .search-filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field,
      .date-field {
        width: 100%;
      }
    }
  `]
})
export class SubmissionManagementComponent implements OnInit, OnDestroy {
  form: Form | null = null;
  submissions: FormSubmission[] = [];
  displayedSubmissions: SubmissionDisplayData[] = [];
  formFields: { key: string; label: string }[] = [];
  displayedColumns: string[] = [];
  
  searchForm: FormGroup;
  loading = false;
  
  // Pagination
  currentPage = 0;
  pageSize = 25;
  totalElements = 0;
  
  formId: number | null = null;
  
  // User role detection
  isSimpleUser = false;
  pageTitle = 'Submissions';
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private submissionService: SubmissionService,
    private formService: FormService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.formId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.formId) {
      this.loadForm();
      this.loadSubmissions();
    } else if (this.isSimpleUser) {
      // For simple users, load their submissions without formId
      this.loadMySubmissions();
    }
  }

  private checkUserRole(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.roles) {
      const userRole = user.roles[0]?.replace('ROLE_', '') || 'USER';
      this.isSimpleUser = this.isSimpleUserRole(userRole);
      this.pageTitle = this.isSimpleUser ? 'My Submissions' : 'Submissions';
    }
  }

  private isSimpleUserRole(role: string): boolean {
    return role === 'SIMPLE_USER' ||
           role === 'HEAD_OF_SECTOR' ||
           role === 'HEAD_OF_ZONE' ||
           role === 'HEAD_OF_REGION' ||
           role === 'HEAD_OF_POS' ||
           role === 'COMMERCIAL_POS' ||
           role === 'USER';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadForm(): void {
    if (!this.formId) return;

    this.formService.getFormById(this.formId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.form = response;
          this.setupTableColumns();
        },
        error: () => {
          this.notificationService.loadError();
        }
      });
  }

  loadSubmissions(): void {
    if (!this.formId) return;

    this.loading = true;
    this.submissionService.getFormSubmissions(this.formId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (submissions) => {
          this.submissions = submissions;
          this.totalElements = submissions.length;
          this.processSubmissionsForDisplay();
          this.loading = false;
        },
        error: () => {
          this.notificationService.loadError();
          this.loading = false;
        }
      });
  }

  loadMySubmissions(): void {
    this.loading = true;
    
    // For admins, load all submissions; for simple users, load their own submissions
    const submissionsObservable = this.isSimpleUser 
      ? this.submissionService.getMySubmissions()
      : this.submissionService.getAllSubmissions();
    
    submissionsObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (submissions) => {
          this.submissions = submissions;
          this.totalElements = submissions.length;
          this.processSubmissionsForDisplay();
          this.loading = false;
        },
        error: () => {
          this.notificationService.loadError();
          this.loading = false;
        }
      });
  }

  setupTableColumns(): void {
    if (!this.form?.components) return;

    // Create columns for each form component
    this.formFields = this.form.components
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(component => ({
        key: `field_${component.assignmentId}`,
        label: component.label
      }));

    // Set displayed columns
    this.displayedColumns = ['submittedAt', 'submittedBy', ...this.formFields.map(f => f.key), 'actions'];
  }

  processSubmissionsForDisplay(): void {
    this.displayedSubmissions = this.submissions.map(submission => {
      const values: { [key: string]: string } = {};
      
      // Process submission values
      submission.values.forEach(value => {
        const fieldKey = `field_${value.assignmentId}`;
        values[fieldKey] = value.value;
      });

      return {
        id: submission.id!,
        submittedAt: submission.submittedAt,
        submittedBy: `User ${submission.submittedById}`, // You might want to fetch actual user names
        values
      };
    });
  }

  searchSubmissions(): void {
    // TODO: Implement search functionality
    this.notificationService.showInfo('Search functionality will be implemented next.');
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.loadSubmissions();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSubmissions();
  }

  viewSubmission(submission: SubmissionDisplayData): void {
    this.router.navigate(['/submissions', submission.id, 'details']);
  }

  viewSubmissionDetails(submissionId: number): void {
    this.router.navigate(['/submissions', submissionId, 'details']);
  }

  deleteSubmission(submission: SubmissionDisplayData): void {
    this.dialogService.confirmDelete('submission')
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.submissionService.deleteSubmission(submission.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.notificationService.submissionDeleted();
                this.loadSubmissions();
              },
              error: () => {
                this.notificationService.showError('Failed to delete submission.');
              }
            });
        }
      });
  }

  exportToCSV(): void {
    if (!this.formId) return;

    this.submissionService.exportSubmissionsToCSV(this.formId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `form-submissions-${this.form?.name || 'export'}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.notificationService.exportCompleted();
        },
        error: () => {
          this.notificationService.showError('Failed to export submissions.');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
