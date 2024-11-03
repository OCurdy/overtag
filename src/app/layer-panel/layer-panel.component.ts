// layer-panel.component.ts
import { Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { CommonModule } from '@angular/common';

interface LayerInfo {
  title: string;
  color: string;
}

@Component({
  selector: 'app-layer-panel',
  templateUrl: './layer-panel.component.html',
  styleUrls: ['./layer-panel.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class LayerPanelComponent implements OnInit {
  layers: LayerInfo[] = [];

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    // S'abonner aux couches ajoutées dans le service
    this.mapService.layerAdded$.subscribe((layer: LayerInfo) => {
      this.layers.push(layer);
    });
  }
}
