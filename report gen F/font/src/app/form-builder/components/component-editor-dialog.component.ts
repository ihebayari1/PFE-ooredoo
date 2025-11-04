import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ComponentEditorData, FormCanvasComponent, ElementOption, ComponentType, ComponentProperty } from '../../core/models/component.model';
import { ComponentService } from '../../core/services/component.service';

@Component({
  selector: 'app-component-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatSelectModule
  ],
  template: `
    <div class="component-editor">
      <div class="editor-header">
        <h2 mat-dialog-title>
          <mat-icon>edit</mat-icon>
          Edit Component
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="editorForm" class="editor-form">
          <!-- Component Type -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Component Type</mat-label>
            <mat-select formControlName="elementType" [disabled]="true">
              <mat-option *ngFor="let type of componentTypes" [value]="type.value">
                {{type.displayName}}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>widgets</mat-icon>
          </mat-form-field>

          <!-- Component Label -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Label</mat-label>
            <input matInput formControlName="label" placeholder="Enter component label">
            <mat-icon matPrefix>label</mat-icon>
            <mat-error *ngIf="editorForm.get('label')?.hasError('required')">
              Label is required
            </mat-error>
          </mat-form-field>

          <!-- Required Field -->
          <div class="checkbox-section">
            <mat-checkbox formControlName="required">
              Required field
            </mat-checkbox>
          </div>

          <mat-divider *ngIf="hasOptions"></mat-divider>

          <!-- Options Section (for dropdown, radio, checkbox) -->
          <div *ngIf="hasOptions" class="options-section">
            <h3>Options</h3>
            <div class="options-list">
              <div *ngFor="let option of options; let i = index" class="option-item">
                <mat-form-field appearance="outline" class="option-input">
                  <mat-label>Option {{i + 1}} Label</mat-label>
                  <input matInput 
                         [value]="option.label" 
                         (input)="updateOptionLabel(i, $any($event.target).value)"
                         placeholder="Enter option label">
                </mat-form-field>
                <mat-form-field appearance="outline" class="option-input">
                  <mat-label>Option {{i + 1}} Value</mat-label>
                  <input matInput 
                         [value]="option.value" 
                         (input)="updateOptionValue(i, $any($event.target).value)"
                         placeholder="Enter option value">
                </mat-form-field>
                <button mat-icon-button (click)="removeOption(i)" class="remove-option">
                  <mat-icon>remove_circle</mat-icon>
                </button>
              </div>
            </div>
            <button mat-stroked-button (click)="addOption()" class="add-option-btn">
              <mat-icon>add</mat-icon>
              Add Option
            </button>
          </div>

          <mat-divider></mat-divider>

          <!-- Properties Section -->
          <div class="properties-section">
            <h3>Properties</h3>
            
            <!-- Placeholder (for text inputs and dropdown) -->
            <mat-form-field *ngIf="isTextInput || isDropdown" appearance="outline" class="full-width">
              <mat-label>Placeholder</mat-label>
              <input matInput formControlName="placeholder" placeholder="Enter placeholder text">
              <mat-icon matPrefix>text_fields</mat-icon>
            </mat-form-field>

            <!-- Max Length (for text inputs) -->
            <mat-form-field *ngIf="isTextInput" appearance="outline" class="half-width">
              <mat-label>Max Length</mat-label>
              <input matInput type="number" formControlName="maxLength" placeholder="255">
              <mat-icon matPrefix>straighten</mat-icon>
            </mat-form-field>

            <!-- Min Length (for text inputs) -->
            <mat-form-field *ngIf="isTextInput" appearance="outline" class="half-width">
              <mat-label>Min Length</mat-label>
              <input matInput type="number" formControlName="minLength" placeholder="0">
              <mat-icon matPrefix>straighten</mat-icon>
            </mat-form-field>

            <!-- Number specific properties -->
            <div *ngIf="isNumberInput" class="number-properties">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Min Value</mat-label>
                <input matInput type="number" formControlName="min" placeholder="Min value">
                <mat-icon matPrefix>keyboard_arrow_down</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Max Value</mat-label>
                <input matInput type="number" formControlName="max" placeholder="Max value">
                <mat-icon matPrefix>keyboard_arrow_up</mat-icon>
              </mat-form-field>
            </div>

            <!-- Textarea specific properties -->
            <div *ngIf="isTextarea" class="textarea-properties">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Rows</mat-label>
                <input matInput type="number" formControlName="rows" min="1" max="20" placeholder="4">
                <mat-icon matPrefix>format_line_spacing</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Columns</mat-label>
                <input matInput type="number" formControlName="cols" min="10" max="100" placeholder="50">
                <mat-icon matPrefix>format_align_left</mat-icon>
              </mat-form-field>
            </div>

            <!-- Dropdown specific properties -->
            <div *ngIf="isDropdown" class="dropdown-properties">
              <mat-checkbox formControlName="allowMultiple">
                Allow Multiple Selection
              </mat-checkbox>
              <mat-checkbox formControlName="searchable">
                Searchable Dropdown
              </mat-checkbox>
            </div>

            <!-- Radio/Checkbox specific properties -->
            <div *ngIf="isRadioOrCheckbox" class="choice-properties">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Layout</mat-label>
                <mat-select formControlName="layout">
                  <mat-option value="vertical">Vertical</mat-option>
                  <mat-option value="horizontal">Horizontal</mat-option>
                </mat-select>
                <mat-icon matPrefix>view_module</mat-icon>
              </mat-form-field>
            </div>

            <!-- Checkbox specific properties -->
            <div *ngIf="isCheckbox" class="checkbox-properties">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Min Selections</mat-label>
                <input matInput type="number" formControlName="minSelections" min="0" placeholder="0">
                <mat-icon matPrefix>check_box</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Max Selections</mat-label>
                <input matInput type="number" formControlName="maxSelections" min="1" placeholder="Unlimited">
                <mat-icon matPrefix>check_box_outline_blank</mat-icon>
              </mat-form-field>
            </div>

            <!-- Date specific properties -->
            <div *ngIf="isDate" class="date-properties">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Date Format</mat-label>
                <mat-select formControlName="format">
                  <mat-option value="yyyy-MM-dd">YYYY-MM-DD</mat-option>
                  <mat-option value="MM/dd/yyyy">MM/DD/YYYY</mat-option>
                  <mat-option value="dd/MM/yyyy">DD/MM/YYYY</mat-option>
                </mat-select>
                <mat-icon matPrefix>date_range</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Placeholder</mat-label>
                <input matInput formControlName="datePlaceholder" placeholder="Select date">
                <mat-icon matPrefix>event</mat-icon>
              </mat-form-field>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="editorForm.invalid">
          <mat-icon>save</mat-icon>
          Save
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .component-editor {
      min-width: 800px;
      max-width: 1000px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 16px;
      overflow: hidden;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      margin: -24px -24px 0 -24px;
      border-radius: 16px 16px 0 0;

      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        color: white;
        font-size: 24px;
        font-weight: 600;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
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

    .editor-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding: 32px;
      background: white;
      margin: 0 16px 16px 16px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 24px;
      }
    }

    .full-width {
      width: 100%;
      grid-column: 1 / -1;
      transition: all 0.3s ease;

      ::ng-deep .mat-mdc-form-field {
        .mat-mdc-text-field-wrapper {
          border-radius: 8px;
          transition: all 0.3s ease;
          
          &:hover {
            box-shadow: 0 2px 8px rgba(231, 76, 60, 0.2);
          }
        }
        
        &.mat-focused .mat-mdc-text-field-wrapper {
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
      }
    }

    .half-width {
      width: 100%;
      transition: all 0.3s ease;

      ::ng-deep .mat-mdc-form-field {
        .mat-mdc-text-field-wrapper {
          border-radius: 8px;
          transition: all 0.3s ease;
          
          &:hover {
            box-shadow: 0 2px 8px rgba(231, 76, 60, 0.2);
          }
        }
        
        &.mat-focused .mat-mdc-text-field-wrapper {
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
      }
    }

    .checkbox-section {
      padding: 16px;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      border-radius: 12px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;

      &:hover {
        border-color: #e74c3c;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.1);
      }

      ::ng-deep .mat-mdc-checkbox {
        .mdc-checkbox {
          .mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background {
            background-color: #e74c3c;
            border-color: #e74c3c;
          }
        }
      }
    }

    .options-section, .properties-section {
      grid-column: 1 / -1;
      padding: 24px;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      border-radius: 12px;
      border: 2px solid #e9ecef;
      margin-top: 16px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #e74c3c;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.1);
        transform: translateY(-1px);
      }

      h3 {
        margin: 0 0 20px 0;
        color: #e74c3c;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: '⚙️';
          font-size: 20px;
        }
      }
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;

      &:hover {
        border-color: #e74c3c;
        box-shadow: 0 2px 8px rgba(231, 76, 60, 0.1);
        transform: translateY(-1px);
      }

      .option-input {
        flex: 1;
        min-width: 200px;

        ::ng-deep .mat-mdc-form-field {
          .mat-mdc-text-field-wrapper {
            border-radius: 6px;
            transition: all 0.3s ease;
            
            &:hover {
              box-shadow: 0 2px 6px rgba(231, 76, 60, 0.15);
            }
          }
        }
      }

      .remove-option {
        color: #f44336;
        flex-shrink: 0;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(244, 67, 54, 0.1);
          transform: scale(1.1);
        }
      }
    }

    .add-option-btn {
      color: #e74c3c;
      border-color: #e74c3c;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 500;

      &:hover {
        background-color: #e74c3c;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
      }
    }

    .number-properties,
    .textarea-properties,
    .date-properties,
    .checkbox-properties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;

      &:hover {
        border-color: #e74c3c;
        box-shadow: 0 2px 8px rgba(231, 76, 60, 0.1);
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      gap: 16px;
      }
    }

    .dropdown-properties,
    .choice-properties {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 20px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;

      &:hover {
        border-color: #e74c3c;
        box-shadow: 0 2px 8px rgba(231, 76, 60, 0.1);
      }
    }

    .dropdown-properties mat-checkbox {
      margin-bottom: 8px;
    }

    mat-dialog-actions {
      padding: 24px 32px;
      margin: 0 16px 16px 16px;
      border-top: none;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      button {
        margin-left: 12px;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
        min-width: 100px;

        &[mat-button] {
          color: #6c757d;
          border: 1px solid #6c757d;

          &:hover {
            background-color: #6c757d;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
          }
        }

        &[mat-raised-button] {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
            background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }
  `]
})
export class ComponentEditorDialogComponent {
  editorForm!: FormGroup;
  options: ElementOption[] = [];
  componentTypes = [
    { value: ComponentType.TEXT, displayName: 'Text Input' },
    { value: ComponentType.EMAIL, displayName: 'Email Input' },
    { value: ComponentType.NUMBER, displayName: 'Number Input' },
    { value: ComponentType.TEXTAREA, displayName: 'Text Area' },
    { value: ComponentType.DROPDOWN, displayName: 'Dropdown Select' },
    { value: ComponentType.RADIO, displayName: 'Radio Button Group' },
    { value: ComponentType.CHECKBOX, displayName: 'Checkbox Group' },
    { value: ComponentType.DATE, displayName: 'Date Picker' }
  ];

  constructor(
    private fb: FormBuilder,
    private componentService: ComponentService,
    public dialogRef: MatDialogRef<ComponentEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComponentEditorData
  ) {
    this.initializeForm();
    this.loadComponentData();
  }

  get hasOptions(): boolean {
    const type = this.editorForm.get('elementType')?.value;
    return type === ComponentType.DROPDOWN || type === ComponentType.RADIO || type === ComponentType.CHECKBOX;
  }

  get isTextInput(): boolean {
    const type = this.editorForm.get('elementType')?.value;
    return type === ComponentType.TEXT || type === ComponentType.EMAIL;
  }

  get isNumberInput(): boolean {
    const type = this.editorForm.get('elementType')?.value;
    return type === ComponentType.NUMBER;
  }

  get isTextarea(): boolean {
    const type = this.editorForm.get('elementType')?.value;
    return type === ComponentType.TEXTAREA;
  }

  get isDropdown(): boolean {
    const type = this.editorForm.get('elementType')?.value;
    return type === ComponentType.DROPDOWN;
  }

  get isRadioOrCheckbox(): boolean {
    const type = this.editorForm.get('elementType')?.value;
    return type === ComponentType.RADIO || type === ComponentType.CHECKBOX;
  }

  get isCheckbox(): boolean {
    const type = this.editorForm.get('elementType')?.value;
    return type === ComponentType.CHECKBOX;
  }

  get isDate(): boolean {
    const type = this.editorForm.get('elementType')?.value;
    return type === ComponentType.DATE;
  }

  private initializeForm(): void {
    this.editorForm = this.fb.group({
      elementType: ['', Validators.required],
      label: ['', Validators.required],
      required: [false],
      placeholder: [''],
      maxLength: [255],
      minLength: [0],
      min: [''],
      max: [''],
      rows: [4],
      cols: [50],
      allowMultiple: [false],
      searchable: [false],
      layout: ['vertical'],
      minSelections: [0],
      maxSelections: [''],
      format: ['yyyy-MM-dd'],
      datePlaceholder: ['Select date']
    });
  }

  private loadComponentData(): void {
    if (this.data.component) {
      // Load basic component data
      this.editorForm.patchValue({
        elementType: this.data.component.elementType,
        label: this.data.component.label,
        required: this.data.component.required,
        placeholder: this.getPropertyValue('placeholder'),
        maxLength: this.getPropertyValue('maxLength') || 255,
        minLength: this.getPropertyValue('minLength') || 0,
        min: this.getPropertyValue('min'),
        max: this.getPropertyValue('max'),
        rows: this.getPropertyValue('rows') || 4,
        cols: this.getPropertyValue('cols') || 50,
        allowMultiple: this.getPropertyValue('allowMultiple') === 'true',
        searchable: this.getPropertyValue('searchable') === 'true',
        layout: this.getPropertyValue('layout') || 'vertical',
        minSelections: this.getPropertyValue('minSelections') || 0,
        maxSelections: this.getPropertyValue('maxSelections'),
        format: this.getPropertyValue('format') || 'yyyy-MM-dd',
        datePlaceholder: this.getPropertyValue('datePlaceholder') || 'Select date'
      });

      // Load options - create a deep copy to preserve IDs
      if (this.data.component.options && this.data.component.options.length > 0) {
        this.options = this.data.component.options.map(opt => ({
          id: opt.id,
          label: opt.label || '',
          value: opt.value || '',
          displayOrder: opt.displayOrder !== undefined ? opt.displayOrder : 0,
          componentId: opt.componentId
        }));
      } else {
        this.options = [];
      }
      console.log('Loaded options from component:', this.options);
      console.log('Options with IDs:', this.options.map(o => ({ id: o.id, label: o.label, value: o.value })));
      
      // Only load defaults if this is a new component AND no options exist
      if (this.data.isNew && this.options.length === 0 && this.hasOptions) {
        this.loadDefaultOptions();
      }
    } else {
      // For new components, load default properties and options
      this.loadDefaultProperties();
      if (this.hasOptions) {
        this.loadDefaultOptions();
      }
    }
  }

  private getPropertyValue(propertyName: string): string {
    const property = this.data.component?.properties?.find(p => p.propertyName === propertyName);
    return property?.propertyValue || '';
  }

  private loadDefaultProperties(): void {
    const componentType = this.editorForm.get('elementType')?.value;
    if (!componentType) return;

    // Load default properties based on component type
    const defaultProperties = this.getDefaultPropertiesForType(componentType);
    
    // Update form with default values
    Object.keys(defaultProperties).forEach(key => {
      const control = this.editorForm.get(key);
      if (control && defaultProperties[key] !== undefined) {
        control.setValue(defaultProperties[key]);
      }
    });
  }

  private loadDefaultOptions(): void {
    const componentType = this.editorForm.get('elementType')?.value;
    if (!componentType) return;

    const defaultOptions = this.getDefaultOptionsForType(componentType);
    this.options = [...defaultOptions];
  }

  private getDefaultPropertiesForType(componentType: ComponentType): any {
    const defaults: any = {};

    switch (componentType) {
      case ComponentType.TEXT:
        defaults.placeholder = 'Enter text';
        defaults.maxLength = 255;
        defaults.minLength = 0;
        break;
      case ComponentType.EMAIL:
        defaults.placeholder = 'Enter email address';
        defaults.maxLength = 255;
        break;
      case ComponentType.NUMBER:
        defaults.placeholder = 'Enter number';
        defaults.min = '';
        defaults.max = '';
        break;
      case ComponentType.TEXTAREA:
        defaults.placeholder = 'Enter text';
        defaults.rows = 4;
        defaults.cols = 50;
        defaults.maxLength = 1000;
        defaults.minLength = 0;
        break;
      case ComponentType.DROPDOWN:
        defaults.placeholder = 'Select an option';
        defaults.allowMultiple = false;
        defaults.searchable = false;
        break;
      case ComponentType.RADIO:
        defaults.layout = 'vertical';
        break;
      case ComponentType.CHECKBOX:
        defaults.layout = 'vertical';
        defaults.minSelections = 0;
        defaults.maxSelections = '';
        break;
      case ComponentType.DATE:
        defaults.format = 'yyyy-MM-dd';
        defaults.datePlaceholder = 'Select date';
        break;
    }

    return defaults;
  }

  private getDefaultOptionsForType(componentType: ComponentType): ElementOption[] {
    const defaultOptions: ElementOption[] = [];

    switch (componentType) {
      case ComponentType.RADIO:
        defaultOptions.push(
          { label: 'Option 1', value: 'option1', displayOrder: 1 },
          { label: 'Option 2', value: 'option2', displayOrder: 2 },
          { label: 'Option 3', value: 'option3', displayOrder: 3 }
        );
        break;
      case ComponentType.CHECKBOX:
        defaultOptions.push(
          { label: 'Choice 1', value: 'choice1', displayOrder: 1 },
          { label: 'Choice 2', value: 'choice2', displayOrder: 2 },
          { label: 'Choice 3', value: 'choice3', displayOrder: 3 }
        );
        break;
      case ComponentType.DROPDOWN:
        defaultOptions.push(
          { label: 'Please select', value: '', displayOrder: 0 },
          { label: 'Option 1', value: 'option1', displayOrder: 1 },
          { label: 'Option 2', value: 'option2', displayOrder: 2 }
        );
        break;
    }

    return defaultOptions;
  }

  addOption(): void {
    const newOption: ElementOption = {
      label: '',
      value: '',
      displayOrder: this.options.length
    };
    this.options.push(newOption);
  }

  removeOption(index: number): void {
    this.options.splice(index, 1);
  }

  updateOptionLabel(index: number, value: string): void {
    console.log(`updateOptionLabel called: index=${index}, value="${value}"`);
    if (this.options[index]) {
      console.log(`Before update: label="${this.options[index].label}"`);
      this.options[index].label = value;
      console.log(`After update: label="${this.options[index].label}"`);
      // Auto-generate value if empty
      if (!this.options[index].value) {
        this.options[index].value = value.toLowerCase().replace(/\s+/g, '_');
      }
    }
  }

  updateOptionValue(index: number, value: string): void {
    console.log(`updateOptionValue called: index=${index}, value="${value}"`);
    if (this.options[index]) {
      console.log(`Before update: value="${this.options[index].value}"`);
      this.options[index].value = value;
      console.log(`After update: value="${this.options[index].value}"`);
    }
  }

  onSave(): void {
    if (this.editorForm.valid) {
      const formValue = this.editorForm.value;
      
      console.log('Current options array:', this.options);
      
      // Map options, preserving IDs for existing options and ensuring proper structure
      const mappedOptions: ElementOption[] = this.options.map((option, index) => {
        const mappedOption: ElementOption = {
          label: option.label || '',
          value: option.value || option.label.toLowerCase().replace(/\s+/g, '_'),
          displayOrder: index
        };
        
        // Preserve ID if it exists (for existing options)
        if (option.id !== undefined && option.id !== null) {
          mappedOption.id = option.id;
        }
        
        // Preserve componentId if it exists
        if (option.componentId !== undefined && option.componentId !== null) {
          mappedOption.componentId = option.componentId;
        }
        
        return mappedOption;
      });
      
      const updatedComponent: FormCanvasComponent = {
        ...this.data.component,
        ...formValue,
        properties: this.buildPropertiesFromForm(formValue),
        options: mappedOptions
      };

      console.log('Updated component being sent:', updatedComponent);
      console.log('Options being sent:', updatedComponent.options);
      console.log('Options with IDs:', updatedComponent.options.map(o => ({ id: o.id, label: o.label, value: o.value })));
      console.log('Assignment ID:', updatedComponent.assignmentId);

      this.dialogRef.close(updatedComponent);
    }
  }

  private buildPropertiesFromForm(formValue: any): ComponentProperty[] {
    const properties: ComponentProperty[] = [];
    const componentType = formValue.elementType;

    // Add properties based on component type
    if (formValue.placeholder) {
      properties.push({
        propertyName: 'placeholder',
        propertyValue: formValue.placeholder
      });
    }

    if (componentType === ComponentType.TEXT || componentType === ComponentType.EMAIL || componentType === ComponentType.TEXTAREA) {
      if (formValue.maxLength) {
        properties.push({
          propertyName: 'maxLength',
          propertyValue: formValue.maxLength.toString()
        });
      }
      if (formValue.minLength) {
        properties.push({
          propertyName: 'minLength',
          propertyValue: formValue.minLength.toString()
        });
      }
    }

    if (componentType === ComponentType.NUMBER) {
      if (formValue.min) {
        properties.push({
          propertyName: 'min',
          propertyValue: formValue.min.toString()
        });
      }
      if (formValue.max) {
        properties.push({
          propertyName: 'max',
          propertyValue: formValue.max.toString()
        });
      }
    }

    if (componentType === ComponentType.TEXTAREA) {
      if (formValue.rows) {
        properties.push({
          propertyName: 'rows',
          propertyValue: formValue.rows.toString()
        });
      }
      if (formValue.cols) {
        properties.push({
          propertyName: 'cols',
          propertyValue: formValue.cols.toString()
        });
      }
    }

    if (componentType === ComponentType.DROPDOWN) {
      properties.push({
        propertyName: 'allowMultiple',
        propertyValue: formValue.allowMultiple.toString()
      });
      properties.push({
        propertyName: 'searchable',
        propertyValue: formValue.searchable.toString()
      });
    }

    if (componentType === ComponentType.RADIO || componentType === ComponentType.CHECKBOX) {
      properties.push({
        propertyName: 'layout',
        propertyValue: formValue.layout
      });
    }

    if (componentType === ComponentType.CHECKBOX) {
      properties.push({
        propertyName: 'minSelections',
        propertyValue: formValue.minSelections.toString()
      });
      if (formValue.maxSelections) {
        properties.push({
          propertyName: 'maxSelections',
          propertyValue: formValue.maxSelections.toString()
        });
      }
    }

    if (componentType === ComponentType.DATE) {
      properties.push({
        propertyName: 'format',
        propertyValue: formValue.format
      });
      if (formValue.datePlaceholder) {
        properties.push({
          propertyName: 'datePlaceholder',
          propertyValue: formValue.datePlaceholder
        });
      }
    }

    return properties;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
