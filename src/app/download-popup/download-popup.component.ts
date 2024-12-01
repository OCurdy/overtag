import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';
import GeoJSON from 'ol/format/GeoJSON';
import { saveAs } from 'file-saver';
import { LayerInfo } from '../models/layer-info.model';

@Component({
  selector: 'app-download-popup',
  templateUrl: './download-popup.component.html',
  styleUrls: ['./download-popup.component.css'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule]
})
export class DownloadPopupComponent {
  @Input() layer: LayerInfo | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() download = new EventEmitter<string>();

  constructor(private mapService: MapService) {}

  selectedGeometry = 'point';

  downloadClicked(): void {
    console.log(`Downloading layer: ${this.layer?.title}, Geometry: ${this.selectedGeometry}`);
    this.download.emit(this.selectedGeometry);
    this.close.emit();
  }

  downloadFormat(format: string): void {
    if (!this.layer) {
      console.error('No layer selected for download.');
      return;
    }

    console.log(`Downloading layer with uniqueId: ${this.layer.uniqueId}`);

    const features = this.mapService.getFeaturesFromLayer(this.layer.uniqueId);
    if (!features) {
      console.error(`No features found for layer: ${this.layer.title}`);
      return;
    }

    const geoJSON = new GeoJSON().writeFeatures(features);
    const blob = new Blob([geoJSON], { type: 'application/json' });

    if (format === 'json') {
      saveAs(blob, `${this.layer.title}.json`);
    } else {
      console.warn(`Format ${format} not yet supported.`);
    }
  }

  // ... (le reste du code)
}
