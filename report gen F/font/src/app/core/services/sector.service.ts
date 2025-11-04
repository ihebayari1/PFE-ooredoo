import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sector, POS, User } from '../models/enterprise.model';
import { Page } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  private apiUrl = `${environment.apiUrl}/sectors`;

  constructor(private http: HttpClient) {}

  getAllSectors(page: number = 0, size: number = 20): Observable<Page<Sector>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Sector>>(this.apiUrl, { params });
  }

  getSectorById(id: number): Observable<Sector> {
    return this.http.get<Sector>(`${this.apiUrl}/${id}`);
  }

  createSector(sector: Sector): Observable<Sector> {
    return this.http.post<Sector>(`${this.apiUrl}/create-Sector`, sector);
  }

  updateSector(id: number, sector: Sector): Observable<Sector> {
    return this.http.put<Sector>(`${this.apiUrl}/updateSector/${id}`, sector);
  }

  deleteSector(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteSector/${id}`);
  }

  assignHeadToSector(sectorId: number, userId: number): Observable<Sector> {
    return this.http.put<Sector>(`${this.apiUrl}/${sectorId}/head/${userId}`, {});
  }

  getSectorsWithoutHead(): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/without-head`);
  }

  getSectorByZoneId(zoneId: number): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/SectorByZone/${zoneId}`);
  }

  getPOSBySectorId(sectorId: number): Observable<POS[]> {
    return this.http.get<POS[]>(`${this.apiUrl}/posBySector/${sectorId}`);
  }
}
