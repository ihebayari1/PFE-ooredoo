import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zone, Sector, User } from '../models/enterprise.model';
import { Page } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private apiUrl = `${environment.apiUrl}/zones`;

  constructor(private http: HttpClient) {}

  getAllZones(page: number = 0, size: number = 20): Observable<Page<Zone>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Zone>>(this.apiUrl, { params });
  }

  getZoneById(id: number): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/${id}`);
  }

  createZone(zone: Zone): Observable<Zone> {
    return this.http.post<Zone>(`${this.apiUrl}/create-Zone`, zone);
  }

  updateZone(id: number, zone: Zone): Observable<Zone> {
    return this.http.put<Zone>(`${this.apiUrl}/updateZone/${id}`, zone);
  }

  deleteZone(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteZone/${id}`);
  }

  assignHeadToZone(zoneId: number, userId: number): Observable<Zone> {
    return this.http.put<Zone>(`${this.apiUrl}/${zoneId}/head/${userId}`, {});
  }

  getZonesByRegionId(regionId: number): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/zoneByRegion/regions/${regionId}`);
  }

  getSectorsByZoneId(zoneId: number): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${environment.apiUrl}/sectors/SectorByZone/${zoneId}`);
  }
}
