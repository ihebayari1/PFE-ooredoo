import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormCanvasComponent, ComponentType } from '../../core/models/component.model';

@Component({
  selector: 'app-form-preview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="form-preview-container">
      <div class="preview-header">
        <div class="header-content">
          <div class="title-section">
            <mat-icon class="preview-icon">preview</mat-icon>
            <h2 mat-dialog-title>Form Preview</h2>
          </div>
          <button mat-icon-button (click)="onClose()" class="close-button" matTooltip="Close Preview">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <mat-dialog-content class="preview-content">
        <div class="form-preview-wrapper">
          <!-- Form Header Card -->
          <mat-card class="form-header-card">
            <mat-card-content>
              <div class="form-title-section">
                <h1 class="form-title">{{formData?.name || 'Untitled Form'}}</h1>
                <p *ngIf="formData?.description" class="form-description">{{formData.description}}</p>
                <div class="form-meta">
                  <span class="field-count">
                    <mat-icon>list</mat-icon>
                    {{components.length}} field{{components.length !== 1 ? 's' : ''}}
                  </span>
                  <span class="required-count">
                    <mat-icon>star</mat-icon>
                    {{getRequiredFieldsCount()}} required
                  </span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Form Fields Card -->
          <mat-card class="form-fields-card">
            <mat-card-content>
              <form [formGroup]="previewForm" class="preview-form">
                <div *ngFor="let component of components; let i = index" class="preview-field">
                  <!-- Text Input -->
                  <mat-form-field *ngIf="component.elementType === 'TEXT'" appearance="outline" class="full-width">
                    <mat-label>{{component.label}}<span *ngIf="component.required" class="required">*</span></mat-label>
                    <input matInput [formControlName]="'field_' + i" [placeholder]="getPlaceholder(component)">
                    <mat-icon matSuffix>text_fields</mat-icon>
                  </mat-form-field>

                  <!-- Email Input -->
                  <mat-form-field *ngIf="component.elementType === 'EMAIL'" appearance="outline" class="full-width">
                    <mat-label>{{component.label}}<span *ngIf="component.required" class="required">*</span></mat-label>
                    <input matInput type="email" [formControlName]="'field_' + i" [placeholder]="getPlaceholder(component)">
                    <mat-icon matSuffix>email</mat-icon>
                  </mat-form-field>

                  <!-- Number Input -->
                  <mat-form-field *ngIf="component.elementType === 'NUMBER'" appearance="outline" class="full-width">
                    <mat-label>{{component.label}}<span *ngIf="component.required" class="required">*</span></mat-label>
                    <input matInput type="number" [formControlName]="'field_' + i" [placeholder]="getPlaceholder(component)">
                    <mat-icon matSuffix>numbers</mat-icon>
                  </mat-form-field>

                  <!-- Textarea -->
                  <mat-form-field *ngIf="component.elementType === 'TEXTAREA'" appearance="outline" class="full-width">
                    <mat-label>{{component.label}}<span *ngIf="component.required" class="required">*</span></mat-label>
                    <textarea matInput [formControlName]="'field_' + i" [placeholder]="getPlaceholder(component)" rows="4"></textarea>
                    <mat-icon matSuffix>notes</mat-icon>
                  </mat-form-field>

                  <!-- Dropdown -->
                  <mat-form-field *ngIf="component.elementType === 'DROPDOWN'" appearance="outline" class="full-width">
                    <mat-label>{{component.label}}<span *ngIf="component.required" class="required">*</span></mat-label>
                    <mat-select [formControlName]="'field_' + i">
                      <mat-option *ngFor="let option of component.options" [value]="option.value">
                        {{option.label}}
                      </mat-option>
                    </mat-select>
                    <mat-icon matSuffix>arrow_drop_down</mat-icon>
                  </mat-form-field>

                  <!-- Radio Buttons -->
                  <div *ngIf="component.elementType === 'RADIO'" class="radio-group">
                    <label class="radio-label">
                      <mat-icon class="label-icon">radio_button_checked</mat-icon>
                      {{component.label}}<span *ngIf="component.required" class="required">*</span>
                    </label>
                    <mat-radio-group [formControlName]="'field_' + i" class="radio-options">
                      <mat-radio-button *ngFor="let option of component.options" [value]="option.value" class="radio-option">
                        {{option.label}}
                      </mat-radio-button>
                    </mat-radio-group>
                  </div>

                  <!-- Checkboxes -->
                  <div *ngIf="component.elementType === 'CHECKBOX'" class="checkbox-group">
                    <label class="checkbox-label">
                      <mat-icon class="label-icon">check_box</mat-icon>
                      {{component.label}}<span *ngIf="component.required" class="required">*</span>
                    </label>
                    <div class="checkbox-options">
                      <mat-checkbox *ngFor="let option of component.options" [formControlName]="'field_' + i + '_' + option.value" class="checkbox-option">
                        {{option.label}}
                      </mat-checkbox>
                    </div>
                  </div>

                  <!-- Date Picker -->
                  <mat-form-field *ngIf="component.elementType === 'DATE'" appearance="outline" class="full-width">
                    <mat-label>{{component.label}}<span *ngIf="component.required" class="required">*</span></mat-label>
                    <input matInput [matDatepicker]="picker" [formControlName]="'field_' + i" [placeholder]="getPlaceholder(component)">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="preview-actions">
        <div class="actions-content">
          <button mat-raised-button color="primary" (click)="onClose()" class="done-btn">
            <mat-icon>check_circle</mat-icon>
            Done
          </button>
        </div>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .form-preview-container {
      min-width: 1000px;
      max-width: 1200px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 16px;
      overflow: hidden;
      animation: slideInUp 0.4s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .preview-header {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      padding: 0;
      margin: -24px -24px 0 -24px;
      border-radius: 8px 8px 0 0;

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;

        .title-section {
          display: flex;
          align-items: center;
          gap: 12px;

          .preview-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
          }

          h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 500;
            color: white;
          }
        }

        .close-button {
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;

          &:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }

    .preview-content {
      padding: 32px;
      overflow-y: auto;
      flex: 1;
      background: white;
      margin: 0 16px 16px 16px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .form-preview-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .form-header-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: none;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      animation: fadeInDown 0.6s ease-out 0.2s both;

      .form-title-section {
        text-align: center;
        padding: 20px;

        .form-title {
          margin: 0 0 12px 0;
          color: #2c3e50;
          font-size: 28px;
          font-weight: 600;
          line-height: 1.2;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .form-description {
          margin: 0 0 20px 0;
          color: #5a6c7d;
          font-size: 16px;
          line-height: 1.5;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .form-meta {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 16px;
          animation: fadeInUp 0.8s ease-out 0.8s both;

          .field-count, .required-count {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background-color: rgba(231, 76, 60, 0.1);
            border-radius: 20px;
            color: #e74c3c;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;

            &:hover {
              background-color: rgba(231, 76, 60, 0.2);
              transform: scale(1.05);
            }

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }
        }
      }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-fields-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: none;
      background: white;
      transition: all 0.3s ease;
      animation: fadeInUp 0.8s ease-out 1s both;

      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .preview-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        padding: 32px;
        
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 24px;
        }
      }
    }

    .preview-field {
      transition: all 0.3s ease;
      animation: fadeInUp 0.6s ease-out both;
      
      &:hover {
        transform: translateY(-1px);
      }

      &:nth-child(1) { animation-delay: 1.2s; }
      &:nth-child(2) { animation-delay: 1.4s; }
      &:nth-child(3) { animation-delay: 1.6s; }
      &:nth-child(4) { animation-delay: 1.8s; }
      &:nth-child(5) { animation-delay: 2.0s; }
      &:nth-child(6) { animation-delay: 2.2s; }
      &:nth-child(7) { animation-delay: 2.4s; }
      &:nth-child(8) { animation-delay: 2.6s; }
      &:nth-child(9) { animation-delay: 2.8s; }
      &:nth-child(10) { animation-delay: 3.0s; }

      .full-width {
        width: 100%;
        
        ::ng-deep .mat-mdc-form-field {
          .mat-mdc-text-field-wrapper {
            border-radius: 8px;
            border: 2px solid #e9ecef;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            
            &:hover {
              border-color: #e74c3c;
              box-shadow: 0 2px 8px rgba(231, 76, 60, 0.15);
            }
          }
          
          &.mat-focused .mat-mdc-text-field-wrapper {
            border-color: #e74c3c;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
          }

          .mat-mdc-form-field-label {
            color: #2c3e50;
            font-weight: 500;
          }

          .mat-mdc-input-element {
            color: #2c3e50;
            font-weight: 500;
            padding: 12px 16px;

            &::placeholder {
              color: #6c757d;
              font-weight: 400;
            }
          }

          .mat-mdc-form-field-icon-prefix,
          .mat-mdc-form-field-icon-suffix {
            color: #e74c3c;
            margin: 0 8px;
          }

          .mat-mdc-form-field-error {
            color: #f44336;
            font-weight: 500;
          }
        }

         // Enhanced Material Select Styling
         ::ng-deep .mat-mdc-select {
           .mat-mdc-select-trigger {
             padding: 12px 16px;
             border-radius: 8px;
             border: 2px solid #e9ecef !important;
             background: white !important;
             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
             transition: all 0.3s ease;
             min-height: 48px;
             display: flex;
             align-items: center;
             outline: none !important;

             &:hover {
               border-color: #e74c3c !important;
               box-shadow: 0 2px 8px rgba(231, 76, 60, 0.15);
             }

             .mat-mdc-select-value {
               color: #2c3e50;
               font-weight: 500;
             }

             .mat-mdc-select-placeholder {
               color: #6c757d;
               font-weight: 400;
             }

             .mat-mdc-select-arrow-wrapper {
               .mat-mdc-select-arrow {
                 color: #e74c3c;
                 font-size: 20px;
                 width: 20px;
                 height: 20px;
               }
             }
           }

           &.mat-focused .mat-mdc-select-trigger {
             border-color: #e74c3c !important;
             box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
             outline: none !important;
           }

           // Remove any black borders or outlines
           &.mat-mdc-select-disabled .mat-mdc-select-trigger {
             border-color: #e9ecef !important;
             background: #f8f9fa !important;
           }
         }
      }

      .required {
        color: #e74c3c;
        margin-left: 4px;
        font-weight: 600;
        animation: pulse 2s infinite;
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .radio-group, .checkbox-group {
      padding: 20px;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      border-radius: 12px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
      margin-bottom: 16px;

      &:hover {
        border-color: #e74c3c;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.1);
        transform: translateY(-1px);
      }

      .radio-label, .checkbox-label {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 20px;

        .label-icon {
          color: #e74c3c;
          font-size: 22px;
          width: 22px;
          height: 22px;
        }

        .required {
          color: #e74c3c;
          margin-left: 4px;
          animation: pulse 2s infinite;
        }
      }

      .radio-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .checkbox-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .radio-option, .checkbox-option {
        margin-bottom: 0;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateX(4px);
        }
      }
    }

    .preview-actions {
      padding: 24px 32px;
      margin: 0 16px 16px 16px;
      border-top: none;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      animation: fadeInUp 0.8s ease-out 1.4s both;

      .actions-content {
        display: flex;
        justify-content: center;
        gap: 16px;
        padding: 0;

        .done-btn {
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          color: white;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
          min-width: 150px;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
            background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          }
        }

        button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          font-weight: 500;
          border-radius: 8px;
          min-width: 120px;
          justify-content: center;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
    }

    // Responsive design
    @media (max-width: 1024px) {
      .form-preview-container {
        min-width: 95vw;
        max-width: 98vw;
      }

      .preview-content {
        padding: 24px;
        margin: 0 8px 8px 8px;
      }

      .form-fields-card .preview-form {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 24px;
      }
    }

    @media (max-width: 768px) {
      .form-preview-container {
        min-width: 100vw;
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
      }

      .preview-header .header-content {
        padding: 16px 20px;

        .title-section {
          gap: 8px;

          .preview-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }

          h2 {
          font-size: 20px;
          }
        }
      }

      .preview-content {
        padding: 16px;
        margin: 0;
        border-radius: 0;
      }

      .form-header-card .form-title-section {
        padding: 16px;

        .form-title {
          font-size: 24px;
        }

        .form-description {
          font-size: 14px;
        }

        .form-meta {
          flex-direction: column;
          gap: 12px;
        }
      }

      .form-fields-card .preview-form {
        padding: 16px;
        gap: 16px;
      }

      .preview-actions {
        padding: 16px;
        margin: 0;
        border-radius: 0;

        .actions-content {
        flex-direction: column;
          gap: 12px;

        button {
          width: 100%;
          justify-content: center;
            min-width: auto;
          }
        }
      }

      .radio-group, .checkbox-group {
        padding: 16px;
        margin-bottom: 12px;

        .radio-label, .checkbox-label {
          font-size: 14px;
          margin-bottom: 16px;
        }
      }
    }

    // Enhanced Material Select Panel Styling
    ::ng-deep .mat-mdc-select-panel {
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
      border: 1px solid rgba(231, 76, 60, 0.1) !important;
      overflow: hidden !important;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%) !important;
      max-height: 300px !important;
    }

    ::ng-deep .mat-mdc-option {
      padding: 12px 20px !important;
      margin: 4px 8px !important;
      border-radius: 8px !important;
      transition: all 0.3s ease !important;
      font-weight: 500 !important;
      font-size: 14px !important;
      color: #2c3e50 !important;
      background: rgba(255, 255, 255, 0.8) !important;
      border: 1px solid rgba(231, 76, 60, 0.1) !important;

      &:hover {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
        color: white !important;
        transform: translateX(4px) !important;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3) !important;
        border-color: transparent !important;
      }

      &.mat-mdc-option-active {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
        color: white !important;
      }

      &.mat-mdc-option-selected {
        background: linear-gradient(135deg, #c0392b 0%, #a93226 100%) !important;
        color: white !important;
        font-weight: 600 !important;
      }
    }

    // Enhanced Date Picker Styling
    ::ng-deep .mat-mdc-datepicker-toggle {
      .mat-mdc-icon-button {
        color: #e74c3c !important;
        transition: all 0.3s ease !important;

        &:hover {
          background-color: rgba(231, 76, 60, 0.1) !important;
          transform: scale(1.1) !important;
        }
      }
    }

     ::ng-deep .mat-mdc-datepicker-popup {
       border-radius: 12px !important;
       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
       border: 1px solid rgba(231, 76, 60, 0.1) !important;
       background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%) !important;
     }

     // Remove any black borders or outlines from all form elements
     ::ng-deep {
       .mat-mdc-form-field,
       .mat-mdc-select,
       .mat-mdc-input-element,
       .mat-mdc-text-field-wrapper {
         outline: none !important;
         border-color: #e9ecef !important;
         
         &:focus,
         &:focus-within,
         &.mat-focused {
           outline: none !important;
           border-color: #e74c3c !important;
         }
       }

       // Ensure no black borders on any Material components
       .mat-mdc-form-field-outline,
       .mat-mdc-form-field-outline-start,
       .mat-mdc-form-field-outline-end,
       .mat-mdc-form-field-outline-gap {
         border-color: #e9ecef !important;
       }

       .mat-mdc-form-field.mat-focused {
         .mat-mdc-form-field-outline,
         .mat-mdc-form-field-outline-start,
         .mat-mdc-form-field-outline-end,
         .mat-mdc-form-field-outline-gap {
           border-color: #e74c3c !important;
         }
       }
     }
   `]
})
export class FormPreviewDialogComponent {
  previewForm!: FormGroup;
  components: FormCanvasComponent[] = [];
  formData: any = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { components: FormCanvasComponent[], formData: any }
  ) {
    this.components = data.components || [];
    this.formData = data.formData || null;
    
    console.log('Preview dialog received components:', this.components);
    this.components.forEach((comp, index) => {
      console.log(`Component ${index}:`, comp);
      console.log(`Component ${index} options:`, comp.options);
    });
    
    this.initializeForm();
  }

  private initializeForm(): void {
    const formControls: any = {};
    
    this.components.forEach((component, index) => {
      if (component.elementType === ComponentType.CHECKBOX) {
        // Create separate controls for each checkbox option
        component.options?.forEach(option => {
          formControls[`field_${index}_${option.value}`] = this.fb.control(false);
        });
      } else {
        formControls[`field_${index}`] = this.fb.control('');
      }
    });

    this.previewForm = this.fb.group(formControls);
  }

  getPlaceholder(component: FormCanvasComponent): string {
    const placeholderProp = component.properties?.find(p => p.propertyName === 'placeholder');
    return placeholderProp?.propertyValue || `Enter ${component.label.toLowerCase()}`;
  }

  getRequiredFieldsCount(): number {
    return this.components.filter(component => component.required).length;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
