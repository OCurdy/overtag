import { Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { BootstrapIconService } from '../icon.service';
import { TagInfoService } from '../taginfo.service';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface LayerInfo {
  title: string;
  color: string;
  description?: string;
}

@Component({
  selector: 'app-layer-panel',
  templateUrl: './layer-panel.component.html',
  styleUrls: ['./layer-panel.component.css'],
  standalone: true,
  imports: [CommonModule, DragDropModule],
})
export class LayerPanelComponent implements OnInit {
  layers: LayerInfo[] = [];

  constructor(
    private mapService: MapService,
    private bootstrapIconService: BootstrapIconService,
    private tagInfoService: TagInfoService
  ) {}

  ngOnInit(): void {
    this.mapService.layerAdded$.subscribe((layer: LayerInfo) => {
      this.tagInfoService.getTagDescription(layer.title).subscribe((data) => {
        // Add the new layer to the top of the list
        this.layers.unshift({
          ...layer,
          description: data.description,
        });
        // Ensure the new layer appears on top in the map
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
    this.mapService.removeLayerFromMap(layerToRemove.title);
  }

  onDrop(event: CdkDragDrop<LayerInfo[]>): void {
    moveItemInArray(this.layers, event.previousIndex, event.currentIndex);
    this.mapService.updateLayerOrder(this.layers); // Update map order
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
}
