import { Component, OnInit } from '@angular/core';
import { MapService } from '../services/map.service';
import { BootstrapIconService } from '../services/icon.service';
import { TagInfoService } from '../services/taginfo.service';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DownloadPopupComponent } from '../download-popup/download-popup.component';
import { LayerInfo } from '../models/layer-info.model'; // Import LayerInfo

@Component({
  selector: 'app-layer-panel',
  templateUrl: './layer-panel.component.html',
  styleUrls: ['./layer-panel.component.css'],
  standalone: true,
  imports: [CommonModule, DragDropModule, DownloadPopupComponent],
})
export class LayerPanelComponent implements OnInit {
  layers: LayerInfo[] = [];
  showDownloadPopup: boolean = false;
  selectedLayer: LayerInfo | null = null;

  constructor(
    private mapService: MapService,
    private bootstrapIconService: BootstrapIconService,
    private tagInfoService: TagInfoService,
  ) {}

  ngOnInit(): void {
    this.mapService.layerAdded$.subscribe((layer: LayerInfo) => {
      this.tagInfoService.getTagDescription(layer.title).subscribe((data) => {
        this.layers.unshift({
          ...layer,
          description: data.description,
        });
        this.mapService.updateLayerOrder(this.layers);
      });
    });
  }

  getIconClass(layer: LayerInfo): string {
    return this.bootstrapIconService.getIconForTag(layer.title);
  }

  removeLayer(index: number): void {
    const layerToRemove = this.layers[index];
    this.layers.splice(index, 1);
    this.mapService.removeLayerFromMap(layerToRemove.uniqueId);
  }  

  onDrop(event: CdkDragDrop<LayerInfo[]>): void {
    moveItemInArray(this.layers, event.previousIndex, event.currentIndex);
    this.mapService.updateLayerOrder(this.layers);
  }

  getTruncatedDescription(description?: string, maxLength: number = 100): string {
    if (!description) {
      return 'No description available.';
    }
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
  }

  getWikiLink(title: string): string {
    const [key, value] = title.split('=');
    return value
      ? `https://wiki.openstreetmap.org/wiki/Tag:${key}%3D${value}`
      : `https://wiki.openstreetmap.org/wiki/Key:${key}`;
  }

  openDownloadPopup(layer: LayerInfo): void {
    console.log('openDownloadPopup called with layer:', layer);
    this.selectedLayer = layer;
    this.showDownloadPopup = true;
  }

  closeDownloadPopup(): void {
    this.showDownloadPopup = false;
    this.selectedLayer = null;
  }

  downloadLayer(selectedGeometry: string): void {
    if (this.selectedLayer) {
      this.mapService.downloadLayer(this.selectedLayer.title, 'xml', selectedGeometry);
    }
    this.closeDownloadPopup();
  }
}
