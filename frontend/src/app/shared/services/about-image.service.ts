import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AboutImage {
  slotIndex: number;
  path: string;
}

@Injectable({ providedIn: 'root' })
export class AboutImageService {
  private readonly base = '/api/about-images';

  constructor(private http: HttpClient) {}

  getImages(): Observable<AboutImage[]> {
    return this.http.get<AboutImage[]>(this.base);
  }

  uploadImage(slotIndex: number, file: File): Observable<AboutImage> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<AboutImage>(`${this.base}/${slotIndex}`, form);
  }

  deleteImage(slotIndex: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${slotIndex}`);
  }
}
