import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../api/weather-service';
import { WeatherDisplay } from '../../models/weather.interface';

@Component({
  selector: 'app-weather-search',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="w-100">
    <form (ngSubmit)="onSearch(); $event.preventDefault()">
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          [value]="cityInput()"
          (input)="onCityInputChange($event)"
          (keyup.enter)="onSearch()"
          placeholder="Entrez une ville"
          [class.is-invalid]="error()"
          required
        />
        <button
          class="btn btn-warning border-0"
          type="button"
          (click)="onSearch()"
          [disabled]="isLoading() || !cityInput().trim()"
        >
          @if (isLoading()) {
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          Recherche... } @else {
          <i class="fas fa-search me-2"></i>
          Rechercher }
        </button>
      </div>
      @if (error()) {
      <div class="text-danger small mt-1">
        <i class="fas fa-exclamation-triangle me-1"></i>
        {{ error() }}
      </div>
      }
    </form>
  </div>
  `,
})
export class WeatherSearch {
  readonly cityInput = signal<string>('');
  readonly error = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);

  readonly weatherFound = output<WeatherDisplay>();
  readonly loadingChange = output<boolean>();
  readonly errorChange = output<string | null>();

  private readonly weatherService = inject(WeatherService);

  onCityInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.cityInput.set(target.value);
    this.error.set(null);
  }

  onSearch(): void {
    const city = this.cityInput().trim();

    if (!city) {
      this.error.set('Veuillez entrer une ville');
      this.errorChange.emit('Veuillez entrer une ville');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.loadingChange.emit(true);
    this.errorChange.emit(null);

    this.weatherService.getWeatherData({ type: 'city', city }).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.loadingChange.emit(false);
        this.weatherFound.emit(data);
      },
      error: (error) => {
        const errorMessage = `Erreur: ${error.message || 'Ville non trouvée'}`;
        this.error.set(errorMessage);
        this.isLoading.set(false);
        this.loadingChange.emit(false);
        this.errorChange.emit(errorMessage);
      }
    });
  }
}
