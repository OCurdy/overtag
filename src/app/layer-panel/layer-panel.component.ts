import { Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { BootstrapIconService } from '../icon.service';
import { TagInfoService } from '../taginfo.service';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
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
        this.layers.push({
          ...layer,
          description: data.description,
        });
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
