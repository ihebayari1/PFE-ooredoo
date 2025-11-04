import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { FormService, FormResponseDTO } from '../core/services/form.service';
import { ComponentService } from '../core/services/component.service';
import { ComponentTemplate, ComponentType, FormCanvasComponent, ComponentPaletteItem, ComponentEditorData } from '../core/models/component.model';
import { ComponentEditorDialogComponent } from './components/component-editor-dialog.component';
import { FormPreviewDialogComponent } from './components/form-preview-dialog.component';
import { catchError, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CdkDrag,
    CdkDropList
  ],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  formBuilderForm: FormGroup;
  formId: number | null = null;
  formData: FormResponseDTO | null = null;
  isSaving = false;
  isLoading = true;

  // Component palette and canvas
  componentPalette: ComponentPaletteItem[] = [];
  formComponents: FormCanvasComponent[] = [];
  availableTemplates: ComponentTemplate[] = [];
  
  // Drag and drop
  paletteItems: ComponentPaletteItem[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(ToastrService) private toastr: ToastrService,
    private formService: FormService,
    private componentService: ComponentService,
    private dialog: MatDialog
  ) {
    this.formBuilderForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
    
    this.initializeComponentPalette();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.formId = params['formId'] ? parseInt(params['formId']) : null;
      if (this.formId) {
        this.loadFormData();
        this.loadFormComponents();
      } else {
        this.isLoading = false;
      }
    });
    
    this.loadComponentTemplates();
  }

  initializeComponentPalette(): void {
    this.componentPalette = [
      { type: ComponentType.TEXT, icon: '📝', label: 'Text Input', description: 'Single line text input', category: 'Input' },
      { type: ComponentType.EMAIL, icon: '✉️', label: 'Email', description: 'Email address input', category: 'Input' },
      { type: ComponentType.NUMBER, icon: '🔢', label: 'Number', description: 'Numeric input', category: 'Input' },
      { type: ComponentType.TEXTAREA, icon: '📄', label: 'Text Area', description: 'Multi-line text input', category: 'Input' },
      { type: ComponentType.DROPDOWN, icon: '▼', label: 'Dropdown', description: 'Select from options', category: 'Selection' },
      { type: ComponentType.RADIO, icon: '○', label: 'Radio Button', description: 'Single choice selection', category: 'Selection' },
      { type: ComponentType.CHECKBOX, icon: '☑', label: 'Checkbox', description: 'Multiple choice selection', category: 'Selection' },
      { type: ComponentType.DATE, icon: '📅', label: 'Date Picker', description: 'Date selection', category: 'Date/Time' },
      { type: ComponentType.FILE_UPLOAD, icon: '📎', label: 'File Upload', description: 'Upload files', category: 'Input' }
    ];
    this.paletteItems = [...this.componentPalette];
  }

  loadComponentTemplates(): void {
    this.componentService.getAvailableComponentTemplates()
      .pipe(
        catchError(error => {
          console.error('Error loading component templates:', error);
          return of([]);
        })
      )
      .subscribe(templates => {
        this.availableTemplates = templates;
      });
  }

  loadFormComponents(): void {
    if (!this.formId) return;
    
    this.componentService.getFormComponents(this.formId)
      .pipe(
        catchError(error => {
          console.error('Error loading form components:', error);
          return of([]);
        })
      )
      .subscribe(components => {
        this.formComponents = components.map(comp => ({
          ...comp,
          isEditing: false,
          isDragging: false
        }));
      });
  }

  loadFormData(): void {
    if (!this.formId) return;
    
    this.formService.getFormById(this.formId)
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to load form data');
          console.error('Error loading form:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this.formData = response;
          this.formBuilderForm.patchValue({
            name: response.name,
            description: response.description
          });
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/forms-list']);
  }

  saveForm(): void {
    if (this.formBuilderForm.invalid) return;
    
    this.isSaving = true;
    
    const formData = this.formBuilderForm.value;
    
    if (this.formId) {
      // Update existing form
      this.formService.updateForm(this.formId, formData)
        .pipe(
          catchError(error => {
            this.toastr.error('Failed to update form');
            console.error('Error updating form:', error);
            return of(null);
          }),
          finalize(() => {
            this.isSaving = false;
          })
        )
        .subscribe(response => {
          if (response) {
            this.toastr.success('Form updated successfully!');
            this.router.navigate(['/forms-list']);
          }
        });
    } else {
      // Create new form
      this.formService.createForm(formData)
        .pipe(
          catchError(error => {
            this.toastr.error('Failed to create form');
            console.error('Error creating form:', error);
            return of(null);
          }),
          finalize(() => {
            this.isSaving = false;
          })
        )
        .subscribe(response => {
          if (response) {
            this.toastr.success('Form created successfully!');
            this.router.navigate(['/forms-list']);
          }
        });
    }
  }

  // Drag and Drop Methods
  onPaletteDrop(event: CdkDragDrop<ComponentPaletteItem[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  onCanvasDrop(event: CdkDragDrop<FormCanvasComponent[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateComponentOrder();
    } else {
      // Adding new component from palette
      const paletteItem = event.previousContainer.data[event.previousIndex] as unknown as ComponentPaletteItem;
      this.addComponentFromPalette(paletteItem, event.currentIndex);
    }
  }

  addComponentFromPalette(paletteItem: ComponentPaletteItem, index: number): void {
    if (!this.formId) {
      this.toastr.error('Please save the form first before adding components');
      return;
    }

    const newComponent: Partial<FormCanvasComponent> = {
      elementType: paletteItem.type,
      label: `${paletteItem.label} ${this.formComponents.length + 1}`,
      required: false,
      orderIndex: index,
      properties: [],
      options: [],
      formId: this.formId,
      isGlobal: false,
      isActive: true
    };

    this.componentService.addComponentToForm(this.formId, newComponent)
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to add component');
          console.error('Error adding component:', error);
          return of(null);
        })
      )
      .subscribe(component => {
        if (component) {
          const canvasComponent: FormCanvasComponent = {
            ...component,
            isEditing: false,
            isDragging: false
          };
          this.formComponents.splice(index, 0, canvasComponent);
          this.toastr.success('Component added successfully');
        }
      });
  }

  updateComponentOrder(): void {
    if (!this.formId) return;

    const componentIds = this.formComponents.map(comp => comp.id!);
    this.componentService.reorderFormComponents(this.formId, componentIds)
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to reorder components');
          console.error('Error reordering components:', error);
          return of(null);
        })
      )
      .subscribe(() => {
        // Update order indices
        this.formComponents.forEach((comp, index) => {
          comp.orderIndex = index;
        });
      });
  }

  // Component Management Methods
  editComponent(component: FormCanvasComponent): void {
    const editorData: ComponentEditorData = {
      component: { ...component },
      isNew: false,
      availableTemplates: this.availableTemplates
    };
    
    const dialogRef = this.dialog.open(ComponentEditorDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: editorData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateComponent(result);
      }
    });
  }

  updateComponent(updatedComponent: FormCanvasComponent): void {
    if (!updatedComponent.id) return;

    console.log('Updating component:', updatedComponent);
    console.log('Component options:', updatedComponent.options);
    console.log('Assignment ID:', updatedComponent.assignmentId);

    // Use assignment ID if available (for form-specific updates like label, required, placeholder)
    // Otherwise fall back to component ID (for generic component updates)
    const updateMethod = updatedComponent.assignmentId 
      ? this.componentService.updateAssignment(updatedComponent.assignmentId, updatedComponent)
      : this.componentService.updateComponent(updatedComponent.id, updatedComponent);

    updateMethod
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to update component');
          console.error('Error updating component:', error);
          return of(null);
        })
      )
      .subscribe(component => {
        if (component) {
          console.log('Updated component received from backend:', component);
          console.log('Updated component options:', component.options);
          
          const index = this.formComponents.findIndex(comp => comp.id === updatedComponent.id);
          if (index > -1) {
            this.formComponents[index] = {
              ...component,
              isEditing: false,
              isDragging: false
            };
            console.log('Updated formComponents array:', this.formComponents[index]);
            this.toastr.success('Component updated successfully');
          }
        }
      });
  }

  duplicateComponent(component: FormCanvasComponent): void {
    if (!this.formId) return;

    const duplicatedComponent: Partial<FormCanvasComponent> = {
      ...component,
      id: undefined,
      label: `${component.label} (Copy)`,
      orderIndex: this.formComponents.length
    };

    this.componentService.addComponentToForm(this.formId, duplicatedComponent)
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to duplicate component');
          console.error('Error duplicating component:', error);
          return of(null);
        })
      )
      .subscribe(newComponent => {
        if (newComponent) {
          const canvasComponent: FormCanvasComponent = {
            ...newComponent,
            isEditing: false,
            isDragging: false
          };
          this.formComponents.push(canvasComponent);
          this.toastr.success('Component duplicated successfully');
        }
      });
  }

  deleteComponent(component: FormCanvasComponent): void {
    if (!component.id) return;

    if (confirm(`Are you sure you want to delete "${component.label}"?`)) {
      this.componentService.deleteComponent(component.id)
        .pipe(
          catchError(error => {
            this.toastr.error('Failed to delete component');
            console.error('Error deleting component:', error);
            return of(null);
          })
        )
        .subscribe(() => {
          const index = this.formComponents.findIndex(comp => comp.id === component.id);
          if (index > -1) {
            this.formComponents.splice(index, 1);
            this.toastr.success('Component deleted successfully');
          }
        });
    }
  }

  getComponentIcon(type: ComponentType): string {
    const paletteItem = this.componentPalette.find(item => item.type === type);
    return paletteItem?.icon || '📝';
  }

  getPropertyValue(component: FormCanvasComponent, propertyName: string): string {
    const property = component.properties?.find(p => p.propertyName === propertyName);
    return property?.propertyValue || '';
  }

  openPreviewDialog(): void {
    if (this.formComponents.length === 0) {
      this.toastr.warning('Please add some components to preview the form');
      return;
    }

    const dialogRef = this.dialog.open(FormPreviewDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        components: this.formComponents,
        formData: this.formData
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Preview form submitted:', result);
        this.toastr.success('Form preview submitted successfully!');
      }
    });
  }
}
