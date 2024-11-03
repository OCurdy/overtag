import { Injectable } from '@angular/core';
import { toLonLat } from 'ol/proj';
import { Subject } from 'rxjs';
import Map from 'ol/Map';

interface LayerInfo {
  title: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private overpassDataSubject = new Subject<any>();
  private layerAddedSubject = new Subject<LayerInfo>();

  overpassData$ = this.overpassDataSubject.asObservable();
  layerAdded$ = this.layerAddedSubject.asObservable();

  private map: Map | undefined;
  private colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8C33'];
  private colorIndex = 0;
  currentQuery: string | undefined;

  setMap(mapInstance: Map): void {
    this.map = mapInstance;
  }

  updateMapData(data: any, query: string): void {
    this.currentQuery = query;
    this.overpassDataSubject.next(data);
  }

  getMapExtent(): { bottomLeft: number[], topRight: number[] } {
    if (!this.map) {
      console.error("La carte n'est pas encore initialisée.");
      return { bottomLeft: [5.9, 46.8], topRight: [10.5, 47.8] };
    }
    
    const extent = this.map.getView().calculateExtent(this.map.getSize());
    const bottomLeft = toLonLat([extent[0], extent[1]]);
    const topRight = toLonLat([extent[2], extent[3]]);

    return { bottomLeft, topRight };
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
}
