import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface TagInfoResponse {
  data: Array<{
    lang: string;
    description: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class TagInfoService {
  private baseUrl = 'https://taginfo.openstreetmap.org/api/4';

  constructor(private http: HttpClient) {}

  getTagDescription(tag: string): Observable<{ description: string }> {
    const [key, value] = tag.split('=');
  
    const endpoint = value
      ? `${this.baseUrl}/tag/wiki_pages?key=${key}&value=${value}`
      : `${this.baseUrl}/key/wiki_pages?key=${key}`;
  
    return this.http.get<TagInfoResponse>(endpoint).pipe(
      map(response => {
        const englishData = response.data.find(item => item.lang === 'en');
        return {
          description: englishData?.description || 'No description available in English.',
        };
      }),
      catchError(error => {
        console.error('Error fetching tag description:', error);
        return of({ description: 'No description available.' });
      })
    );
  }
}
