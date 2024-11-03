import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { LayerPanelComponent } from './layer-panel/layer-panel.component';
import { MapComponent } from "./map.component";
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterOutlet, SearchBarComponent, MapComponent, LayerPanelComponent, FormsModule]
})
export class AppComponent {
  title = 'tag-viewer';
}
