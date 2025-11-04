export interface Form {
  id?: number;
  name: string;
  description: string;
  creatorId?: number;
  createdAt?: string;
  components?: FormComponentAssignment[];
  assignedUserIds?: number[];
}

export interface FormComponent {
  id?: number;
  elementType: ComponentType;
  label: string;
  required: boolean;
  properties?: ComponentProperty[];
  options?: ElementOption[];
}

export type ComponentType = 'TEXT' | 'EMAIL' | 'NUMBER' | 'TEXTAREA' | 'DROPDOWN' | 'RADIO' | 'CHECKBOX' | 'DATE' | 'FILE_UPLOAD' | 'text' | 'email' | 'number' | 'textarea' | 'dropdown' | 'radio' | 'checkbox' | 'date' | 'file_upload';

export interface ComponentProperty {
  propertyName: string;
  propertyValue: string;
}

export interface ElementOption {
  id?: number;
  label: string;
  value: string;
  displayOrder: number;
}

// Legacy interface for backward compatibility
export interface FormComponentAssignment {
  assignmentId: number;
  componentId: number;
  orderIndex: number;
  isActive: boolean;
  componentType: ComponentType;
  label: string;
  required: boolean;
  properties: ComponentProperty[];
  options: ElementOption[];
}

// New interfaces matching backend DTOs
export interface FormWithAssignments {
  id: number;
  name: string;
  description: string;
  componentAssignments: FormComponentAssignmentInfo[];
  creatorName?: string;
  createdAt?: string;
  canSubmit?: boolean;
  totalComponents?: number;
}

export interface FormComponentAssignmentInfo {
  assignmentId: number;
  componentId: number;
  componentType: ComponentType;
  label: string;
  required: boolean;
  orderIndex: number;
  properties: ComponentProperty[];
  options: ElementOption[];
  placeholder?: string;
  helpText?: string;
  validationRules?: { [key: string]: string };
}

export interface FormSubmissionRequest {
  formId: number;
  assignmentValues: { [assignmentId: number]: string };
}

export interface FormSubmission {
  id?: number;
  formId: number;
  submittedById: number;
  submittedAt: string;
  values: SubmissionValue[];
}

export interface SubmissionValue {
  assignmentId: number;
  componentLabel: string;
  value: string;
  orderIndex: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
