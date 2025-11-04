import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserType, Role, POS } from '../models/enterprise.model';
import { Page } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 0, size: number = 20, sort?: string): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (sort) {
      params = params.set('sort', sort);
    }
    
    return this.http.get<Page<User>>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  getUsersByType(userType: UserType, page: number = 0, size: number = 20): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/type/${userType}`, { params });
  }

  getAvailableHeads(userType: UserType, page: number = 0, size: number = 20): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/available-heads/${userType}`, { params });
  }

  getAvailableHeadsByRole(roleName: string, page: number = 0, size: number = 20): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/available-heads-by-role/${roleName}`, { params });
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/addUser`, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/updateUser/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteUser/${id}`);
  }

  updatePassword(id: number, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/password`, { newPassword });
  }

  updatePin(id: number, newPin: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/pin`, { newPin });
  }

  verifyPin(email: string, pin: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-pin`, { email, pin });
  }

  assignRoleToUser(userId: number, roleId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/roles/${roleId}`, {});
  }

  assignRolesToUser(userId: number, roleIds: number[]): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/roles`, roleIds);
  }

  removeRoleFromUser(userId: number, roleId: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}/roles/${roleId}`);
  }

  removeRolesFromUser(userId: number, roleIds: number[]): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}/roles`, { body: roleIds });
  }

  removeAllRolesFromUser(userId: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}/roles/all`);
  }

  linkUserToPOS(userId: number, posCode: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/link-pos`, { posCode });
  }

  unlinkUserFromPOS(userId: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}/unlink-pos`);
  }

  getUsersByPOS(posId: number, page: number = 0, size: number = 20): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/pos/${posId}`, { params });
  }

  getUsersByPOSCode(posCode: string, page: number = 0, size: number = 20): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/by-pos-code/${posCode}`, { params });
  }

  getAllUsersInRegion(regionId: number, page: number = 0, size: number = 20): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/regions/${regionId}`, { params });
  }

  searchUsers(query: string, page: number = 0, size: number = 20): Observable<Page<User>> {
    let params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/search`, { params });
  }

  getUsersByRole(roleName: string, page: number = 0, size: number = 50): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<User>>(`${this.apiUrl}/by-role/${roleName}`, { params });
  }

  bulkDeleteUsers(userIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, userIds);
  }

  bulkUpdateUserStatus(userIds: number[], enabled: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-update-status`, { userIds, enabled });
  }
}