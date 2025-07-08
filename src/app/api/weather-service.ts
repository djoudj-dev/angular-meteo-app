import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ForecastItem, ForecastResponse, WeatherResponse } from '../models/weather-api.interface';
import { DayForecast, WeatherDisplay } from '../models/weather.interface';

export type LocationParams = 
  | { type: 'city'; city: string }
  | { type: 'coordinates'; lat: number; lon: number };

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly API_KEY = environment.API_KEY;

  getWeatherData(location: LocationParams): Observable<WeatherDisplay> {
    const params = this.buildParams(location);
    const isCurrentLocation = location.type === 'coordinates';
    
    return this.http.get<WeatherResponse>(`${this.apiUrl}/weather`, { params })
      .pipe(
        map((response: WeatherResponse) => this.mapWeatherResponse(response, isCurrentLocation)),
        catchError(this.handleError)
      );
  }

  getForecastData(location: LocationParams): Observable<DayForecast[]> {
    const params = this.buildParams(location);
    
    return this.http.get<ForecastResponse>(`${this.apiUrl}/forecast`, { params })
      .pipe(
        map((response: ForecastResponse) => this.mapForecastResponse(response)),
        catchError(this.handleError)
      );
  }

  getWeatherByCity(city: string): Observable<WeatherDisplay> {
    return this.getWeatherData({ type: 'city', city });
  }

  getWeatherByCoordinates(lat: number, lon: number): Observable<WeatherDisplay> {
    return this.getWeatherData({ type: 'coordinates', lat, lon });
  }

  getForecastByCity(city: string): Observable<DayForecast[]> {
    return this.getForecastData({ type: 'city', city });
  }

  getForecastByCoordinates(lat: number, lon: number): Observable<DayForecast[]> {
    return this.getForecastData({ type: 'coordinates', lat, lon });
  }

  private buildParams(location: LocationParams): HttpParams {
    let params = new HttpParams()
      .set('appid', this.API_KEY)
      .set('units', 'metric')
      .set('lang', 'fr');

    if (location.type === 'city') {
      params = params.set('q', location.city);
    } else {
      params = params
        .set('lat', location.lat.toString())
        .set('lon', location.lon.toString());
    }

    return params;
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur lors de l\'appel à l\'API météo:', error);
    
    let errorMessage = 'Une erreur est survenue lors de la récupération des données météo.';
    
    if (error.status === 404) {
      errorMessage = 'Ville non trouvée. Veuillez vérifier l\'orthographe.';
    } else if (error.status === 401) {
      errorMessage = 'Clé API invalide.';
    } else if (error.status === 429) {
      errorMessage = 'Limite d\'appels API atteinte. Veuillez réessayer plus tard.';
    } else if (error.status === 0) {
      errorMessage = 'Pas de connexion internet.';
    }

    return throwError(() => new Error(errorMessage));
  }

  private mapWeatherResponse(response: WeatherResponse, isCurrentLocation: boolean = false): WeatherDisplay {
    return {
      name: response.name,
      temperature: Math.round(response.main.temp),
      description: response.weather[0].description,
      humidity: response.main.humidity,
      windSpeed: response.wind.speed,
      icon: response.weather[0].icon,
      fontAwesomeIcon: this.getWeatherIcon(response.weather[0].main, response.weather[0].icon),
      country: response.sys.country,
      isCurrentLocation
    };
  }

  private mapForecastResponse(response: ForecastResponse): DayForecast[] {
    const dailyForecasts = new Map<string, ForecastItem[]>();
    const today = new Date().toISOString().split('T')[0];
    
    response.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (dateKey === today) return;
      
      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, []);
      }
      dailyForecasts.get(dateKey)!.push(item);
    });

    const result: DayForecast[] = [];
    let count = 0;
    
    for (const [dateKey, forecasts] of dailyForecasts) {
      if (count >= 5) break;
      
      const midDayForecast = this.findMidDayForecast(forecasts);
      
      const date = new Date(dateKey);
      const dayName = this.getDayName(count, date);
      
      result.push({
        date: dateKey,
        dayName,
        temperature: Math.round(midDayForecast.main.temp),
        tempMin: Math.round(Math.min(...forecasts.map(f => f.main.temp_min))),
        tempMax: Math.round(Math.max(...forecasts.map(f => f.main.temp_max))),
        description: midDayForecast.weather[0].description,
        icon: midDayForecast.weather[0].icon,
        fontAwesomeIcon: this.getWeatherIcon(midDayForecast.weather[0].main, midDayForecast.weather[0].icon),
        humidity: midDayForecast.main.humidity,
        windSpeed: midDayForecast.wind.speed,
        precipitation: Math.round(midDayForecast.pop * 100)
      });
      
      count++;
    }
    
    return result;
  }

  private findMidDayForecast(forecasts: ForecastItem[]): ForecastItem {
    return forecasts.find(f => {
      const hour = new Date(f.dt * 1000).getHours();
      return hour >= 11 && hour <= 13;
    }) || forecasts[0];
  }

  private getDayName(index: number, date: Date): string {
    if (index === 0) return 'Demain';
    
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return dayNames[date.getDay()];
  }

  private getWeatherIcon(weatherMain: string, icon: string): string {
    const isDay = icon.includes('d');
    
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return isDay ? 'fas fa-sun' : 'fas fa-moon';
      case 'clouds':
        return icon.includes('04') ? 'fas fa-cloud' : 'fas fa-cloud-sun';
      case 'rain':
        return 'fas fa-cloud-rain';
      case 'drizzle':
        return 'fas fa-cloud-rain';
      case 'thunderstorm':
        return 'fas fa-bolt';
      case 'snow':
        return 'fas fa-snowflake';
      case 'mist':
      case 'fog':
      case 'haze':
        return 'fas fa-smog';
      case 'dust':
      case 'sand':
        return 'fas fa-wind';
      default:
        return isDay ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}
