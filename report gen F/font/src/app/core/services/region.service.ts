import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Region, Zone, User } from '../models/enterprise.model';
import { Page } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private apiUrl = `${environment.apiUrl}/regions`;

  constructor(private http: HttpClient) {}

  getAllRegions(page: number = 0, size: number = 20): Observable<Page<Region>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Region>>(this.apiUrl, { params });
  }

  getRegionById(id: number): Observable<Region> {
    return this.http.get<Region>(`${this.apiUrl}/${id}`);
  }

  createRegion(region: Region): Observable<Region> {
    return this.http.post<Region>(`${this.apiUrl}/createRegion`, region);
  }

  updateRegion(id: number, region: Region): Observable<Region> {
    return this.http.put<Region>(`${this.apiUrl}/updateRegion/${id}`, region);
  }

  deleteRegion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteRegion/${id}`);
  }

  assignHeadToRegion(regionId: number, userId: number): Observable<Region> {
    return this.http.put<Region>(`${this.apiUrl}/${regionId}/head/${userId}`, {});
  }

  getZonesByRegionId(regionId: number): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/zoneByRegion/${regionId}`);
  }
}
