import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import OLMap from 'ol/Map';
import Layer from 'ol/layer/Layer';
import { toLonLat } from 'ol/proj';

interface LayerInfo {
  title: string;
  color: string;
  description?: string;
}

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

  private map: OLMap | undefined; // Alias OpenLayers Map
  private colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8C33'];
  private colorIndex = 0;
  currentQuery: string | undefined;

  private layersMap: Map<string, Layer<any>> = new Map();

  setMap(mapInstance: OLMap): void {
    this.map = mapInstance;
  }

  startLoading(): void {
    this.startLoadingSubject.next();
  }

  updateMapData(data: any, query: string): void {
    this.currentQuery = query; // Track the current query
    this.overpassDataSubject.next(data); // Notify subscribers with the data
  }

  addLayerToPanel(title: string, color: string): void {
    const layerInfo: LayerInfo = { title, color };
    this.layerAddedSubject.next(layerInfo);
  }

  getNextColor(): string {
    const color = this.colors[this.colorIndex % this.colors.length];
    this.colorIndex++;
    return color;
  }

  addLayerToMap(layerTitle: string, layer: Layer<any>): void {
    if (this.map) {
      this.map.addLayer(layer);
      this.layersMap.set(layerTitle, layer);
      console.log('Layer added to map:', layerTitle, layer);
      console.log('Current layersMap:', Array.from(this.layersMap.keys()));
    }
  }  

  removeLayerFromMap(layerTitle: string): void {
    console.log('Attempting to remove layer:', layerTitle);
    console.log('Current layersMap:', Array.from(this.layersMap.keys()));
    const layer = this.layersMap.get(layerTitle);
    if (layer && this.map) {
      this.map.removeLayer(layer);
      this.layersMap.delete(layerTitle);
      console.log('Layer removed successfully:', layerTitle);
    } else {
      console.warn('Layer not found or map is undefined:', layerTitle);
    }
  }  

  getMapExtent(): { bottomLeft: number[]; topRight: number[] } {
    if (!this.map) {
      console.error('La carte n\'est pas encore initialisée.');
      return { bottomLeft: [5.9, 46.8], topRight: [10.5, 47.8] };
    }

    const extent = this.map.getView().calculateExtent(this.map.getSize());
    const bottomLeft = [extent[0], extent[1]];
    const topRight = [extent[2], extent[3]];

    return { bottomLeft: toLonLat(bottomLeft), topRight: toLonLat(topRight) };
  }
}
