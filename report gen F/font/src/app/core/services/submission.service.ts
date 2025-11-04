import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FormWithAssignments, FormComponentAssignmentInfo, FormSubmission, FormSubmissionRequest } from '../models/form.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private apiUrl = `${environment.apiUrl}/submissions`;

  constructor(private http: HttpClient) {}

  // Get form structure for submission
  getFormStructure(formId: number): Observable<FormWithAssignments> {
    return this.http.get<FormWithAssignments>(`${this.apiUrl}/forms/${formId}/structure`);
  }

  // Submit form using assignmentId-based structure
  submitForm(formId: number, assignmentValues: Map<number, string>): Observable<FormSubmission> {
    const request: FormSubmissionRequest = {
      formId: formId,
      assignmentValues: Object.fromEntries(assignmentValues)
    };
    return this.http.post<FormSubmission>(`${this.apiUrl}/forms/${formId}/submit`, request);
  }

  // Get all submissions for a form
  getFormSubmissions(formId: number): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`${this.apiUrl}/forms/${formId}`);
  }

  // Get specific submission
  getSubmission(submissionId: number): Observable<FormSubmission> {
    return this.http.get<FormSubmission>(`${this.apiUrl}/${submissionId}`);
  }

  // Get submission details (alias for getSubmission)
  getSubmissionDetails(submissionId: number): Observable<FormSubmission> {
    return this.getSubmission(submissionId);
  }

  // Get user's submissions
  getMySubmissions(): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`${this.apiUrl}/my-submissions`);
  }

  // Get all submissions (for admins)
  getAllSubmissions(): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`${this.apiUrl}/all`);
  }

  // Delete submission
  deleteSubmission(submissionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${submissionId}`);
  }

  // Get submission count for a form
  getSubmissionCount(formId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/forms/${formId}/count`);
  }

  // Export submissions to CSV (if backend supports it)
  exportSubmissionsToCSV(formId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/forms/${formId}/export/csv`, {
      responseType: 'blob'
    });
  }
}
