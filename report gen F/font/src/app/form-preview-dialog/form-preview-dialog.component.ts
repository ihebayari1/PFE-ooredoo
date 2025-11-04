import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './form-preview-dialog.component.html',
  styleUrls: ['./form-preview-dialog.component.scss']
})
export class FormPreviewDialogComponent {
  checkboxSelections: { [key: string]: string[] } = {};

  constructor(
    public dialogRef: MatDialogRef<FormPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      formName: string,
      formDescription: string,
      formFields: any[]
    }
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onCheckboxChange(fieldLabel: string, optionValue: string, isChecked: boolean): void {
    if (!this.checkboxSelections[fieldLabel]) {
      this.checkboxSelections[fieldLabel] = [];
    }

    if (isChecked) {
      // Add to selections if not already present
      if (!this.checkboxSelections[fieldLabel].includes(optionValue)) {
        this.checkboxSelections[fieldLabel].push(optionValue);
      }
    } else {
      // Remove from selections
      this.checkboxSelections[fieldLabel] = this.checkboxSelections[fieldLabel]
        .filter(value => value !== optionValue);
    }
  }

  canSelectMore(field: any): boolean {
    if (!field.maxSelections || field.maxSelections <= 0) {
      return true; // Unlimited selections
    }
    
    const currentSelections = this.checkboxSelections[field.label]?.length || 0;
    return currentSelections < field.maxSelections;
  }

  isCheckboxDisabled(field: any, optionValue: string): boolean {
    if (!this.canSelectMore(field)) {
      // If we can't select more, disable unchecked options
      const currentSelections = this.checkboxSelections[field.label] || [];
      return !currentSelections.includes(optionValue);
    }
    return false;
  }

  getSelectionStatus(field: any): string {
    const currentSelections = this.checkboxSelections[field.label]?.length || 0;
    const minSelections = field.minSelections || 0;
    const maxSelections = field.maxSelections || 0;

    if (maxSelections > 0) {
      return `${currentSelections}/${maxSelections} selected`;
    } else if (minSelections > 0) {
      return `${currentSelections} selected (min: ${minSelections})`;
    } else {
      return `${currentSelections} selected`;
    }
  }

  isSelectionValid(field: any): boolean {
    const currentSelections = this.checkboxSelections[field.label]?.length || 0;
    const minSelections = field.minSelections || 0;
    const maxSelections = field.maxSelections || 0;

    if (currentSelections < minSelections) {
      return false;
    }
    if (maxSelections > 0 && currentSelections > maxSelections) {
      return false;
    }
    return true;
  }
}