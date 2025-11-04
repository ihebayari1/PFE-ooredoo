import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';

import { ComponentService } from '../../core/services/component.service';
import { FormComponent, ComponentType, ComponentTemplate, ElementOption, ComponentProperty } from '../../core/models/component.model';

@Component({
  selector: 'app-component-management',
  standalone: true,
  imports: [
    CommonModule,
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
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatTabsModule,
    MatMenuModule
  ],
  templateUrl: './component-management.component.html',
  styleUrls: ['./component-management.component.scss']
})
export class ComponentManagementComponent implements OnInit {
  components: FormComponent[] = [];
  componentTemplates: ComponentTemplate[] = [];
  displayedColumns: string[] = ['name', 'type', 'isGlobal', 'createdAt', 'options', 'properties', 'actions'];
  isLoading = false;
  showCreateForm = false;
  componentForm: FormGroup;
  optionsForm: FormGroup;
  selectedComponent: FormComponent | null = null;
  editingIndex: number = -1;
  newOption: ElementOption = { label: '', value: '', displayOrder: 0 };

  componentTypes = Object.values(ComponentType);
  
  get selectedComponentType(): ComponentType | null {
    const type = this.componentForm?.get('elementType')?.value;
    return type ? ComponentType[type as keyof typeof ComponentType] : null;
  }

  get requiresOptions(): boolean {
    const type = this.selectedComponentType;
    return type === ComponentType.DROPDOWN || type === ComponentType.RADIO || type === ComponentType.CHECKBOX;
  }

  constructor(
    private componentService: ComponentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.componentForm = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      elementType: ['', Validators.required],
      placeholder: [''],
      required: [false]
    });

    this.optionsForm = this.fb.group({
      options: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadComponents();
    this.loadComponentTemplates();
    
    // Watch for component type changes to show/hide options
    this.componentForm.get('elementType')?.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  loadComponents(): void {
    this.isLoading = true;
    this.componentService.getAllComponentsForAdmin().subscribe({
      next: (components) => {
        this.components = components;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.handleApiError(error, 'loading components');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadComponentTemplates(): void {
    this.componentService.getAvailableComponentTemplates().subscribe({
      next: (templates) => {
        this.componentTemplates = templates;
      },
      error: (error) => {
        console.error('Error loading component templates:', error);
      }
    });
  }

  openCreateForm(): void {
    this.selectedComponent = null;
    this.componentForm.reset({
      label: '',
      elementType: '',
      placeholder: '',
      required: false
    });
    this.newOption = { label: '', value: '', displayOrder: 0 };
    this.showCreateForm = true;
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.selectedComponent = null;
    this.componentForm.reset();
    this.newOption = { label: '', value: '', displayOrder: 0 };
  }

  createComponent(): void {
    if (this.componentForm.invalid) {
      this.componentForm.markAllAsTouched();
      this.showError('Please fill in all required fields');
      return;
    }

    const formValue = this.componentForm.value;
    
    // Convert string to ComponentType enum
    let elementType: ComponentType;
    if (typeof formValue.elementType === 'string') {
      elementType = ComponentType[formValue.elementType as keyof typeof ComponentType];
    } else {
      elementType = formValue.elementType;
    }
    
    const componentData: Partial<FormComponent> = {
      label: formValue.label,
      elementType: elementType,
      placeholder: formValue.placeholder || '',
      required: formValue.required || false,
      properties: this.getDefaultProperties(formValue.elementType),
      options: this.requiresOptions && this.hasOptions() ? this.getOptionsArray() : []
    };

    this.isLoading = true;
    this.componentService.createStandaloneComponent(componentData).subscribe({
      next: (created) => {
        this.showSuccess('Component created successfully');
        this.loadComponents();
        this.cancelCreate();
      },
      error: (error) => {
        this.handleApiError(error, 'creating component');
        this.isLoading = false;
      }
    });
  }

  getDefaultProperties(componentType: string): ComponentProperty[] {
    const template = this.componentTemplates.find(t => t.elementType === componentType);
    if (template && template.defaultProperties) {
      return Object.entries(template.defaultProperties).map(([key, value], index) => ({
        propertyName: key,
        propertyValue: value
      }));
    }
    return [];
  }

  hasOptions(): boolean {
    return this.newOption.label.trim() !== '' && this.newOption.value.trim() !== '';
  }

  getOptionsArray(): ElementOption[] {
    if (!this.hasOptions()) return [];
    
    return [{
      label: this.newOption.label,
      value: this.newOption.value,
      displayOrder: 0
    }];
  }

  addOption(): void {
    if (!this.hasOptions()) {
      this.showError('Please fill in option label and value');
      return;
    }

    if (!this.selectedComponent?.options) {
      this.selectedComponent = this.selectedComponent || { ...this.getEmptyComponent() };
      this.selectedComponent.options = [];
    }

    const maxOrder = this.selectedComponent.options.length > 0
      ? Math.max(...this.selectedComponent.options.map(o => o.displayOrder || 0))
      : -1;

    this.selectedComponent.options.push({
      label: this.newOption.label,
      value: this.newOption.value,
      displayOrder: maxOrder + 1
    });

    this.newOption = { label: '', value: '', displayOrder: 0 };
  }

  removeOption(index: number): void {
    if (this.selectedComponent?.options) {
      this.selectedComponent.options.splice(index, 1);
      // Reorder
      this.selectedComponent.options.forEach((opt, idx) => {
        opt.displayOrder = idx;
      });
    }
  }

  editComponent(component: FormComponent): void {
    this.selectedComponent = { 
      ...component,
      options: component.options ? [...component.options] : []
    };
    this.editingIndex = this.components.indexOf(component);
    this.showCreateForm = false;
    
    this.componentForm.patchValue({
      label: component.label,
      elementType: component.elementType,
      placeholder: component.placeholder || '',
      required: component.required || false
    });
    
    this.openCreateForm();
  }

  updateComponent(): void {
    if (!this.selectedComponent?.id) return;

    if (this.componentForm.invalid) {
      this.componentForm.markAllAsTouched();
      this.showError('Please fill in all required fields');
      return;
    }

    const formValue = this.componentForm.value;
    
    // Convert string to ComponentType enum
    let elementType: ComponentType;
    if (typeof formValue.elementType === 'string') {
      elementType = ComponentType[formValue.elementType as keyof typeof ComponentType];
    } else {
      elementType = formValue.elementType;
    }
    
    const componentData: Partial<FormComponent> = {
      label: formValue.label,
      elementType: elementType,
      placeholder: formValue.placeholder || '',
      required: formValue.required || false,
      properties: this.selectedComponent.properties || [],
      options: this.selectedComponent.options || []
    };

    this.isLoading = true;
    this.componentService.updateComponent(this.selectedComponent.id, componentData).subscribe({
      next: () => {
        this.showSuccess('Component updated successfully');
        this.loadComponents();
        this.cancelCreate();
      },
      error: (error) => {
        this.handleApiError(error, 'updating component');
        this.isLoading = false;
      }
    });
  }

  deleteComponent(component: FormComponent): void {
    if (!component.id) return;

    if (!confirm(`Are you sure you want to delete "${component.label}"?`)) {
      return;
    }

    this.isLoading = true;
    this.componentService.deleteComponent(component.id).subscribe({
      next: () => {
        this.showSuccess('Component deleted successfully');
        this.loadComponents();
      },
      error: (error) => {
        this.handleApiError(error, 'deleting component');
        this.isLoading = false;
      }
    });
  }

  getComponentTypeLabel(type: ComponentType | string): string {
    // Handle both ComponentType enum and string values
    let typeStr: string;
    if (typeof type === 'string') {
      typeStr = type;
    } else {
      typeStr = String(type);
    }
    const labels: { [key: string]: string } = {
      'TEXT': 'Text Input',
      'EMAIL': 'Email Input',
      'NUMBER': 'Number Input',
      'TEXTAREA': 'Text Area',
      'DROPDOWN': 'Dropdown',
      'RADIO': 'Radio Button',
      'CHECKBOX': 'Checkbox',
      'DATE': 'Date Picker',
      'FILE_UPLOAD': 'File Upload'
    };
    return labels[typeStr] || typeStr;
  }

  getComponentTypeIcon(type: ComponentType | string): string {
    // Handle both ComponentType enum and string values
    let typeStr: string;
    if (typeof type === 'string') {
      typeStr = type;
    } else {
      typeStr = String(type);
    }
    const icons: { [key: string]: string } = {
      'TEXT': 'text_fields',
      'EMAIL': 'email',
      'NUMBER': 'pin',
      'TEXTAREA': 'subject',
      'DROPDOWN': 'arrow_drop_down_circle',
      'RADIO': 'radio_button_checked',
      'CHECKBOX': 'check_box',
      'DATE': 'calendar_today',
      'FILE_UPLOAD': 'attach_file'
    };
    return icons[typeStr] || 'widgets';
  }

  getSelectedComponentOptions(): ElementOption[] {
    return this.selectedComponent?.options || [];
  }

  getEmptyComponent(): FormComponent {
    return {
      elementType: ComponentType.TEXT,
      label: '',
      required: false,
      orderIndex: 0,
      properties: [],
      options: [],
      isGlobal: true,
      isActive: true
    };
  }

  handleApiError(error: any, action: string): void {
    console.error(`Error ${action}:`, error);
    const message = error.error?.message || error.message || `Failed to ${action}`;
    this.showError(message);
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
