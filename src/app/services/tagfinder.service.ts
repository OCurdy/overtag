import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

interface ApiResponse {
  prefLabel: string;
  scopeNote: Array<{ [key: string]: string }>;
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagfinderService {
  private apiUrl = 'https://tagfinder.osm.ch/api/search';

  constructor(private http: HttpClient, private translate: TranslateService) {}

  suggestTag(query: string): Observable<string[]> {
    const lang = this.translate.currentLang || 'en';
    const url = `${this.apiUrl}?query=${query}&lang=${lang}&sortname=count_all&sortorder=desc&page=1&rp=10`;
    return this.http.get<ApiResponse[]>(url).pipe(
      map((response) => {
        // Récupérer les 5 premiers "prefLabel"
        return response.slice(0, 5).map((item: ApiResponse) => item.prefLabel);
      })
    );
  }
}
