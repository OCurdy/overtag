import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private http: HttpClient, private translate: TranslateService) {}

  getTagDescription(tag: string): Observable<{ description: string }> {
    const [key, value] = tag.split('=');

    const userLang = this.translate.currentLang || 'en'; // Récupérer la langue courante
    const endpoint = value
      ? `${this.baseUrl}/tag/wiki_pages?key=${key}&value=${value}`
      : `${this.baseUrl}/key/wiki_pages?key=${key}`;

    return this.http.get<TagInfoResponse>(endpoint).pipe(
      map(response => {
        const localizedData = response.data.find(item => item.lang === userLang);
        const fallbackData = response.data.find(item => item.lang === 'en'); // Fallback vers l'anglais
        return {
          description: localizedData?.description || fallbackData?.description || 'No description available.',
        };
      }),
      catchError(error => {
        console.error('Error fetching tag description:', error);
        return of({ description: 'No description available.' });
      })
    );
  }
}
