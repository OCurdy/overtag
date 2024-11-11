import { Component } from '@angular/core';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { LayerPanelComponent } from './layer-panel/layer-panel.component';
import { MapComponent } from "./map.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [SearchBarComponent, MapComponent, LayerPanelComponent]
})
export class AppComponent {
  title = 'tag-viewer';
}
