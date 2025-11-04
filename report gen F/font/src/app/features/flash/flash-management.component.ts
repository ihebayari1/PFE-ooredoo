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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';

import { Flash, FlashRequest, FlashResponse, FlashFile } from '../../core/models/flash.model';
import { FlashService } from '../../core/services/flash.service';

@Component({
  selector: 'app-flash-management',
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
    MatExpansionModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './flash-management.component.html',
  styleUrls: ['./flash-management.component.scss']
})
export class FlashManagementComponent implements OnInit {
  flashes: FlashResponse[] = [];
  filteredFlashes: FlashResponse[] = [];
  displayedColumns: string[] = ['select', 'title', 'filesCount', 'createdBy', 'createdDate', 'status', 'actions'];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  selectedFlash: FlashResponse | null = null;
  selectedFlashes: Set<number> = new Set();
  searchQuery = '';
  uploadProgress = 0;
  isUploading = false;

  flashForm: FormGroup;

  constructor(
    private flashService: FlashService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.flashForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadFlashes();
  }

  loadFlashes(): void {
    this.isLoading = true;
    this.flashService.getAllFlashes().subscribe({
      next: (flashes) => {
        this.flashes = flashes;
        this.filteredFlashes = flashes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading flashes:', error);
        this.snackBar.open('Error loading flashes', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  searchFlashes(): void {
    if (this.searchQuery.trim()) {
      this.flashService.searchFlashes(this.searchQuery).subscribe({
        next: (flashes) => {
          this.filteredFlashes = flashes;
        },
        error: (error) => {
          console.error('Error searching flashes:', error);
          this.snackBar.open('Error searching flashes', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.filteredFlashes = this.flashes;
    }
  }

  createFlash(): void {
    if (this.flashForm.valid) {
      const flashRequest: FlashRequest = this.flashForm.value;
      
      this.flashService.createFlash(flashRequest).subscribe({
        next: (flash) => {
          this.snackBar.open('Flash created successfully', 'Close', { duration: 3000 });
          this.showCreateForm = false;
          this.flashForm.reset();
          this.loadFlashes();
        },
        error: (error) => {
          console.error('Error creating flash:', error);
          this.snackBar.open('Error creating flash', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editFlash(flash: FlashResponse): void {
    this.selectedFlash = flash;
    this.flashForm.patchValue({
      title: flash.title,
      isActive: flash.isActive
    });
    this.showEditForm = true;
  }

  updateFlash(): void {
    if (this.flashForm.valid && this.selectedFlash) {
      const flashRequest: FlashRequest = this.flashForm.value;
      
      this.flashService.updateFlash(this.selectedFlash.id, flashRequest).subscribe({
        next: (flash) => {
          this.snackBar.open('Flash updated successfully', 'Close', { duration: 3000 });
          this.showEditForm = false;
          this.selectedFlash = null;
          this.flashForm.reset();
          this.loadFlashes();
        },
        error: (error) => {
          console.error('Error updating flash:', error);
          this.snackBar.open('Error updating flash', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteFlash(flash: FlashResponse): void {
    if (confirm(`Are you sure you want to delete "${flash.title}"?`)) {
      this.flashService.deleteFlash(flash.id).subscribe({
        next: () => {
          this.snackBar.open('Flash deleted successfully', 'Close', { duration: 3000 });
          this.loadFlashes();
        },
        error: (error) => {
          console.error('Error deleting flash:', error);
          this.snackBar.open('Error deleting flash', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onFileSelected(event: any, flashId: number): void {
    const file = event.target.files[0];
    if (file) {
      if (!this.flashService.isSupportedFileType(file.type)) {
        this.snackBar.open('Unsupported file type', 'Close', { duration: 3000 });
        return;
      }

      this.isUploading = true;
      this.uploadProgress = 0;

      this.flashService.uploadFileWithProgress(flashId, file).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progressEvent = event as HttpProgressEvent;
            this.uploadProgress = Math.round(100 * progressEvent.loaded / (progressEvent.total || 1));
          } else if (event.type === HttpEventType.Response) {
            this.isUploading = false;
            this.uploadProgress = 0;
            this.snackBar.open('File uploaded successfully', 'Close', { duration: 3000 });
            this.loadFlashes();
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.isUploading = false;
          this.uploadProgress = 0;
          this.snackBar.open('Error uploading file', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteFile(flashId: number, fileId: number): void {
    if (confirm('Are you sure you want to delete this file?')) {
      this.flashService.deleteFile(flashId, fileId).subscribe({
        next: () => {
          this.snackBar.open('File deleted successfully', 'Close', { duration: 3000 });
          this.loadFlashes();
        },
        error: (error) => {
          console.error('Error deleting file:', error);
          this.snackBar.open('Error deleting file', 'Close', { duration: 3000 });
        }
      });
    }
  }

  downloadFile(flashId: number, fileId: number, fileName: string): void {
    this.flashService.downloadFile(flashId, fileId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.snackBar.open('Error downloading file', 'Close', { duration: 3000 });
      }
    });
  }

  toggleFlashSelection(flashId: number): void {
    if (this.selectedFlashes.has(flashId)) {
      this.selectedFlashes.delete(flashId);
    } else {
      this.selectedFlashes.add(flashId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedFlashes.size === this.filteredFlashes.length) {
      this.selectedFlashes.clear();
    } else {
      this.filteredFlashes.forEach(flash => this.selectedFlashes.add(flash.id));
    }
  }

  isAllSelected(): boolean {
    return this.filteredFlashes.length > 0 && this.selectedFlashes.size === this.filteredFlashes.length;
  }

  isIndeterminate(): boolean {
    return this.selectedFlashes.size > 0 && this.selectedFlashes.size < this.filteredFlashes.length;
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedFlash = null;
    this.flashForm.reset();
  }

  formatFileSize(bytes: number): string {
    return this.flashService.formatFileSize(bytes);
  }

  getFileIcon(fileType: string): string {
    return this.flashService.getFileIcon(fileType);
  }

  getFileCategoryColor(category: string): string {
    switch (category) {
      case 'PDF': return 'warn';
      case 'IMAGE': return 'primary';
      case 'VIDEO': return 'accent';
      default: return '';
    }
  }
}
