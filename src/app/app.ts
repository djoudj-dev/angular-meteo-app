import { Component, inject, OnInit, signal } from '@angular/core';
import { GeolocationService } from './api/geolocation-service';
import { WeatherService } from './api/weather-service';
import { DayForecast, WeatherDisplay } from './models/weather.interface';
import { WeatherDay } from "./weather/weather";
import { WeatherSearch } from './weather/weather-search/weather-search';

@Component({
  selector: 'app-root',
  imports: [WeatherDay, WeatherSearch],
  templateUrl: './app.html'
})
export class App implements OnInit {

  readonly weather = signal<WeatherDisplay | null>(null);
  readonly forecasts = signal<DayForecast[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly isLocationWeather = signal<boolean>(false);

  private readonly weatherService = inject(WeatherService);
  private readonly geolocationService = inject(GeolocationService);

  ngOnInit(): void {
    this.loadWeatherByLocation();
  }


  onWeatherFound(weather: WeatherDisplay): void {
    this.weather.set(weather);
    this.error.set(null);
    this.isLocationWeather.set(false);

    const cityName = `${weather.name},${weather.country}`;
    this.weatherService.getForecastData({ type: 'city', city: cityName }).subscribe({
      next: (forecasts) => {
        this.forecasts.set(forecasts);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des prévisions:', error);
      }
    });
  }

  onLoadingChange(loading: boolean): void {
    this.isLoading.set(loading);
  }

  onErrorChange(error: string | null): void {
    this.error.set(error);
    if (error) {
      this.weather.set(null);
    }
  }

  clearWeather(): void {
    this.weather.set(null);
    this.forecasts.set([]);
    this.error.set(null);
    this.isLocationWeather.set(false);
  }

  loadWeatherByLocation(): void {
    if (!this.geolocationService.isGeolocationSupported()) {
      this.error.set('Géolocalisation non supportée par ce navigateur');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.isLocationWeather.set(true);

    this.geolocationService.getCurrentPosition().subscribe({
      next: (position) => {
        this.weatherService.getWeatherByCoordinates(position.latitude, position.longitude).subscribe({
          next: (weather) => {
            this.weather.set(weather);
            this.isLoading.set(false);
          },
          error: (error) => {
            this.error.set(`Erreur météo: ${error.message}`);
            this.isLoading.set(false);
            this.isLocationWeather.set(false);
          }
        });

        this.weatherService.getForecastByCoordinates(position.latitude, position.longitude).subscribe({
          next: (forecasts) => {
            this.forecasts.set(forecasts);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des prévisions:', error);
          }
        });
      },
      error: (error) => {
        this.error.set(error.message);
        this.isLoading.set(false);
        this.isLocationWeather.set(false);
      }
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR');
  }
}
