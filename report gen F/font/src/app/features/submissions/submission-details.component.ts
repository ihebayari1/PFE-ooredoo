import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Core services and models
import { SubmissionService } from '../../core/services/submission.service';
import { NotificationService } from '../../core/services/notification.service';
import { FileUploadService, UploadedFile } from '../../core/services/file-upload.service';
import { FormSubmission, FormWithAssignments, FormComponentAssignmentInfo } from '../../core/models/form.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-submission-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="submission-details-container">
      <!-- Loading indicator -->
      <app-loading-spinner 
        *ngIf="loading" 
        [overlay]="true" 
        message="Loading submission details...">
      </app-loading-spinner>

      <!-- Submission Details Header -->
      <div class="submission-header" *ngIf="submission && formData">
        <div class="header-content">
          <div class="submission-icon">
            <mat-icon>assignment_turned_in</mat-icon>
          </div>
          <div class="header-text">
            <h1>Submission Details</h1>
            <p class="submission-description">{{ formData.name }}</p>
            <div class="submission-meta">
              <span class="meta-item">
                <mat-icon>schedule</mat-icon>
                <span>Submitted: {{ formatDate(submission.submittedAt) }}</span>
              </span>
              <span class="meta-item">
                <mat-icon>person</mat-icon>
                <span>Submitted by: User #{{ submission.submittedById }}</span>
              </span>
              <span class="meta-item">
                <mat-icon>check_circle</mat-icon>
                <span>Status: Completed</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Submission Content -->
      <div class="submission-content" *ngIf="submission && formData">
        <mat-card class="submission-card">
          <mat-card-header class="submission-card-header">
            <mat-card-title>
              <mat-icon class="card-icon">description</mat-icon>
              Form Responses
            </mat-card-title>
            <mat-card-subtitle>View all submitted values</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="submission-card-content">
            <div class="responses-container">
              <div 
                *ngFor="let component of formComponents; let i = index; trackBy: trackByAssignmentId"
                class="response-item"
                [class.required-field]="component.required">
                
                <!-- Response Header -->
                <div class="response-header">
                  <div class="response-title">
                    <mat-icon class="response-icon">{{ getComponentIcon(component.componentType) }}</mat-icon>
                    <span class="response-label">{{ component.label }}</span>
                    <span *ngIf="component.required" class="required-indicator">*</span>
                  </div>
                  <div class="response-type">
                    <mat-chip class="type-chip">{{ getComponentTypeLabel(component.componentType) }}</mat-chip>
                  </div>
                </div>

                <!-- Response Value -->
                <div class="response-value">
                  <!-- File Upload Display -->
                  <div *ngIf="getComponentType(component) === 'FILE_UPLOAD'">
                    <div *ngIf="isFileLoading(component.assignmentId)" class="file-loading">
                      <mat-icon class="loading-icon">hourglass_empty</mat-icon>
                      <span>Loading file information...</span>
                    </div>
                    <div *ngIf="!isFileLoading(component.assignmentId) && getFilesForComponent(component.assignmentId).length > 0" class="file-list">
                      <div *ngFor="let file of getFilesForComponent(component.assignmentId)" class="file-item">
                        <mat-icon class="file-icon">description</mat-icon>
                        <span class="file-name">{{ file.originalFileName }}</span>
                        <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                        <button 
                          mat-icon-button 
                          color="primary" 
                          (click)="downloadFile(file)"
                          class="download-btn"
                          matTooltip="Download file">
                          <mat-icon>download</mat-icon>
                        </button>
                      </div>
                    </div>
                    <div *ngIf="!isFileLoading(component.assignmentId) && getFilesForComponent(component.assignmentId).length === 0 && getResponseValue(component)" class="file-error">
                      <mat-icon class="error-icon">error_outline</mat-icon>
                      <span>File information not available</span>
                    </div>
                    <div *ngIf="!isFileLoading(component.assignmentId) && getFilesForComponent(component.assignmentId).length === 0 && !getResponseValue(component)" class="no-value">
                      <mat-icon class="no-value-icon">remove</mat-icon>
                      <span class="no-value-text">No file uploaded</span>
                    </div>
                  </div>
                  
                  <!-- Regular Value Display -->
                  <div *ngIf="getComponentType(component) !== 'FILE_UPLOAD'">
                    <div *ngIf="getResponseValue(component)" class="value-content">
                      <span class="value-text">{{ getResponseValue(component) }}</span>
                    </div>
                    <div *ngIf="!getResponseValue(component)" class="no-value">
                      <mat-icon class="no-value-icon">remove</mat-icon>
                      <span class="no-value-text">No response provided</span>
                    </div>
                  </div>
                </div>

                <!-- Component Help Text -->
                <div class="response-help" *ngIf="getPropertyValue(component, 'helpText')">
                  <mat-icon class="help-icon">help_outline</mat-icon>
                  <span class="help-text">{{ getPropertyValue(component, 'helpText') }}</span>
                </div>

                <!-- Divider -->
                <mat-divider *ngIf="i < formComponents.length - 1" class="response-divider"></mat-divider>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Actions -->
      <div class="submission-actions" *ngIf="submission">
        <div class="actions-buttons">
          <button 
            type="button" 
            mat-button 
            (click)="goBack()"
            class="back-btn">
            <mat-icon>arrow_back</mat-icon>
            {{ formData?.id ? 'Back to Form Submissions' : 'Back to Dashboard' }}
          </button>
          <button 
            type="button" 
            mat-raised-button 
            color="primary"
            (click)="printSubmission()"
            class="print-btn">
            <mat-icon>print</mat-icon>
            Print Submission
          </button>
        </div>
      </div>

      <!-- No Submission Found -->
      <div *ngIf="!loading && !submission" class="no-submission-container">
        <mat-card class="no-submission-card">
          <mat-card-content class="no-submission-content">
            <div class="no-submission-icon">
              <mat-icon>error_outline</mat-icon>
            </div>
            <h2>Submission Not Found</h2>
            <p>The requested submission could not be found or you don't have permission to access it.</p>
            <div class="no-submission-actions">
              <button mat-raised-button color="primary" (click)="goBack()" class="back-btn">
                <mat-icon>arrow_back</mat-icon>
                {{ formData?.id ? 'Back to Form Submissions' : 'Back to Dashboard' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .submission-details-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
    }

    .submission-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      border-radius: 12px;
      color: white;
    }

    .submission-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
    }

    .submission-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .header-text h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .submission-description {
      margin: 0 0 16px 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .submission-meta {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .submission-content {
      margin-bottom: 32px;
    }

    .submission-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .submission-card-header {
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }

    .card-icon {
      margin-right: 8px;
      color: #1976d2;
    }

    .responses-container {
      padding: 8px 0;
    }

    .response-item {
      padding: 20px 0;
    }

    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .response-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .response-icon {
      color: #1976d2;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .response-label {
      font-weight: 600;
      font-size: 16px;
      color: #333;
    }

    .required-indicator {
      color: #f44336;
      font-weight: bold;
      margin-left: 4px;
    }

    .type-chip {
      background: #e3f2fd;
      color: #1976d2;
      font-size: 12px;
    }

    .response-value {
      margin-bottom: 8px;
    }

    .value-content {
      background: #f8f9fa;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .value-text {
      font-size: 15px;
      color: #333;
      word-break: break-word;
    }

    .no-value {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #999;
      font-style: italic;
    }

    .no-value-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .response-help {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      color: #666;
      font-size: 14px;
    }

    .help-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .response-divider {
      margin: 20px 0;
    }

    .file-loading {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      padding: 12px;
      font-style: italic;
    }

    .loading-icon {
      animation: spin 1s linear infinite;
      color: #1976d2;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .file-icon {
      color: #1976d2;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .file-name {
      flex: 1;
      font-weight: 500;
      color: #333;
      word-break: break-word;
    }

    .file-size {
      color: #666;
      font-size: 14px;
    }

    .download-btn {
      color: #1976d2;
    }

    .file-error {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      padding: 12px;
    }

    .error-icon {
      color: #f44336;
    }

    .submission-actions {
      display: flex;
      justify-content: center;
      margin-top: 32px;
    }

    .actions-buttons {
      display: flex;
      gap: 16px;
    }

    .back-btn {
      background: #f5f5f5;
      color: #333;
    }

    .print-btn {
      background: #1976d2;
      color: white;
    }

    .no-submission-container {
      margin-top: 64px;
    }

    .no-submission-card {
      text-align: center;
      border-radius: 12px;
    }

    .no-submission-content {
      padding: 48px 24px;
    }

    .no-submission-icon {
      margin-bottom: 24px;
    }

    .no-submission-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #999;
    }

    .no-submission-content h2 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .no-submission-content p {
      margin: 0 0 32px 0;
      color: #666;
    }

    @media (max-width: 768px) {
      .submission-details-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .submission-meta {
        justify-content: center;
        gap: 16px;
      }

      .response-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .actions-buttons {
        flex-direction: column;
        width: 100%;
      }
    }
  `]
})
export class SubmissionDetailsComponent implements OnInit, OnDestroy {
  submission: FormSubmission | null = null;
  formData: FormWithAssignments | null = null;
  formComponents: FormComponentAssignmentInfo[] = [];
  submissionId: number | null = null;
  loading = false;
  fileInfoMap: Map<number, UploadedFile[]> = new Map(); // Map assignmentId to uploaded files
  loadingFiles: Set<number> = new Set(); // Track which assignment IDs are loading files
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private submissionService: SubmissionService,
    private notificationService: NotificationService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.submissionId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.submissionId) {
      this.loadSubmissionDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSubmissionDetails(): void {
    if (!this.submissionId) return;

    this.loading = true;
    this.submissionService.getSubmissionDetails(this.submissionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (submission) => {
          this.submission = submission;
          this.loadFormStructure(submission.formId);
        },
        error: (error) => {
          console.error('Error loading submission details:', error);
          this.notificationService.loadError();
          this.loading = false;
        }
      });
  }

  loadFormStructure(formId: number): void {
    this.submissionService.getFormStructure(formId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (formData) => {
          this.formData = formData;
          this.formComponents = formData.componentAssignments.sort((a, b) => a.orderIndex - b.orderIndex);
          this.loadFileInfo();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading form structure:', error);
          this.notificationService.loadError();
          this.loading = false;
        }
      });
  }

  loadFileInfo(): void {
    if (!this.submission?.values) return;

    this.formComponents.forEach(component => {
      const componentType = component.componentType?.toString().toUpperCase();
      if (componentType === 'FILE_UPLOAD') {
        const submissionValue = this.submission?.values.find(v => v.assignmentId === component.assignmentId);
        if (submissionValue?.value) {
          // Parse file IDs (comma-separated)
          const fileIds = submissionValue.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          
          if (fileIds.length > 0) {
            this.loadingFiles.add(component.assignmentId);
            this.loadFilesForComponent(component.assignmentId, fileIds);
          }
        }
      }
    });
  }

  loadFilesForComponent(assignmentId: number, fileIds: number[]): void {
    const fileObservables = fileIds.map(id => 
      this.fileUploadService.getFileById(id).pipe(
        takeUntil(this.destroy$)
      )
    );

    // Load all files in parallel using forkJoin
    forkJoin(fileObservables).subscribe({
      next: (files) => {
        const validFiles = files.filter(f => f !== undefined) as UploadedFile[];
        this.fileInfoMap.set(assignmentId, validFiles);
        this.loadingFiles.delete(assignmentId);
      },
      error: (error) => {
        console.error('Error loading file info:', error);
        this.loadingFiles.delete(assignmentId);
      }
    });
  }

  getFilesForComponent(assignmentId: number): UploadedFile[] {
    return this.fileInfoMap.get(assignmentId) || [];
  }

  isFileLoading(assignmentId: number): boolean {
    return this.loadingFiles.has(assignmentId);
  }

  downloadFile(file: UploadedFile): void {
    this.fileUploadService.downloadFile(file.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.notificationService.showError('Failed to download file');
      }
    });
  }

  getResponseValue(component: FormComponentAssignmentInfo): string {
    if (!this.submission?.values) return '';
    
    const submissionValue = this.submission.values.find(v => v.assignmentId === component.assignmentId);
    if (!submissionValue) return '';

    // Format the value based on component type
    switch (component.componentType.toUpperCase()) {
      case 'DATE':
        return this.formatDateDisplay(submissionValue.value);
      case 'CHECKBOX':
        return submissionValue.value.split(',').join(', ');
      default:
        return submissionValue.value;
    }
  }

  getComponentIcon(componentType: string): string {
    switch (componentType.toUpperCase()) {
      case 'TEXT': return 'text_fields';
      case 'EMAIL': return 'email';
      case 'NUMBER': return 'numbers';
      case 'TEXTAREA': return 'notes';
      case 'DROPDOWN': return 'arrow_drop_down';
      case 'RADIO': return 'radio_button_checked';
      case 'CHECKBOX': return 'check_box';
      case 'DATE': return 'calendar_today';
      case 'FILE_UPLOAD': return 'attach_file';
      default: return 'help_outline';
    }
  }

  getComponentType(component: FormComponentAssignmentInfo): string {
    if (!component.componentType) return '';
    return component.componentType.toString().toUpperCase();
  }

  getComponentTypeLabel(componentType: string): string {
    switch (componentType.toUpperCase()) {
      case 'TEXT': return 'Text Input';
      case 'EMAIL': return 'Email';
      case 'NUMBER': return 'Number';
      case 'TEXTAREA': return 'Text Area';
      case 'DROPDOWN': return 'Dropdown';
      case 'RADIO': return 'Radio Button';
      case 'CHECKBOX': return 'Checkbox';
      case 'DATE': return 'Date';
      case 'FILE_UPLOAD': return 'File Upload';
      default: return 'Unknown';
    }
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  getPropertyValue(component: FormComponentAssignmentInfo, propertyName: string): string {
    if (!component?.properties) return '';
    const property = component.properties.find(p => p.propertyName === propertyName);
    return property?.propertyValue || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  trackByAssignmentId(index: number, component: FormComponentAssignmentInfo): number {
    return component.assignmentId;
  }

  goBack(): void {
    // Check if we have form data to navigate back to form submissions
    if (this.formData?.id) {
      this.router.navigate(['/forms', this.formData.id, 'submissions']);
    } else {
      // Fallback to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  printSubmission(): void {
    window.print();
  }
}
