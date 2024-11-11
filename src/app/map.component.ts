import { Component, OnInit } from '@angular/core';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { Point, LineString, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { MapService } from './map.service';
import { SpinnerComponent } from './spinner.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [SpinnerComponent],
})
export class MapComponent implements OnInit {
  map: Map | undefined;
  isLoading: boolean = false;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [919078.8281, 5902314.4501],
        zoom: 8,
      }),
    });

    this.mapService.setMap(this.map);

    this.mapService.startLoading$.subscribe(() => {
      this.isLoading = true; // Show spinner when loading starts
    });

    this.mapService.overpassData$.subscribe({
      next: (overpassData: any) => {
        this.isLoading = false; // Hide spinner when data is loaded
        const layerTitle = `${this.mapService.currentQuery || 'default'}`;
        const color = this.mapService.getNextColor();
        this.addVectorLayer(overpassData, layerTitle, color);
      },
      error: () => {
        this.isLoading = false; // Hide spinner on error
      },
    });
  }

  addVectorLayer(overpassData: any, layerTitle: string, color: string): void {
    const vectorSource = new VectorSource();
  
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
  
    this.mapService.addLayerToPanel(layerTitle, color);
    this.mapService.addLayerToMap(layerTitle, vectorLayer);
  
    const usedNodeIds = new Set<number>();
  
    overpassData.elements.forEach((element: any) => {
      if (element.type === 'way' && element.nodes) {
        element.nodes.forEach((nodeId: number) => usedNodeIds.add(nodeId));
      }
      if (element.type === 'relation' && element.members) {
        element.members.forEach((member: any) => {
          if (member.type === 'way' && member.nodes) {
            member.nodes.forEach((nodeId: number) => usedNodeIds.add(nodeId));
          }
        });
      }
    });
  
    overpassData.elements.forEach((element: any) => {
      let feature: Feature | null = null;
  
      if (element.type === 'node' && element.lat && element.lon && !usedNodeIds.has(element.id)) {
        feature = new Feature({
          geometry: new Point(fromLonLat([element.lon, element.lat])),
          properties: element.tags || {},
        });
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({ color: color }),
              stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.3)', width: 1 }),
            }),
          })
        );
      } else if (element.type === 'way' && element.geometry) {
        const coordinates = element.geometry.map((node: any) =>
          fromLonLat([node.lon, node.lat])
        );
  
        if (
          coordinates.length > 2 &&
          coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
          coordinates[0][1] === coordinates[coordinates.length - 1][1]
        ) {
          feature = new Feature({
            geometry: new Polygon([coordinates]),
            properties: element.tags || {},
          });
          feature.setStyle(
            new Style({
              stroke: new Stroke({ color: color, width: 2 }),
              fill: new Fill({ color: this.hexToRgba(color, 0.6) }),
            })
          );
        } else {
          feature = new Feature({
            geometry: new LineString(coordinates),
            properties: element.tags || {},
          });
          feature.setStyle(
            new Style({
              stroke: new Stroke({ color: color, width: 2 }),
            })
          );
        }
      } else if (element.type === 'relation' && element.members) {
        element.members.forEach((member: any) => {
          if (member.type === 'way' && member.geometry) {
            const coordinates = member.geometry.map((node: any) =>
              fromLonLat([node.lon, node.lat])
            );
            const relationFeature = new Feature({
              geometry: new Polygon([coordinates]),
              properties: element.tags || {},
            });
            relationFeature.setStyle(
              new Style({
                stroke: new Stroke({ color: color, width: 2 }),
                fill: new Fill({ color: this.hexToRgba(color, 0.6) }),
              })
            );
            vectorSource.addFeature(relationFeature);
          }
        });
      }
  
      if (feature) {
        vectorSource.addFeature(feature);
      }
    });
  
    this.map?.addLayer(vectorLayer);
  }

  hexToRgba(hex: string, alpha: number): string {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
  
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
}
