import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComponentTemplate, FormComponent, ElementOption, ComponentProperty } from '../models/component.model';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Get available component templates
  getComponentTemplates(): Observable<ComponentTemplate[]> {
    return this.http.get<ComponentTemplate[]>(`${this.apiUrl}/form-builder/component-types`);
  }

  // Get component templates with default properties and options
  getAvailableComponentTemplates(): Observable<ComponentTemplate[]> {
    return this.http.get<ComponentTemplate[]>(`${this.apiUrl}/components/templates`);
  }

  // Get form components
  getFormComponents(formId: number): Observable<FormComponent[]> {
    return this.http.get<FormComponent[]>(`${this.apiUrl}/forms/${formId}/components`);
  }

  // Add component to form
  addComponentToForm(formId: number, component: Partial<FormComponent>): Observable<FormComponent> {
    return this.http.post<FormComponent>(`${this.apiUrl}/forms/addComponentToForm/${formId}/components`, component);
  }

  // Update component
  updateComponent(componentId: number, component: Partial<FormComponent>): Observable<FormComponent> {
    return this.http.put<FormComponent>(`${this.apiUrl}/components/updateComponent/${componentId}`, component);
  }

  // Update component assignment (for form-specific fields like label, required, placeholder)
  updateAssignment(assignmentId: number, component: Partial<FormComponent>): Observable<FormComponent> {
    return this.http.put<FormComponent>(`${this.apiUrl}/components/updateAssignment/${assignmentId}`, component);
  }

  // Delete component
  deleteComponent(componentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/components/deleteComponent/${componentId}`);
  }

  // Reorder form components
  reorderFormComponents(formId: number, componentIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/forms/${formId}/components/reorder`, componentIds);
  }

  // Add component options (for dropdown, radio, checkbox)
  addComponentOptions(componentId: number, options: ElementOption[]): Observable<ElementOption[]> {
    return this.http.post<ElementOption[]>(`${this.apiUrl}/components/${componentId}/options/batch`, options);
  }

  // Get component options
  getComponentOptions(componentId: number): Observable<ElementOption[]> {
    return this.http.get<ElementOption[]>(`${this.apiUrl}/components/getComponentOptions/${componentId}/options`);
  }

  // Update component option
  updateComponentOption(optionId: number, option: ElementOption): Observable<ElementOption> {
    return this.http.put<ElementOption>(`${this.apiUrl}/components/options/${optionId}`, option);
  }

  // Delete component option
  deleteComponentOption(optionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/components/deleteElementOption/options/${optionId}`);
  }

  // Add component property
  addComponentProperty(componentId: number, property: ComponentProperty): Observable<ComponentProperty> {
    return this.http.post<ComponentProperty>(`${this.apiUrl}/components/addComponentProperty/${componentId}/properties`, property);
  }

  // Get component properties
  getComponentProperties(componentId: number): Observable<ComponentProperty[]> {
    return this.http.get<ComponentProperty[]>(`${this.apiUrl}/components/getComponentProperties/${componentId}/properties`);
  }

  // Update component property
  updateComponentProperty(propertyId: number, value: string): Observable<ComponentProperty> {
    return this.http.put<ComponentProperty>(`${this.apiUrl}/components/properties/${propertyId}?value=${encodeURIComponent(value)}`, {});
  }

  // Delete component property
  deleteComponentProperty(propertyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/components/properties/${propertyId}`);
  }

  // === ADMIN COMPONENT MANAGEMENT ===

  // Create standalone reusable component (MAIN_ADMIN only)
  createStandaloneComponent(component: Partial<FormComponent>): Observable<FormComponent> {
    return this.http.post<FormComponent>(`${this.apiUrl}/components/admin/create`, component);
  }

  // Get all components for admin management (MAIN_ADMIN only)
  getAllComponentsForAdmin(): Observable<FormComponent[]> {
    return this.http.get<FormComponent[]>(`${this.apiUrl}/components/admin/all`);
  }
}