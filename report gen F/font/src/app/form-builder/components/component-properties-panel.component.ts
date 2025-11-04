import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { FormComponentAssignment, ComponentType, ElementOption, ComponentProperty } from '../../core/models/form.model';
import { ComponentService } from '../../core/services/component.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-component-properties-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="properties-panel" *ngIf="selectedComponent">
      <mat-card class="properties-card">
        <mat-card-header>
          <mat-card-title>Component Properties</mat-card-title>
          <mat-card-subtitle>{{ selectedComponent.componentType }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="propertiesForm" (ngModelChange)="onFormChange()">
            
            <!-- Basic Properties -->
            <div class="expansion-group">
              <mat-expansion-panel expanded>
                <mat-expansion-panel-header>
                  <mat-panel-title>Basic Settings</mat-panel-title>
                </mat-expansion-panel-header>

                <div class="form-field">
                  <mat-form-field appearance="outline">
                    <mat-label>Label</mat-label>
                    <input matInput formControlName="label" placeholder="Enter field label">
                  </mat-form-field>
                </div>

                <div class="form-field">
                  <mat-slide-toggle formControlName="required">
                    Required Field
                  </mat-slide-toggle>
                </div>

                <div class="form-field">
                  <mat-form-field appearance="outline">
                    <mat-label>Help Text</mat-label>
                    <input matInput formControlName="helpText" placeholder="Optional help text">
                  </mat-form-field>
                </div>
              </mat-expansion-panel>

              <!-- Component-specific Properties -->
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Advanced Properties</mat-panel-title>
                </mat-expansion-panel-header>

                <!-- Text/Email specific -->
                <div *ngIf="isTextInput()" class="form-field">
                  <mat-form-field appearance="outline">
                    <mat-label>Placeholder</mat-label>
                    <input matInput formControlName="placeholder" placeholder="Enter placeholder text">
                  </mat-form-field>
                </div>

                <!-- Text/Email/Textarea length properties -->
                <div *ngIf="isTextBasedField()" class="text-properties">
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Max Length</mat-label>
                      <input matInput type="number" formControlName="maxLength" placeholder="255">
                    </mat-form-field>
                  </div>
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Min Length</mat-label>
                      <input matInput type="number" formControlName="minLength" placeholder="0">
                    </mat-form-field>
                  </div>
                </div>

                <!-- Number specific -->
                <div *ngIf="isNumberInput()" class="number-properties">
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Placeholder</mat-label>
                      <input matInput formControlName="placeholder" placeholder="Enter number">
                    </mat-form-field>
                  </div>
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Minimum Value</mat-label>
                      <input matInput type="number" formControlName="min" placeholder="Min value">
                    </mat-form-field>
                  </div>
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Maximum Value</mat-label>
                      <input matInput type="number" formControlName="max" placeholder="Max value">
                    </mat-form-field>
                  </div>
                </div>

                <!-- Textarea specific -->
                <div *ngIf="isTextarea()" class="textarea-properties">
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Rows</mat-label>
                      <input matInput type="number" formControlName="rows" min="1" max="20" placeholder="4">
                    </mat-form-field>
                  </div>
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Columns</mat-label>
                      <input matInput type="number" formControlName="cols" min="10" max="100" placeholder="50">
                    </mat-form-field>
                  </div>
                </div>

                <!-- Dropdown specific -->
                <div *ngIf="isDropdown()" class="dropdown-properties">
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Placeholder</mat-label>
                      <input matInput formControlName="placeholder" placeholder="Select an option">
                    </mat-form-field>
                  </div>
                  <div class="checkbox-group">
                    <mat-checkbox formControlName="allowMultiple">
                      Allow Multiple Selection
                    </mat-checkbox>
                    <mat-checkbox formControlName="searchable">
                      Searchable Dropdown
                    </mat-checkbox>
                  </div>
                </div>

                <!-- Radio/Checkbox layout -->
                <div *ngIf="isRadioOrCheckbox()" class="choice-properties">
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Layout</mat-label>
                      <mat-select formControlName="layout">
                        <mat-option value="vertical">Vertical</mat-option>
                        <mat-option value="horizontal">Horizontal</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Checkbox specific -->
                <div *ngIf="isCheckbox()" class="checkbox-properties">
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Minimum Selections</mat-label>
                      <input matInput type="number" formControlName="minSelections" min="0" placeholder="0">
                    </mat-form-field>
                  </div>
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Maximum Selections</mat-label>
                      <input matInput type="number" formControlName="maxSelections" min="1" placeholder="Unlimited">
                    </mat-form-field>
                  </div>
                </div>

                <!-- Date specific -->
                <div *ngIf="isDate()" class="date-properties">
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Date Format</mat-label>
                      <mat-select formControlName="format">
                        <mat-option value="yyyy-MM-dd">YYYY-MM-DD</mat-option>
                        <mat-option value="MM/dd/yyyy">MM/DD/YYYY</mat-option>
                        <mat-option value="dd/MM/yyyy">DD/MM/YYYY</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <div class="form-field">
                    <mat-form-field appearance="outline">
                      <mat-label>Placeholder</mat-label>
                      <input matInput formControlName="datePlaceholder" placeholder="Select date">
                    </mat-form-field>
                  </div>
                </div>
              </mat-expansion-panel>

              <!-- Options for Choice Fields -->
              <mat-expansion-panel *ngIf="isChoiceField()">
                <mat-expansion-panel-header>
                  <mat-panel-title>Options</mat-panel-title>
                </mat-expansion-panel-header>

                <div class="options-container">
                  <div class="option-item" *ngFor="let option of options; let i = index; trackBy: trackByIndex">
                    <mat-form-field appearance="outline">
                      <mat-label>Option {{ i + 1 }}</mat-label>
                      <input 
                        matInput 
                        [(ngModel)]="option.label" 
                        (ngModelChange)="updateOption(i, 'label', $event)"
                        placeholder="Option label">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Value</mat-label>
                      <input 
                        matInput 
                        [(ngModel)]="option.value" 
                        (ngModelChange)="updateOption(i, 'value', $event)"
                        placeholder="Option value">
                    </mat-form-field>

                    <button 
                      mat-icon-button 
                      color="warn" 
                      (click)="removeOption(i)"
                      matTooltip="Remove option">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <button 
                    mat-stroked-button 
                    (click)="addOption()"
                    class="add-option-btn">
                    <mat-icon>add</mat-icon>
                    Add Option
                  </button>
                </div>
              </mat-expansion-panel>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <button 
            mat-button 
            color="warn" 
            (click)="deleteComponent()"
            matTooltip="Delete this component">
            <mat-icon>delete</mat-icon>
            Delete
          </button>
          <div class="spacer"></div>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="saveProperties()"
            [disabled]="propertiesForm.invalid">
            Save Changes
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <div class="no-selection" *ngIf="!selectedComponent">
      <mat-icon>settings</mat-icon>
      <p>Select a component to edit its properties</p>
    </div>
  `,
  styles: [`
    .properties-panel {
      height: 100%;
      overflow-y: auto;
      padding: 16px;
    }

    .properties-card {
      max-width: 400px;
      margin: 0 auto;
    }

    .form-field {
      margin-bottom: 16px;
    }

    .number-properties,
    .date-properties,
    .checkbox-properties,
    .text-properties,
    .textarea-properties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .dropdown-properties,
    .choice-properties {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .options-container {
      margin-top: 16px;
    }

    .option-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .option-item mat-form-field {
      flex: 1;
    }

    .add-option-btn {
      width: 100%;
      margin-top: 8px;
    }

    .spacer {
      flex: 1;
    }

    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
      text-align: center;
      padding: 32px;
    }

    .no-selection mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .no-selection p {
      margin: 0;
      font-size: 16px;
    }
  `]
})
export class ComponentPropertiesPanelComponent implements OnInit, OnDestroy {
  @Input() selectedComponent: FormComponentAssignment | null = null;
  @Output() componentUpdated = new EventEmitter<FormComponentAssignment>();
  @Output() componentDeleted = new EventEmitter<FormComponentAssignment>();

  propertiesForm: FormGroup;
  options: ElementOption[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private componentService: ComponentService,
    private notificationService: NotificationService
  ) {
    this.propertiesForm = this.fb.group({
      label: ['', Validators.required],
      required: [false],
      helpText: [''],
      placeholder: [''],
      maxLength: [255],
      minLength: [0],
      min: [''],
      max: [''],
      rows: [4],
      cols: [50],
      format: ['yyyy-MM-dd'],
      layout: ['vertical'],
      minSelections: [0],
      maxSelections: [''],
      allowMultiple: [false],
      searchable: [false],
      datePlaceholder: ['Select date']
    });
  }

  ngOnInit(): void {
    if (this.selectedComponent) {
      this.loadComponentProperties();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    if (this.selectedComponent) {
      this.loadComponentProperties();
    }
  }

  loadComponentProperties(): void {
    if (!this.selectedComponent) return;

    // Load basic properties
    const properties: any = {
      label: this.selectedComponent.label,
      required: this.selectedComponent.required,
      helpText: this.getPropertyValue('helpText'),
      placeholder: this.getPropertyValue('placeholder'),
      maxLength: this.getPropertyValue('maxLength') || 255,
      minLength: this.getPropertyValue('minLength') || 0,
      min: this.getPropertyValue('min'),
      max: this.getPropertyValue('max'),
      rows: this.getPropertyValue('rows') || 4,
      cols: this.getPropertyValue('cols') || 50,
      format: this.getPropertyValue('format') || 'yyyy-MM-dd',
      layout: this.getPropertyValue('layout') || 'vertical',
      minSelections: this.getPropertyValue('minSelections') || 0,
      maxSelections: this.getPropertyValue('maxSelections'),
      allowMultiple: this.getPropertyValue('allowMultiple') === 'true',
      searchable: this.getPropertyValue('searchable') === 'true',
      datePlaceholder: this.getPropertyValue('datePlaceholder') || 'Select date'
    };

    this.propertiesForm.patchValue(properties);
    this.options = [...(this.selectedComponent.options || [])];
  }

  onFormChange(): void {
    if (this.selectedComponent && this.propertiesForm.valid) {
      this.updateComponentFromForm();
    }
  }

  updateComponentFromForm(): void {
    if (!this.selectedComponent) return;

    const formValue = this.propertiesForm.value;
    const updatedComponent = { ...this.selectedComponent };

    // Update basic properties
    updatedComponent.label = formValue.label;
    updatedComponent.required = formValue.required;

    // Update component properties
    const properties: ComponentProperty[] = [];
    
    if (formValue.helpText) {
      properties.push({ propertyName: 'helpText', propertyValue: formValue.helpText });
    }
    if (formValue.placeholder) {
      properties.push({ propertyName: 'placeholder', propertyValue: formValue.placeholder });
    }
    if (formValue.maxLength) {
      properties.push({ propertyName: 'maxLength', propertyValue: formValue.maxLength.toString() });
    }
    if (formValue.minLength) {
      properties.push({ propertyName: 'minLength', propertyValue: formValue.minLength.toString() });
    }
    if (formValue.min) {
      properties.push({ propertyName: 'min', propertyValue: formValue.min.toString() });
    }
    if (formValue.max) {
      properties.push({ propertyName: 'max', propertyValue: formValue.max.toString() });
    }
    if (formValue.rows) {
      properties.push({ propertyName: 'rows', propertyValue: formValue.rows.toString() });
    }
    if (formValue.cols) {
      properties.push({ propertyName: 'cols', propertyValue: formValue.cols.toString() });
    }
    if (formValue.format) {
      properties.push({ propertyName: 'format', propertyValue: formValue.format });
    }
    if (formValue.layout) {
      properties.push({ propertyName: 'layout', propertyValue: formValue.layout });
    }
    if (formValue.minSelections) {
      properties.push({ propertyName: 'minSelections', propertyValue: formValue.minSelections.toString() });
    }
    if (formValue.maxSelections) {
      properties.push({ propertyName: 'maxSelections', propertyValue: formValue.maxSelections.toString() });
    }
    if (formValue.allowMultiple) {
      properties.push({ propertyName: 'allowMultiple', propertyValue: formValue.allowMultiple.toString() });
    }
    if (formValue.searchable) {
      properties.push({ propertyName: 'searchable', propertyValue: formValue.searchable.toString() });
    }
    if (formValue.datePlaceholder) {
      properties.push({ propertyName: 'datePlaceholder', propertyValue: formValue.datePlaceholder });
    }

    updatedComponent.properties = properties;
    updatedComponent.options = this.options;

    this.componentUpdated.emit(updatedComponent);
  }

  addOption(): void {
    const newOption: ElementOption = {
      label: `Option ${this.options.length + 1}`,
      value: `option${this.options.length + 1}`,
      displayOrder: this.options.length + 1
    };
    this.options.push(newOption);
  }

  removeOption(index: number): void {
    if (this.options.length > 1) {
      this.options.splice(index, 1);
      // Reorder remaining options
      this.options.forEach((option, i) => {
        option.displayOrder = i + 1;
      });
    }
  }

  updateOption(index: number, field: keyof ElementOption, value: string): void {
    if (this.options[index]) {
      (this.options[index] as any)[field] = value;
    }
  }

  saveProperties(): void {
    if (this.propertiesForm.valid && this.selectedComponent) {
      this.updateComponentFromForm();
      this.notificationService.componentUpdated();
    }
  }

  deleteComponent(): void {
    if (this.selectedComponent) {
      this.componentDeleted.emit(this.selectedComponent);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  private getPropertyValue(propertyName: string): string {
    if (!this.selectedComponent?.properties) return '';
    const property = this.selectedComponent.properties.find((p: ComponentProperty) => p.propertyName === propertyName);
    return property?.propertyValue || '';
  }

  isTextBasedField(): boolean {
    return ['TEXT', 'EMAIL', 'NUMBER', 'TEXTAREA'].includes(this.selectedComponent?.componentType || '');
  }

  isTextInput(): boolean {
    return ['TEXT', 'EMAIL'].includes(this.selectedComponent?.componentType || '');
  }

  isNumberInput(): boolean {
    return this.selectedComponent?.componentType === 'NUMBER';
  }

  isTextarea(): boolean {
    return this.selectedComponent?.componentType === 'TEXTAREA';
  }

  isDropdown(): boolean {
    return this.selectedComponent?.componentType === 'DROPDOWN';
  }

  isRadioOrCheckbox(): boolean {
    return ['RADIO', 'CHECKBOX'].includes(this.selectedComponent?.componentType || '');
  }

  isCheckbox(): boolean {
    return this.selectedComponent?.componentType === 'CHECKBOX';
  }

  isDate(): boolean {
    return this.selectedComponent?.componentType === 'DATE';
  }

  isChoiceField(): boolean {
    return ['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(this.selectedComponent?.componentType || '');
  }
}
