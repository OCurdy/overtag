import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div *ngIf="isLoading" class="spinner-container">
      <div class="spinner"></div>
    </div>
  `,
  styleUrls: ['./spinner.component.css'],
  imports: [CommonModule]
})
export class SpinnerComponent {
  @Input() isLoading: boolean = false;
}
