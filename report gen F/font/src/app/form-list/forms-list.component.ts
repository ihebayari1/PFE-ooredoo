import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { FormService, FormResponseDTO } from '../core/services/form.service';
import { AuthService } from '../core/auth/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormPreviewDialogComponent } from '../form-preview-dialog/form-preview-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserManagementDialogComponent } from './user-management-dialog.component';

// Using the FormResponseDTO from the service instead of a local interface

@Component({
  selector: 'app-forms-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule 
  ],
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})
export class FormsListComponent implements OnInit {
  forms: FormResponseDTO[] = [];
  isLoading = true;
  formId: number | null = null;
  formName: string = '';
  formDescription: string = '';
 
  formCreator: string | null = null;
  departmentName: string | null = null;
  // Selected field for properties panel
  selectedField: any = null;
  
  // User role detection
  isSimpleUser = false;
  pageTitle = 'My Forms';
  
  // Sorting options
  sortBy: 'newest' | 'oldest' = 'newest';

  constructor(
    private router: Router,
    @Inject(ToastrService) private toastr: ToastrService,
    private formService: FormService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}
formFields: any = [];
  ngOnInit(): void {
    this.checkUserRole();
    this.loadForms();
  }

  private checkUserRole(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.roles) {
      const userRole = user.roles[0]?.replace('ROLE_', '') || 'USER';
      this.isSimpleUser = this.isSimpleUserRole(userRole);
      this.pageTitle = this.isSimpleUser ? 'My Assigned Forms' : 'My Forms';
    }
  }

  private isSimpleUserRole(role: string): boolean {
    return role === 'SIMPLE_USER' ||
           role === 'HEAD_OF_SECTOR' ||
           role === 'HEAD_OF_ZONE' ||
           role === 'HEAD_OF_REGION' ||
           role === 'HEAD_OF_POS' ||
           role === 'COMMERCIAL_POS' ||
           role === 'USER';
  }

  loadForms(): void {
    this.isLoading = true;
    
    const formsObservable = this.isSimpleUser 
      ? this.formService.getFormsAssignedToMe()
      : this.formService.getForms();
    
    formsObservable
      .pipe(
        catchError(error => {
          if (error.status === 403) {
            this.toastr.error('You do not have permission to view forms.');
          } else {
            this.toastr.error('Failed to load forms. Please try again.');
          }
          console.error('Error loading forms:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((forms: FormResponseDTO[]) => {
        this.forms = this.sortFormsByDate(forms);
      });
  }

  viewForm(formId: number): void {
    if (this.isSimpleUser) {
      // For simple users, navigate to form submission
      this.router.navigate(['/forms', formId, 'submit']);
    } else {
      // For admins, navigate to form builder
      this.router.navigate(['/form-builder'], { queryParams: { formId: formId.toString() } });
    }
  }

  editForm(formId: number): void {
    
    // For now, just view the form
    //this.viewForm(formId);
    this.router.navigate(['/form-builder'], { queryParams: { formId: formId.toString() } });

  }

  deleteForm(formId: number, event: Event): void {
    event.stopPropagation(); // Prevent card click event
    
    if (confirm('Are you sure you want to delete this form?')) {
      this.isLoading = true;
      this.formService.deleteForm(formId)
        .pipe(
          catchError(error => {
            if (error.status === 403) {
              this.toastr.error('You do not have permission to delete this form.');
            } else {
              this.toastr.error('Failed to delete form. Please try again.');
            }
            console.error('Error deleting form:', error);
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(() => {
          this.toastr.success('Form deleted successfully');
          this.loadForms(); // Reload forms after deletion
        });
    }
  }

  createNewForm(): void {
    this.router.navigate(['/forms']);
  }

  previewForm(form: FormResponseDTO): void {
    if (!form?.id || !form?.name) {
      this.toastr.error('Invalid form data');
      return;
    }

    // Show loading state
    this.toastr.info('Loading form preview...');

    // Fetch form components
    this.formService.getFormComponents(form.id)
      .pipe(
        catchError(error => {
          console.error('Error loading form components:', error);
          this.toastr.error('Failed to load form components for preview');
          return of([]);
        })
      )
      .subscribe(components => {
        // Transform components to the format expected by FormPreviewDialogComponent
        const formFields = this.transformComponentsToFormFields(components);
        
        // Open the enhanced preview dialog
        const dialogRef = this.dialog.open(FormPreviewDialogComponent, {
          width: '95vw',
          maxWidth: '900px',
          maxHeight: '90vh',
          data: {
            formName: form.name,
            formDescription: form.description || 'No description provided',
            formFields: formFields
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          // Dialog closed, no action needed
        });
      });
  }

  private transformComponentsToFormFields(components: any[]): any[] {
    return components.map(component => {
      // Map component types to input types expected by the preview dialog
      let inputType = 'text';
      let icon = 'text_fields';
      
      switch (component.elementType) {
        case 'TEXT':
          inputType = 'text';
          icon = 'text_fields';
          break;
        case 'EMAIL':
          inputType = 'email';
          icon = 'email';
          break;
        case 'NUMBER':
          inputType = 'number';
          icon = 'numbers';
          break;
        case 'TEXTAREA':
          inputType = 'textarea';
          icon = 'notes';
          break;
        case 'DROPDOWN':
          inputType = 'select';
          icon = 'arrow_drop_down';
          break;
        case 'RADIO':
          inputType = 'radio';
          icon = 'radio_button_checked';
          break;
        case 'CHECKBOX':
          inputType = 'checkbox';
          icon = 'check_box';
          break;
        case 'DATE':
          inputType = 'date';
          icon = 'calendar_today';
          break;
        default:
          inputType = 'text';
          icon = 'text_fields';
      }

      return {
        label: component.label || 'Untitled Field',
        inputType: inputType,
        placeHolder: this.getPlaceholder(component),
        required: component.required || false,
        icon: icon,
        options: component.options || [],
        defaultValue: component.defaultValue,
        min: component.min,
        max: component.max,
        rows: component.rows || 4,
        minSelections: this.getPropertyValue(component, 'minSelections'),
        maxSelections: this.getPropertyValue(component, 'maxSelections')
      };
    });
  }

  private getPlaceholder(component: any): string {
    // Try to get placeholder from component properties
    if (component.properties) {
      const placeholderProp = component.properties.find((prop: any) => 
        prop.propertyName === 'placeholder' || prop.propertyName === 'Placeholder'
      );
      if (placeholderProp?.propertyValue) {
        return placeholderProp.propertyValue;
      }
    }
    
    // Fallback to a generic placeholder
    return `Enter ${(component.label || 'value').toLowerCase()}`;
  }

  private getPropertyValue(component: any, propertyName: string): number {
    if (component.properties) {
      const prop = component.properties.find((p: any) => p.propertyName === propertyName);
      if (prop?.propertyValue) {
        const value = parseInt(prop.propertyValue, 10);
        return isNaN(value) ? 0 : value;
      }
    }
    return 0;
  }

  unassignUsers(form: FormResponseDTO, event: Event): void {
    event.stopPropagation(); // Prevent card click event
    
    // Validate form data
    if (!form?.id || !form?.name) {
      this.toastr.error('Invalid form data');
      return;
    }
    
    const dialogRef = this.dialog.open(UserManagementDialogComponent, {
      width: '95vw',
      maxWidth: '1200px',
      data: {
        formId: form.id,
        formName: form.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Reload forms if user management was successful
        this.loadForms();
      }
    });
  }

  manageUsers(form: FormResponseDTO, event: Event): void {
    event.stopPropagation(); // Prevent card click event
    
    // Validate form data
    if (!form?.id || !form?.name) {
      this.toastr.error('Invalid form data');
      return;
    }
    
    const dialogRef = this.dialog.open(UserManagementDialogComponent, {
      width: '95vw',
      maxWidth: '1200px',
      data: {
        formId: form.id,
        formName: form.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Reload forms if user management was successful
        this.loadForms();
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Sort forms by creation date
   */
  private sortFormsByDate(forms: FormResponseDTO[]): FormResponseDTO[] {
    return forms.sort((a, b) => {
      const dateA = new Date(a.createdAt || '');
      const dateB = new Date(b.createdAt || '');
      
      if (this.sortBy === 'newest') {
        return dateB.getTime() - dateA.getTime(); // Newest first
      } else {
        return dateA.getTime() - dateB.getTime(); // Oldest first
      }
    });
  }

  /**
   * Change sort order and re-sort forms
   */
  changeSortOrder(): void {
    this.sortBy = this.sortBy === 'newest' ? 'oldest' : 'newest';
    this.forms = this.sortFormsByDate(this.forms);
  }

  /**
   * Get sort button text
   */
  getSortButtonText(): string {
    return this.sortBy === 'newest' ? 'Newest First' : 'Oldest First';
  }

  /**
   * Get sort button icon
   */
  getSortButtonIcon(): string {
    return this.sortBy === 'newest' ? 'arrow_downward' : 'arrow_upward';
  }
}