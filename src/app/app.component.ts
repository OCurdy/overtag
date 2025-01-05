import { Component } from '@angular/core';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { LayerPanelComponent } from './layer-panel/layer-panel.component';
import { MapComponent } from "./map/map.component";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [SearchBarComponent, MapComponent, LayerPanelComponent]
})
export class AppComponent {
  title = 'tag-viewer';
  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'fr', 'de', 'it']);

    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    if (browserLang && ['en', 'fr', 'de', 'it'].includes(browserLang)) {
      translate.use(browserLang);
    } else {
      translate.use('en');
    }
  }
}
