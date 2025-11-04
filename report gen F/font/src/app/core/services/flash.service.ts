import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flash, FlashRequest, FlashResponse, FlashFile } from '../models/flash.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlashService {
  private apiUrl = `${environment.apiUrl}/flash`;

  constructor(private http: HttpClient) {}

  getAllFlashes(): Observable<FlashResponse[]> {
    return this.http.get<FlashResponse[]>(this.apiUrl);
  }

  getFlashById(id: number): Observable<FlashResponse> {
    return this.http.get<FlashResponse>(`${this.apiUrl}/${id}`);
  }

  createFlash(flash: FlashRequest): Observable<FlashResponse> {
    return this.http.post<FlashResponse>(`${this.apiUrl}/create`, flash);
  }

  updateFlash(id: number, flash: FlashRequest): Observable<FlashResponse> {
    return this.http.put<FlashResponse>(`${this.apiUrl}/${id}`, flash);
  }

  deleteFlash(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadFile(flashId: number, file: File): Observable<FlashResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<FlashResponse>(`${this.apiUrl}/${flashId}/upload`, formData);
  }

  uploadFileWithProgress(flashId: number, file: File): Observable<HttpEvent<FlashResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<FlashResponse>(`${this.apiUrl}/${flashId}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  deleteFile(flashId: number, fileId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${flashId}/files/${fileId}`);
  }

  downloadFile(flashId: number, fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${flashId}/files/${fileId}/download`, {
      responseType: 'blob'
    });
  }

  searchFlashes(query: string): Observable<FlashResponse[]> {
    return this.http.get<FlashResponse[]>(`${this.apiUrl}/search?query=${encodeURIComponent(query)}`);
  }

  // Helper method to get file download URL
  getFileDownloadUrl(flashId: number, fileId: number): string {
    return `${this.apiUrl}/${flashId}/files/${fileId}/download`;
  }

  // Helper method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper method to get file icon based on file type
  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) {
      return 'image';
    } else if (fileType.startsWith('video/')) {
      return 'movie';
    } else if (fileType === 'application/pdf') {
      return 'picture_as_pdf';
    } else {
      return 'insert_drive_file';
    }
  }

  // Helper method to check if file type is supported
  isSupportedFileType(fileType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/webm',
      'application/pdf'
    ];
    
    return supportedTypes.includes(fileType);
  }
}
