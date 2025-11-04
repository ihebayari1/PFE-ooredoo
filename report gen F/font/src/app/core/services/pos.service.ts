import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { POS, User } from '../models/enterprise.model';
import { Page } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class POSService {
  private apiUrl = `${environment.apiUrl}/pos`;

  constructor(private http: HttpClient) {}

  getAllPOS(page: number = 0, size: number = 20): Observable<Page<POS>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<POS>>(this.apiUrl, { params });
  }

  getPOSById(id: number): Observable<POS> {
    return this.http.get<POS>(`${this.apiUrl}/${id}`);
  }

  getPOSByCode(code: string): Observable<POS> {
    return this.http.get<POS>(`${this.apiUrl}/code/${code}`);
  }

  createPOS(pos: POS): Observable<POS> {
    return this.http.post<POS>(`${this.apiUrl}/create-POS`, pos);
  }

  updatePOS(id: number, pos: POS): Observable<POS> {
    return this.http.put<POS>(`${this.apiUrl}/updatePOS/${id}`, pos);
  }

  deletePOS(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignHeadToPOS(posId: number, userId: number): Observable<POS> {
    return this.http.put<POS>(`${this.apiUrl}/${posId}/head/${userId}`, {});
  }

  getPOSBySectorId(sectorId: number): Observable<POS[]> {
    return this.http.get<POS[]>(`${this.apiUrl}/posBySector/sector/${sectorId}`);
  }

  getPOSByHeadId(headOfPOSId: number): Observable<POS> {
    return this.http.get<POS>(`${this.apiUrl}/users/${headOfPOSId}`);
  }

  getPOSWithoutHead(): Observable<POS[]> {
    return this.http.get<POS[]>(`${this.apiUrl}/without-head`);
  }

  // User assignment methods
  assignUserToPOS(posId: number, userId: number): Observable<POS> {
    return this.http.put<POS>(`${this.apiUrl}/${posId}/users/${userId}`, {});
  }

  unassignUserFromPOS(posId: number, userId: number): Observable<POS> {
    return this.http.delete<POS>(`${this.apiUrl}/${posId}/users/${userId}`);
  }

  assignUsersToPOS(posId: number, userIds: number[]): Observable<POS> {
    return this.http.post<POS>(`${this.apiUrl}/${posId}/users`, userIds);
  }

  getUsersByPOS(posId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${posId}/users`);
  }
}
