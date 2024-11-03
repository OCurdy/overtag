import { Component } from '@angular/core';
import { TagfinderService } from '../tagfinder.service';
import { OverpassService } from '../overpass.service';
import { MapService } from '../map.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SearchBarComponent {
  searchQuery = '';
  suggestions: string[] = [];

  constructor(
    private tagfinderService: TagfinderService,
    private overpassService: OverpassService,
    private mapService: MapService
  ) {}

  onInputChange(): void {
    if (this.searchQuery.length >= 3) {
      this.tagfinderService.suggestTag(this.searchQuery)
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((suggestions: string[]) => of(suggestions))
        )
        .subscribe({
          next: (suggestions: string[]) => {
            this.suggestions = suggestions;
          },
          error: (error) => {
            console.error('Erreur lors de la récupération des suggestions:', error);
            this.suggestions = [];
          }
        });
    } else {
      this.suggestions = [];
    }
  }

  onSuggestionSelect(suggestion: string): void {
    this.searchQuery = suggestion;
    this.suggestions = [];
    this.onSearch();
  }

  async onSearch(): Promise<void> {
    if (this.searchQuery) {
      try {
        const bbox = this.getBoundingBoxString();
        const data = await this.overpassService.queryOverpass(this.searchQuery, bbox);
        // Utiliser `updateMapData` pour mettre à jour la carte et ajouter au panneau
        this.mapService.updateMapData(data, this.searchQuery);  // Passer la requête comme titre de la couche
      } catch (error) {
        console.error('Erreur lors de la requête Overpass:', error);
      }
    }
  }

  private getBoundingBoxString(): string {
    const { bottomLeft, topRight } = this.mapService.getMapExtent();
    if (bottomLeft.includes(NaN) || topRight.includes(NaN)) {
      console.error("Erreur: les coordonnées de la carte ne sont pas valides.");
      return "46.8,5.9,47.8,10.5";  // Coordonnées par défaut couvrant la Suisse
    }
    return `${bottomLeft[1]},${bottomLeft[0]},${topRight[1]},${topRight[0]}`;
  }
}
