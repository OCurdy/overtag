import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import OLMap from 'ol/Map';
import Layer from 'ol/layer/Layer';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { saveAs } from 'file-saver';
import { toLonLat } from 'ol/proj';
import { LayerInfo } from '../models/layer-info.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private overpassDataSubject = new Subject<any>();
  private startLoadingSubject = new Subject<void>();
  private layerAddedSubject = new Subject<LayerInfo>();

  overpassData$ = this.overpassDataSubject.asObservable();
  startLoading$ = this.startLoadingSubject.asObservable();
  layerAdded$ = this.layerAddedSubject.asObservable();

  private map: OLMap | undefined;
  private colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8C33'];
  private colorIndex = 0;
  currentQuery: string | undefined;

  private layersMap: Map<string, Layer<any>> = new Map();
  private sourcesMap: Map<string, VectorSource> = new Map();

  private layerIdCounter = 0;

  generateUniqueLayerId(): string {
    return `layer-${++this.layerIdCounter}`;
  }

  setMap(mapInstance: OLMap): void {
    this.map = mapInstance;
  }

  startLoading(): void {
    this.startLoadingSubject.next();
  }

  updateMapData(data: any, query: string): void {
    this.currentQuery = query;
    this.overpassDataSubject.next(data);
  }

  addLayerToPanel(uniqueId: string, title: string, color: string): void {
    const layerInfo: LayerInfo = { uniqueId, title, color };
    this.layerAddedSubject.next(layerInfo);
  }  

  getNextColor(): string {
    const color = this.colors[this.colorIndex % this.colors.length];
    this.colorIndex++;
    return color;
  }

  getMapExtent(): { bottomLeft: [number, number]; topRight: [number, number] } {
    if (!this.map) {
      console.error('Map is not initialized.');
      return { bottomLeft: [5.9, 46.8], topRight: [10.5, 47.8] }; // Coordonnées par défaut (Suisse)
    }
  
    const extent = this.map.getView().calculateExtent(this.map.getSize());
    const bottomLeft = toLonLat([extent[0], extent[1]]) as [number, number];
    const topRight = toLonLat([extent[2], extent[3]]) as [number, number];
  
    return { bottomLeft, topRight };
  }
  

  addLayerToMap(uniqueId: string, layer: Layer<any>, source: VectorSource): void {
    if (this.layersMap.has(uniqueId)) {
      console.warn(`Layer "${uniqueId}" already exists. Skipping.`);
      return;
    }
  
    if (this.map) {
      this.map.addLayer(layer); // Ajoute la couche à la carte
      this.layersMap.set(uniqueId, layer); // Stocke la couche avec uniqueId
      this.sourcesMap.set(uniqueId, source); // Stocke la source avec uniqueId
      console.log(`Layer "${uniqueId}" added to map.`);
      console.log('Current layers in map:', Array.from(this.layersMap.keys()));
    } else {
      console.error('Map is not initialized.');
    }
  }  
  
  updateLayerOrder(layers: LayerInfo[]): void {
    if (!this.map) {
      console.warn('Map is not initialized.');
      return;
    }
  
    const mapLayers = this.map.getLayers();
    const currentLayers = mapLayers.getArray();
    const baseLayer = currentLayers.find(layer => layer.get('isBaseLayer'));
  
    mapLayers.clear();
    if (baseLayer) {
      mapLayers.push(baseLayer);
    }
  
    [...layers].reverse().forEach(layerInfo => {
      const mapLayer = this.layersMap.get(layerInfo.uniqueId);
      if (mapLayer) {
        mapLayers.push(mapLayer);
      }
    });
  
    console.log('Layer order updated on the map:', layers.map(l => l.title));
  }  

  removeLayerFromMap(uniqueId: string): void {
    console.log('Attempting to remove layer:', uniqueId);
    const layer = this.layersMap.get(uniqueId);
    if (layer && this.map) {
      this.map.removeLayer(layer);
      this.layersMap.delete(uniqueId);
      this.sourcesMap.delete(uniqueId);
      console.log('Layer removed successfully:', uniqueId);
    } else {
      console.warn('Layer not found or map is undefined:', uniqueId);
    }
  }  

  removeLayerById(uniqueId: string): void {
    const layer = this.layersMap.get(uniqueId);
    if (layer && this.map) {
      this.map.removeLayer(layer); // Supprime la couche de la carte
      this.layersMap.delete(uniqueId); // Supprime la couche des références
      this.sourcesMap.delete(uniqueId); // Supprime la source des références
      console.log(`Layer "${uniqueId}" removed.`);
    } else {
      console.warn(`Layer "${uniqueId}" not found.`);
    }
  }
  

  getFeaturesFromLayer(uniqueId: string): Feature<Geometry>[] | null {
    const source = this.sourcesMap.get(uniqueId);
    return source ? source.getFeatures() : null;
  }

  downloadLayer(layerTitle: string, format: string, geometry: string): Promise<void> {
    const query = `
      [out:${format === 'json' ? 'json' : 'xml'}][timeout:25];
      (
        ${geometry === 'point' ? 'node' : geometry === 'line' ? 'way' : 'relation'}["${layerTitle}"];
      );
      out body;`;

    const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    return fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Overpass API error: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const fileExtension = format === 'json' ? 'json' : format;
        const fileName = `${layerTitle}_${geometry}.${fileExtension}`;
        saveAs(blob, fileName);
        console.log(`Layer downloaded: ${fileName}`);
      });
  }
}