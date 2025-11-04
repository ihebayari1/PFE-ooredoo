import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleAction } from '../models/enterprise.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleActionService {
  private apiUrl = `${environment.apiUrl}/role-actions`;

  constructor(private http: HttpClient) {}

  getAllRoleActions(): Observable<RoleAction[]> {
    return this.http.get<RoleAction[]>(this.apiUrl);
  }

  getRoleActionById(id: number): Observable<RoleAction> {
    return this.http.get<RoleAction>(`${this.apiUrl}/${id}`);
  }

  createRoleAction(roleAction: RoleAction): Observable<RoleAction> {
    return this.http.post<RoleAction>(`${this.apiUrl}/createRoleAction`, roleAction);
  }

  updateRoleAction(id: number, roleAction: RoleAction): Observable<RoleAction> {
    return this.http.put<RoleAction>(`${this.apiUrl}/updateRoleAction/${id}`, roleAction);
  }

  deleteRoleAction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteRoleAction/${id}`);
  }

  getRoleActionByActionKey(actionKey: string): Observable<RoleAction> {
    return this.http.get<RoleAction>(`${this.apiUrl}/action-key/${actionKey}`);
  }
}
