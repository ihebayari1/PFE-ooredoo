import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) {}

  showSuccess(message: string, title?: string): void {
    this.toastr.success(message, title || 'Success');
  }

  showError(message: string, title?: string): void {
    this.toastr.error(message, title || 'Error');
  }

  showWarning(message: string, title?: string): void {
    this.toastr.warning(message, title || 'Warning');
  }

  showInfo(message: string, title?: string): void {
    this.toastr.info(message, title || 'Info');
  }

  // Form builder specific notifications
  formCreated(): void {
    this.showSuccess('Form created successfully!');
  }

  formUpdated(): void {
    this.showSuccess('Form updated successfully!');
  }

  formDeleted(): void {
    this.showSuccess('Form deleted successfully!');
  }

  componentAdded(): void {
    this.showSuccess('Component added to form!');
  }

  componentUpdated(): void {
    this.showSuccess('Component updated successfully!');
  }

  componentDeleted(): void {
    this.showSuccess('Component removed from form!');
  }

  formSubmitted(): void {
    this.showSuccess('Form submitted successfully!');
  }

  submissionDeleted(): void {
    this.showSuccess('Submission deleted successfully!');
  }

  exportCompleted(): void {
    this.showSuccess('Export completed successfully!');
  }

  // Error notifications
  formSaveError(): void {
    this.showError('Failed to save form. Please try again.');
  }

  componentSaveError(): void {
    this.showError('Failed to save component. Please try again.');
  }

  submissionError(): void {
    this.showError('Failed to submit form. Please check your inputs.');
  }

  loadError(): void {
    this.showError('Failed to load data. Please refresh the page.');
  }
}
