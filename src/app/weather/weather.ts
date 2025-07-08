import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { DayForecast, WeatherDisplay } from '../models/weather.interface';
import { WeatherCardDay } from "./weather-card-day/weather-card-day";
import { WeatherCardDaysWeek } from './weather-card-days-week/weather-card-days-week';

@Component({
  selector: 'app-weather-day',
  imports: [CommonModule, WeatherCardDay, WeatherCardDaysWeek],
  template: `
@if (error()) {
<div class="container mb-3">
  <div class="alert alert-warning text-center" role="alert">
    <i class="fas fa-exclamation-triangle me-2"></i>
    {{ error() }}
  </div>
</div>
} @if (isLoading() && !weather()) {
<div class="container d-flex justify-content-center">
  <div class="card shadow-lg" style="max-width: 600px; width: 100%">
    <div class="card-body text-center py-5">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <p class="text-muted">
        Récupération des données météo...
      </p>
    </div>
  </div>
</div>
}

<div class="container-fluid px-4 mb-4">
  <div class="row justify-content-center">
    <div class="col-12 col-lg-10 col-xl-8">
      <app-weather-card-day 
        [weather]="weather()" 
        (clearWeather)="clearWeather.emit()" 
        (useLocation)="useLocation.emit()" 
      />
    </div>
  </div>
</div>

@if (weather()) {
  <app-weather-card-days-week [forecasts]="forecasts()" />
}

  `,
})
export class WeatherDay {
  // Inputs simples
  readonly weather = input<WeatherDisplay | null>(null);
  readonly forecasts = input<DayForecast[]>([]);
  readonly error = input<string | null>(null);
  readonly isLoading = input<boolean>(false);

  // Outputs pour communiquer avec le parent
  readonly clearWeather = output<void>();
  readonly useLocation = output<void>();
}
