import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { WeatherDisplay } from '../../models/weather.interface';

@Component({
  selector: 'app-weather-card-day',
  imports: [CommonModule],
  template: `
  <div class="card shadow-lg w-100 border-0">
    @if (weather()) {
      <div class="card-header bg-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <i class="fas fa-map-marker-alt me-2"></i>
            <div>
              <h5 class="mb-0 fw-bold">{{ weather()!.name }}, {{ weather()!.country }}</h5>
              @if (weather()!.isCurrentLocation) {
                <span class="badge bg-success bg-opacity-75 mt-1">
                  <i class="fas fa-location-dot me-1"></i>
                  Position actuelle
                </span>
              }
            </div>
          </div>
          <div class="d-flex gap-2">
            @if (!weather()!.isCurrentLocation) {
              <button
                class="btn btn-outline-light btn-sm"
                (click)="onUseLocation()"
                title="Utiliser ma position"
              >
                <i class="fas fa-location-crosshairs me-1"></i>
                Ma position
              </button>
            }
          </div>
        </div>
      </div>

      <div class="card-body p-4">
        <div class="row align-items-center mb-4">
          <div class="col-md-4 text-center">
            @if (weather()!.fontAwesomeIcon) {
              <i 
                [class]="weather()!.fontAwesomeIcon"
                [style.color]="getIconColor(weather()!.fontAwesomeIcon)"
                style="font-size: 6rem;"
                [title]="weather()!.description"
              ></i>
            } @else {
              <i class="fas fa-sun text-warning" style="font-size: 6rem;" [title]="weather()!.description"></i>
            }
            <p class="text-muted mb-0 mt-2 text-capitalize fw-medium">
              {{ weather()!.description }}
            </p>
          </div>
          <div class="col-md-8">
            <div class="text-center text-md-start">
              <div class="display-1 fw-bold text-primary mb-2">
                {{ weather()!.temperature }}°C
              </div>
              <p class="text-muted mb-0 fs-5">
                Température actuelle
              </p>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-md-6">
            <div class="d-flex align-items-center p-3 bg-light rounded">
              <div class="text-info me-3">
                <i class="fas fa-tint fa-2x"></i>
              </div>
              <div>
                <div class="fw-bold fs-4">{{ weather()!.humidity }}%</div>
                <small class="text-muted">Humidité</small>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex align-items-center p-3 bg-light rounded">
              <div class="text-success me-3">
                <i class="fas fa-wind fa-2x"></i>
              </div>
              <div>
                <div class="fw-bold fs-4">{{ weather()!.windSpeed }} m/s</div>
                <small class="text-muted">Vitesse du vent</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer bg-light text-center border-0">
        <small class="text-muted">
          <i class="fas fa-clock me-1"></i>
          Dernière mise à jour: {{ getCurrentTime() }}
        </small>
      </div>
    } @else {
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="fas fa-cloud-sun fa-4x text-muted opacity-50"></i>
        </div>
        <h5 class="text-muted mb-3">Aucune donnée météo</h5>
        <p class="text-muted mb-0">
          Recherchez une ville pour afficher la météo
        </p>
      </div>
    }
  </div>
  `,
})
export class WeatherCardDay {
  readonly weather = input<WeatherDisplay | null>(null);
  readonly clearWeather = output<void>();
  readonly useLocation = output<void>();

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR');
  }

  onClearWeather(): void {
    this.clearWeather.emit();
  }

  onUseLocation(): void {
    this.useLocation.emit();
  }

  getIconColor(fontAwesomeIcon: string): string {
    if (fontAwesomeIcon.includes('sun')) return '#ffc107'; // warning/yellow
    if (fontAwesomeIcon.includes('cloud') && !fontAwesomeIcon.includes('rain')) return '#17a2b8'; // info/blue
    if (fontAwesomeIcon.includes('rain')) return '#007bff'; // primary/blue
    if (fontAwesomeIcon.includes('moon')) return '#6c757d'; // secondary/gray
    if (fontAwesomeIcon.includes('bolt')) return '#dc3545'; // danger/red
    if (fontAwesomeIcon.includes('snowflake')) return '#e3f2fd'; // light blue
    if (fontAwesomeIcon.includes('smog') || fontAwesomeIcon.includes('wind')) return '#6c757d'; // muted/gray
    return '#ffc107'; // default yellow
  }
}
