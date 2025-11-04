import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enterprise, CreateEnterpriseRequest, UpdateEnterpriseRequest, User } from '../models/enterprise.model';
import { Page } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private apiUrl = `${environment.apiUrl}/enterprises`;

  constructor(private http: HttpClient) {}

  getAllEnterprises(page: number = 0, size: number = 20): Observable<Page<Enterprise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Enterprise>>(this.apiUrl, { params });
  }

  getEnterpriseById(id: number): Observable<Enterprise> {
    return this.http.get<Enterprise>(`${this.apiUrl}/${id}`);
  }

  getEnterpriseByName(name: string): Observable<Enterprise> {
    return this.http.get<Enterprise>(`${this.apiUrl}/name/${name}`);
  }

  createEnterprise(enterprise: CreateEnterpriseRequest): Observable<Enterprise> {
    return this.http.post<Enterprise>(`${this.apiUrl}/createEnterprise`, enterprise);
  }

  updateEnterprise(id: number, enterprise: UpdateEnterpriseRequest): Observable<Enterprise> {
    return this.http.put<Enterprise>(`${this.apiUrl}/${id}`, enterprise);
  }

  deleteEnterprise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUsersInEnterprise(enterpriseId: number, page: number = 0, size: number = 20): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/getAllUserInEnterprise/${enterpriseId}`, { params });
  }

  addUserToEnterprise(enterpriseId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${enterpriseId}/users/${userId}`, {});
  }

  removeUserFromEnterprise(enterpriseId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/removeFromEntreprise/${enterpriseId}/users/${userId}`, {});
  }

  searchEnterprises(query: string, page: number = 0, size: number = 20): Observable<Page<Enterprise>> {
    let params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Enterprise>>(`${this.apiUrl}/search`, { params });
  }

  bulkDeleteEnterprises(enterpriseIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, enterpriseIds);
  }
}
