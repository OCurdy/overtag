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
import { MapService } from '../services/map.service';
import { SpinnerComponent } from '../loading-spinner/spinner.component';
import Overlay from 'ol/Overlay';

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

  popupElement: HTMLElement | undefined;
  popupContent: HTMLElement | undefined;
  popupCloser: HTMLElement | undefined;
  overlay: Overlay | undefined;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    baseLayer.set('isBaseLayer', true);

    this.map = new Map({
      target: 'map',
      layers: [baseLayer],
      view: new View({
        center: [919078.8281, 5902314.4501],
        zoom: 8,
      }),
    });

    this.mapService.setMap(this.map);

    this.popupElement = document.getElementById('popup') as HTMLElement;
    this.popupContent = document.getElementById('popup-content') as HTMLElement;
    this.popupCloser = document.getElementById('popup-closer') as HTMLElement;

    this.overlay = new Overlay({
      element: this.popupElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });    

    this.map.addOverlay(this.overlay);

    this.popupCloser.onclick = () => {
      this.overlay?.setPosition(undefined);
      this.popupCloser?.blur();
      return false;
    };

    this.map.on('singleclick', (evt) => this.handleMapClick(evt));

    this.mapService.startLoading$.subscribe(() => {
      this.isLoading = true;
    });

    this.mapService.overpassData$.subscribe({
      next: (overpassData: any) => {
        this.isLoading = false;
        const layerTitle = `${this.mapService.currentQuery || 'default'}`;
        const color = this.mapService.getNextColor();
        this.addVectorLayer(overpassData, layerTitle, color);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  handleMapClick(event: any): void {
    if (!this.map) {
      return;
    }
  
    const feature = this.map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
  
    if (feature) {
      const coordinates = event.coordinate;
      const parentProperties = feature.getProperties();
  
      delete parentProperties['geometry'];
      const realTags = parentProperties['properties'] || {};
  
      const relevantTags = [
        'name',
        'addr:housenumber',
        'addr:street',
        'addr:city',
        'addr:postcode',
        'addr:country',
        'phone',
        'email',
        'website',
        'opening_hours',
        'amenity',
        'shop',
        'operator',
        'species',
        'height',
        'description',
        'brand',
        'historic',
        'building'
      ];
  
      const featureName = realTags['name'] || '';
  
      let infoContent = '';
  
      if (featureName) {
        infoContent += `<div style="font-weight: bold;">${featureName}</div>`;
      }
  
      let tableContent = `
      <table style="border-collapse: collapse; width: 100%; margin-top: 0.5em;">
        <thead>
          <tr>
            <th style="text-align:left; padding-right: 0.5em;">Key</th>
            <th style="text-align:left; padding-left: 0.5em;">Value</th>
          </tr>
        </thead>
        <tbody>
      `;
  
      let rowCount = 0;
  
      relevantTags.forEach((tag) => {
        if (tag !== 'name' && realTags[tag]) {
          tableContent += `
            <tr>
              <td style="text-align:left; padding-right: 0.5em;"><strong>${tag}</strong></td>
              <td style="text-align:left; padding-left: 0.5em;">${realTags[tag]}</td>
            </tr>
          `;
          rowCount++;
        }
      });
  
      tableContent += `</tbody></table>`;
  
      // S'il n'y a ni name ni aucune autre info, on affiche "Aucune information disponible"
      if (!featureName && rowCount === 0) {
        infoContent = '<p>Aucune information disponible</p>';
      }
      // Sinon, on concatène le tableau s'il y a au moins 1 ligne
      else if (rowCount > 0) {
        infoContent += tableContent;
      }
  
      this.popupContent!.innerHTML = infoContent;
      this.overlay!.setPosition(coordinates);
    } else {
      this.overlay!.setPosition(undefined);
      this.popupCloser?.blur();
    }
  }  

  addVectorLayer(overpassData: any, layerTitle: string, color: string): void {
    const uniqueId = this.mapService.generateUniqueLayerId();
    console.log(`Generated uniqueId: ${uniqueId}`);

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      properties: { id: uniqueId, title: layerTitle },
    });

    vectorLayer.set('id', uniqueId);

    this.mapService.addLayerToPanel(uniqueId, layerTitle, color);
    this.mapService.addLayerToMap(uniqueId, vectorLayer, vectorSource);

    const usedNodeIds = new Set<number>();

    overpassData.elements.forEach((element: any) => {
      if (element.type === 'way' && element.nodes) {
        element.nodes.forEach((nodeId: number) => usedNodeIds.add(nodeId));
      }
    });

    overpassData.elements.forEach((element: any) => {
      console.log('[DEBUG] element => ', element);
      console.log('[DEBUG] element.tags => ', element.tags);
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
        const coordinates = element.geometry.map((node: any) => fromLonLat([node.lon, node.lat]));

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
              fill: new Fill({ color: this.hexToRgba(color, 0.6) }),
              stroke: new Stroke({ color: color, width: 2 }),
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
      }

      if (feature) {
        vectorSource.addFeature(feature);
      }
    });

    console.log(`Added new layer: ${uniqueId}`);
  }

  hexToRgba(hex: string, alpha: number): string {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
