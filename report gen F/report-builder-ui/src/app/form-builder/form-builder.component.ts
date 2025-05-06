import { Component } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    DragDropModule, 
    CdkDropList, 
    CdkDrag, 
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})
export class FormBuilderComponent {
  // Selected field for properties panel
  selectedField: any = null;
  
  // Basic Info elements
  basicElements = [
    { 
      inputType: "text",
      icon: "person",
      label: "Name",
      placeHolder: "Enter your name",
      required: false
    },
    { 
      inputType: "email",
      icon: "email",
      label: "Email",
      placeHolder: "example@email.com",
      required: false
    },
    { 
      inputType: "text",
      icon: "phone",
      label: "Phone",
      placeHolder: "Enter your phone number",
      required: false
    },
    { 
      inputType: "text",
      icon: "language",
      label: "Website",
      placeHolder: "Enter your website",
      required: false
    }
  ];
  
  // Text Box elements
  textElements = [
    { 
      inputType: "text",
      icon: "short_text",
      label: "Single Line",
      placeHolder: "Enter text...",
      required: false
    },
    { 
      inputType: "textarea",
      icon: "notes",
      label: "Multi Line",
      placeHolder: "Enter text...",
      rows: 4,
      required: false
    }
  ];
  
  // Number Box elements
  numberElements = [
    { 
      inputType: "number",
      icon: "pin",
      label: "Number",
      placeHolder: "Enter a number",
      min: 0,
      max: 100,
      required: false
    },
    { 
      inputType: "number",
      icon: "calculate",
      label: "Decimal",
      placeHolder: "Enter a decimal number",
      min: 0,
      max: 100,
      required: false
    },
    { 
      inputType: "number",
      icon: "attach_money",
      label: "Currency",
      placeHolder: "Enter amount",
      min: 0,
      required: false
    }
  ];
  
  // Multi-Choice Box elements
  choiceElements = [
    { 
      inputType: "select",
      icon: "arrow_drop_down_circle",
      label: "Dropdown",
      placeHolder: "Select an option",
      options: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" }
      ],
      required: false
    },
    { 
      inputType: "checkbox",
      icon: "check_box",
      label: "Checkbox",
      defaultValue: false,
      required: false
    },
    { 
      inputType: "radio",
      icon: "radio_button_checked",
      label: "Radio Button",
      options: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" }
      ],
      required: false
    }
  ];
  
  // Date Box elements
  dateElements = [
    { 
      inputType: "date",
      icon: "calendar_today",
      label: "Date",
      placeHolder: "Select a date",
      required: false
    }
  ];

  // Form fields in the center panel
  formFields: any = [];

  // Handle drag and drop
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Create a deep copy of the dragged item to avoid reference issues
      const item = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
      
      // Insert the copied item into the target container
      event.container.data.splice(event.currentIndex, 0, item);
      
      // Only remove the original item if we're moving to the form fields list
      // This allows us to keep the original elements in the sidebar
      if (event.container.id === 'formFieldsList') {
        // Don't remove from source - we want to keep our palette items
      }
    }
  }
  
  // Select a field to edit its properties
  selectField(field: any) {
    this.selectedField = field;
  }
  
  // Copy a field
  copyField(event: Event, field: any, index: number) {
    event.stopPropagation(); // Prevent triggering selectField
    const fieldCopy = JSON.parse(JSON.stringify(field));
    this.formFields.splice(index + 1, 0, fieldCopy);
  }
  
  // Delete a field from the form
  deleteField(event: Event, index: number) {
    event.stopPropagation(); // Prevent triggering selectField
    this.formFields.splice(index, 1);
    if (this.selectedField && this.formFields.indexOf(this.selectedField) === -1) {
      this.selectedField = null;
    }
  }
  
  // Delete field from properties panel
  deleteSelectedField() {
    const index = this.formFields.indexOf(this.selectedField);
    if (index !== -1) {
      this.formFields.splice(index, 1);
      this.selectedField = null;
    }
  }
  
  // Add a new option to a dropdown or radio button
  addOption() {
    if (this.selectedField && (this.selectedField.inputType === 'select' || this.selectedField.inputType === 'radio')) {
      if (!this.selectedField.options) {
        this.selectedField.options = [];
      }
      const newOption = {
        value: `option${this.selectedField.options.length + 1}`,
        label: `Option ${this.selectedField.options.length + 1}`
      };
      this.selectedField.options.push(newOption);
    }
  }
  
  // Delete an option from a dropdown or radio button
  deleteOption(index: number) {
    if (this.selectedField && this.selectedField.options && index < this.selectedField.options.length) {
      this.selectedField.options.splice(index, 1);
    }
  }
}
