import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// factory qui renvoie un TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  // chemin où se trouvent vos fichiers JSON
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
