import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { FormService, FormRequestDTO } from '../core/services/form.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-form-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './form-creation.component.html',
  styleUrls: ['./form-creation.component.scss']
})
export class FormCreationComponent {
  formCreationForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(ToastrService) private toastr: ToastrService,
    private formService: FormService
  ) {
    this.formCreationForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.formCreationForm.invalid) return;
    
    this.isSubmitting = true;
    
    const formData: FormRequestDTO = this.formCreationForm.value;
    
    this.formService.createForm(formData)
      .pipe(
        catchError(error => {
          this.toastr.error('Failed to create form. Please try again.');
          console.error('Error creating form:', error);
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this.toastr.success('Form created successfully!');
          
          // Navigate to the form builder with the form ID
          this.router.navigate(['/form-builder'], { queryParams: { formId: response.id?.toString() } });
          
          this.formCreationForm.reset();
        }
      });
  }
}