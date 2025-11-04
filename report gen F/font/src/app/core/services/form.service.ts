import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Form, FormComponent, FormComponentAssignment, User } from '../models/form.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

// DTOs for backward compatibility
export interface FormRequestDTO {
  name: string;
  description: string;
  formFields?: any[];
}

export interface FormResponseDTO {
  id: number;
  name: string;
  description: string;
  creatorId?: number;
  createdAt?: string;
  updatedAt?: string;
  components?: any[];
  assignedUserIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = `${environment.apiUrl}/forms`;

  constructor(private http: HttpClient) {}

  // Form CRUD operations
  createForm(form: FormRequestDTO): Observable<FormResponseDTO> {
    return this.http.post<FormResponseDTO>(`${this.apiUrl}/createForm`, form);
  }

  getForms(): Observable<FormResponseDTO[]> {
    return this.http.get<FormResponseDTO[]>(this.apiUrl);
  }

  // Backward compatibility method
  getAllForms(): Observable<FormResponseDTO[]> {
    return this.http.get<FormResponseDTO[]>(this.apiUrl);
  }

  getFormById(id: number): Observable<FormResponseDTO> {
    return this.http.get<FormResponseDTO>(`${this.apiUrl}/FormById/${id}`);
  }

  updateForm(id: number, form: FormRequestDTO): Observable<FormResponseDTO> {
    return this.http.put<FormResponseDTO>(`${this.apiUrl}/updateForm/${id}`, form);
  }

  deleteForm(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/deleteForm/${id}`);
  }

  // Form assignment operations
  assignUsersToForm(formId: number, userIds: number[]): Observable<any> {
    if (!formId || !userIds || userIds.length === 0) {
      throw new Error('Form ID and User IDs are required for assignment');
    }
    return this.http.post<any>(`${this.apiUrl}/${formId}/assign/users`, userIds);
  }

  unassignUserFromForm(formId: number, userId: number): Observable<any> {
    if (!formId || !userId) {
      throw new Error('Form ID and User ID are required for unassignment');
    }
    return this.http.delete<any>(`${this.apiUrl}/${formId}/unassign/users/${userId}`);
  }

  getAssignedUsers(formId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${formId}/assigned-users`);
  }

  // Get forms assigned to the current user
  getFormsAssignedToMe(): Observable<FormResponseDTO[]> {
    return this.http.get<FormResponseDTO[]>(`${this.apiUrl}/assigned-to-me`);
  }

  // Component operations
  addComponentToForm(formId: number, component: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addComponentToForm/${formId}/components`, component);
  }

  getFormComponents(formId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${formId}/components`);
  }

  reorderComponents(formId: number, componentIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${formId}/components/reorder`, componentIds);
  }

  updateComponent(componentId: number, component: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/components/updateComponent/${componentId}`, component);
  }

  deleteComponent(componentId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/components/deleteComponent/${componentId}`);
  }

  // Get all users for assignment
  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${environment.apiUrl}/users`);
  }
}