export enum ComponentType {
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER',
  TEXTAREA = 'TEXTAREA',
  DROPDOWN = 'DROPDOWN',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  FILE_UPLOAD = 'FILE_UPLOAD'
}

export interface ComponentTemplate {
  elementType: string;
  displayName: string;
  description: string;
  iconClass: string;
  defaultProperties: { [key: string]: string };
  defaultOptions: ElementOption[];
  requiresOptions: boolean;
  supportsFileUpload: boolean;
  category: string;
  sortOrder: number;
  isAdvanced: boolean;
}

export interface ElementOption {
  id?: number;
  label: string;
  value: string;
  displayOrder: number;
  componentId?: number;
}

export interface ComponentProperty {
  id?: number;
  propertyName: string;
  propertyValue: string;
  componentId?: number;
}

export interface FormComponent {
  id?: number;
  assignmentId?: number; // ID of the FormComponentAssignment
  elementType: ComponentType;
  label: string;
  required: boolean;
  placeholder?: string; // Form-specific placeholder
  orderIndex: number;
  properties: ComponentProperty[];
  options: ElementOption[];
  formId?: number;
  isGlobal: boolean;
  createdAt?: string;
  isActive: boolean;
}

export interface ComponentPaletteItem {
  type: ComponentType;
  icon: string;
  label: string;
  description: string;
  category: string;
}

export interface FormCanvasComponent extends FormComponent {
  isEditing?: boolean;
  isDragging?: boolean;
}

export interface ComponentEditorData {
  component: FormCanvasComponent;
  isNew: boolean;
  availableTemplates: ComponentTemplate[];
}
