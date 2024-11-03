import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class OverpassService {
  private overpassApiUrl = 'http://overpass.osm.ch/api/interpreter';

  async queryOverpass(tag: string, bbox: string): Promise<any> {
    const [key, value] = tag.split('=');
    
    const query = `[out:json][timeout:25];
      (
        node["${key}"="${value}"](${bbox});
        way["${key}"="${value}"](${bbox});
        relation["${key}"="${value}"](${bbox});
      );
      out geom;
      >;
      out skel qt;`;
    const url = `${this.overpassApiUrl}?data=${encodeURIComponent(query)}`;

    const response = await axios.get(url);
    return response.data;
  }
}
