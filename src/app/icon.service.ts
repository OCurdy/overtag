import { Injectable } from '@angular/core';
import icons from '../assets/bootstrap-icons.json';

@Injectable({
  providedIn: 'root',
})
export class BootstrapIconService {
  private availableIcons: Set<string>;

  constructor() {
    this.availableIcons = new Set(Object.keys(icons));
  }

  getIconForTag(layerTitle: string): string {
    const [key, value] = layerTitle.split('=');

    if (value && this.availableIcons.has(value)) {
      return `bi bi-${value}`;
    }

    if (key && this.availableIcons.has(key)) {
      return `bi bi-${key}`;
    }

    return 'bi bi-layers';
  }
}
