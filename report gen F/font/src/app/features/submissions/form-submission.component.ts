import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Core services and models
import { SubmissionService } from '../../core/services/submission.service';
import { NotificationService } from '../../core/services/notification.service';
import { FileUploadService, UploadedFile } from '../../core/services/file-upload.service';
import { FormWithAssignments, FormComponentAssignmentInfo, ComponentType } from '../../core/models/form.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-form-submission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './form-submission.component.html',
  styleUrls: ['./form-submission.component.scss']
})
export class FormSubmissionComponent implements OnInit, OnDestroy {
  formData: FormWithAssignments | null = null;
  formComponents: FormComponentAssignmentInfo[] = [];
  submissionForm: FormGroup;
  formId: number | null = null;
  loading = false;
  submitting = false;
  uploadedFiles: Map<number, UploadedFile[]> = new Map(); // Track uploaded files by assignmentId
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private submissionService: SubmissionService,
    private notificationService: NotificationService,
    private fileUploadService: FileUploadService
  ) {
    this.submissionForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.formId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.formId) {
      this.loadFormStructure();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFormStructure(): void {
    if (!this.formId) return;

    this.loading = true;
    this.submissionService.getFormStructure(this.formId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (formData) => {
          this.formData = formData;
          this.formComponents = formData.componentAssignments.sort((a, b) => a.orderIndex - b.orderIndex);
          this.buildForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading form structure:', error);
          this.notificationService.loadError();
          this.loading = false;
        }
      });
  }

  buildForm(): void {
    const formControls: { [key: string]: any } = {};

    this.formComponents.forEach(component => {
      const componentType = component.componentType?.toString().toUpperCase();
      
      // FILE_UPLOAD doesn't need form controls - files are handled separately
      if (componentType === 'FILE_UPLOAD') {
        this.uploadedFiles.set(component.assignmentId, []);
        return;
      }
      
      const validators = [];
      
      if (component.required) {
        validators.push(Validators.required);
      }

      // Add component-specific validators
      switch (component.componentType.toUpperCase()) {
        case 'EMAIL':
          validators.push(Validators.email);
          break;
        case 'NUMBER':
          const min = this.getPropertyValue(component, 'min');
          const max = this.getPropertyValue(component, 'max');
          if (min) validators.push(Validators.min(Number(min)));
          if (max) validators.push(Validators.max(Number(max)));
          break;
        case 'TEXT':
        case 'TEXTAREA':
          const maxLength = this.getPropertyValue(component, 'maxLength');
          if (maxLength) validators.push(Validators.maxLength(Number(maxLength)));
          break;
        case 'DROPDOWN':
        case 'RADIO':
          // For dropdowns and radio buttons, no additional validators needed
          break;
        case 'CHECKBOX':
          // For checkboxes, create a FormGroup
          const checkboxControls: { [key: string]: any } = {};
          component.options?.forEach(option => {
            checkboxControls[option.value] = [false];
          });
          formControls[`checkbox_${component.assignmentId}`] = this.fb.group(checkboxControls);
          break;
      }

      formControls[`field_${component.assignmentId}`] = ['', validators];
    });

    this.submissionForm = this.fb.group(formControls);
  }

  getCheckboxGroup(component: FormComponentAssignmentInfo): FormGroup {
    return this.submissionForm.get(`checkbox_${component.assignmentId}`) as FormGroup;
  }

  onSubmit(): void {
    if (this.submissionForm.invalid || !this.formId) return;

    this.submitting = true;
    const assignmentValues = new Map<number, string>();

    this.formComponents.forEach(component => {
      const componentType = component.componentType?.toString().toUpperCase();
      
      // Handle FILE_UPLOAD - send file IDs
      if (componentType === 'FILE_UPLOAD') {
        const files = this.uploadedFiles.get(component.assignmentId) || [];
        if (files.length > 0) {
          const fileIds = files.map(f => f.id.toString()).join(',');
          assignmentValues.set(component.assignmentId, fileIds);
        } else if (component.required) {
          // Required file upload but no files uploaded
          this.notificationService.showError('Please upload the required file');
          this.submitting = false;
          return;
        }
        return;
      }
      
      if (component.componentType === 'CHECKBOX' || component.componentType === 'checkbox') {
        const checkboxGroup = this.getCheckboxGroup(component);
        const selectedValues = Object.keys(checkboxGroup.value).filter(key => checkboxGroup.value[key]);
        assignmentValues.set(component.assignmentId, selectedValues.join(','));
      } else {
        const formControl = this.submissionForm.get(`field_${component.assignmentId}`);
        if (formControl?.value !== null && formControl?.value !== undefined) {
          let value = formControl.value.toString();
          
          // Format date values to yyyy-MM-dd format
          if (component.componentType === 'DATE' || component.componentType === 'date') {
            if (formControl.value instanceof Date) {
              value = this.formatDateForBackend(formControl.value);
            } else if (typeof formControl.value === 'string') {
              // Try to parse and reformat the date string
              const date = new Date(formControl.value);
              if (!isNaN(date.getTime())) {
                value = this.formatDateForBackend(date);
              }
            }
          }
          
          assignmentValues.set(component.assignmentId, value);
        }
      }
    });

    this.submissionService.submitForm(this.formId, assignmentValues)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.formSubmitted();
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.notificationService.submissionError();
          this.submitting = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  trackByAssignmentId(index: number, component: FormComponentAssignmentInfo): number {
    return component.assignmentId;
  }

  getPropertyValue(component: FormComponentAssignmentInfo, propertyName: string): string {
    if (!component?.properties) return '';
    const property = component.properties.find(p => p.propertyName === propertyName);
    return property?.propertyValue || '';
  }

  private formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Enhanced UI Methods
  getComponentIcon(componentType: string): string {
    switch (componentType.toUpperCase()) {
      case 'TEXT':
      case 'TEXTAREA':
        return 'text_fields';
      case 'EMAIL':
        return 'email';
      case 'NUMBER':
        return 'numbers';
      case 'DROPDOWN':
        return 'arrow_drop_down';
      case 'RADIO':
        return 'radio_button_checked';
      case 'CHECKBOX':
        return 'check_box';
      case 'DATE':
        return 'calendar_today';
      case 'FILE_UPLOAD':
        return 'attach_file';
      default:
        return 'text_fields';
    }
  }

  getComponentType(component: FormComponentAssignmentInfo): string {
    if (!component.componentType) return '';
    return component.componentType.toString().toUpperCase();
  }

  getFieldCount(): number {
    return this.formComponents.filter(c => {
      const componentType = c.componentType?.toString().toUpperCase();
      return componentType !== 'FILE_UPLOAD'; // Exclude FILE_UPLOAD from count if needed
    }).length;
  }

  // File Upload Methods
  onFileSelected(event: Event, assignmentId: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFile(file, assignmentId);
    }
  }

  uploadFile(file: File, assignmentId: number): void {
    const maxFileSize = this.getMaxFileSize(assignmentId);
    if (file.size > maxFileSize) {
      this.notificationService.showError(`File size exceeds maximum allowed size`);
      return;
    }

    const allowedTypes = this.getAllowedFileTypes(assignmentId);
    if (allowedTypes.length > 0 && !this.isFileTypeAllowed(file.type, allowedTypes)) {
      this.notificationService.showError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    this.fileUploadService.uploadFile(file).subscribe({
      next: (uploadedFile) => {
        const files = this.uploadedFiles.get(assignmentId) || [];
        files.push(uploadedFile);
        this.uploadedFiles.set(assignmentId, files);
      },
      error: (error) => {
        this.notificationService.showError('Failed to upload file');
        console.error('File upload error:', error);
      }
    });
  }

  removeFile(assignmentId: number, fileId: number): void {
    const files = this.uploadedFiles.get(assignmentId) || [];
    const filtered = files.filter(f => f.id !== fileId);
    this.uploadedFiles.set(assignmentId, filtered);
    
    this.fileUploadService.deleteFile(fileId).subscribe({
      error: (error) => {
        console.error('File deletion error:', error);
      }
    });
  }

  getUploadedFiles(assignmentId: number): UploadedFile[] {
    return this.uploadedFiles.get(assignmentId) || [];
  }

  getMaxFileSize(assignmentId: number): number {
    const component = this.formComponents.find(c => c.assignmentId === assignmentId);
    if (!component) return 50 * 1024 * 1024; // Default 50MB
    
    const maxSizeStr = this.getPropertyValue(component, 'maxFileSize');
    if (!maxSizeStr) return 50 * 1024 * 1024;
    
    // Parse size string like "50MB"
    const match = maxSizeStr.match(/(\d+)(MB|KB|GB)/i);
    if (!match) return 50 * 1024 * 1024;
    
    const size = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    
    switch (unit) {
      case 'GB': return size * 1024 * 1024 * 1024;
      case 'MB': return size * 1024 * 1024;
      case 'KB': return size * 1024;
      default: return 50 * 1024 * 1024;
    }
  }

  getAllowedFileTypes(assignmentId: number): string[] {
    const component = this.formComponents.find(c => c.assignmentId === assignmentId);
    if (!component) return [];
    
    const allowedTypes = this.getPropertyValue(component, 'allowedFileTypes');
    if (!allowedTypes) return [];
    
    return allowedTypes.split(',').map(t => t.trim());
  }

  isFileTypeAllowed(fileType: string, allowedTypes: string[]): boolean {
    if (allowedTypes.length === 0) return true;
    
    return allowedTypes.some(allowed => {
      if (allowed.includes('*')) return true;
      if (fileType.includes(allowed)) return true;
      return false;
    });
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  getEstimatedTime(): number {
    // Estimate 1 minute per field, minimum 2 minutes
    const fieldCount = this.getFieldCount();
    return Math.max(2, fieldCount);
  }

  getFormProgress(): number {
    const fieldComponents = this.formComponents.filter(c => {
      const componentType = c.componentType?.toString().toUpperCase();
      return componentType !== 'FILE_UPLOAD'; // Exclude FILE_UPLOAD from progress calculation
    });
    if (fieldComponents.length === 0) return 0;
    const completedFields = this.getCompletedFieldsCount();
    return Math.round((completedFields / fieldComponents.length) * 100);
  }

  getCompletedFieldsCount(): number {
    let completed = 0;
    this.formComponents.forEach(component => {
      const componentType = component.componentType?.toString().toUpperCase();
      if (componentType === 'FILE_UPLOAD') {
        // Check if file is uploaded
        const files = this.uploadedFiles.get(component.assignmentId) || [];
        if (files.length > 0) {
          completed++;
        }
        return;
      }
      if (this.isFieldCompleted(component)) {
        completed++;
      }
    });
    return completed;
  }

  isFieldCompleted(component: FormComponentAssignmentInfo): boolean {
    const componentType = component.componentType?.toString().toUpperCase();
    
    // Handle FILE_UPLOAD separately
    if (componentType === 'FILE_UPLOAD') {
      const files = this.uploadedFiles.get(component.assignmentId) || [];
      return files.length > 0;
    }
    
    const formControl = this.submissionForm.get(`field_${component.assignmentId}`);
    if (!formControl) return false;

    const value = formControl.value;
    
    // Check if field has a value
    if (value === null || value === undefined || value === '') {
      return false;
    }

    // For checkboxes, check if any option is selected
    if (component.componentType === 'CHECKBOX') {
      const checkboxGroup = this.getCheckboxGroup(component);
      return Object.values(checkboxGroup.value).some(checked => checked === true);
    }

    return true;
  }
}
