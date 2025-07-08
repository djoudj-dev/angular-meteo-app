import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { DayForecast, ForecastItem, ForecastResponse, WeatherDisplay, WeatherResponse } from '../models/weather.interface';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly API_KEY = environment.API_KEY;

  getWeatherData(city: string): Observable<WeatherDisplay> {
    const params = new HttpParams()
      .set('q', city)
      .set('appid', this.API_KEY)
      .set('units', 'metric')
      .set('lang', 'fr');
    
    return this.http.get<WeatherResponse>(`${this.apiUrl}/weather`, { params })
      .pipe(
        map((response: WeatherResponse) => this.mapWeatherResponse(response, false)),
        catchError(error => {
          throw error;
        })
      );
  }

  getWeatherByCoordinates(lat: number, lon: number): Observable<WeatherDisplay> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('appid', this.API_KEY)
      .set('units', 'metric')
      .set('lang', 'fr');
    
    return this.http.get<WeatherResponse>(`${this.apiUrl}/weather`, { params })
      .pipe(
        map((response: WeatherResponse) => this.mapWeatherResponse(response, true)),
        catchError(error => {
          throw error;
        })
      );
  }

  getForecastData(city: string): Observable<DayForecast[]> {
    const params = new HttpParams()
      .set('q', city)
      .set('appid', this.API_KEY)
      .set('units', 'metric')
      .set('lang', 'fr');
    
    return this.http.get<ForecastResponse>(`${this.apiUrl}/forecast`, { params })
      .pipe(
        map((response: ForecastResponse) => this.mapForecastResponse(response)),
        catchError(error => {
          throw error;
        })
      );
  }

  getForecastByCoordinates(lat: number, lon: number): Observable<DayForecast[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('appid', this.API_KEY)
      .set('units', 'metric')
      .set('lang', 'fr');
    
    return this.http.get<ForecastResponse>(`${this.apiUrl}/forecast`, { params })
      .pipe(
        map((response: ForecastResponse) => this.mapForecastResponse(response)),
        catchError(error => {
          throw error;
        })
      );
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
    // Grouper les prévisions par jour (l'API retourne des données toutes les 3h)
    const dailyForecasts = new Map<string, ForecastItem[]>();
    const today = new Date().toISOString().split('T')[0]; // Date d'aujourd'hui
    
    response.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      // Exclure les prévisions d'aujourd'hui
      if (dateKey === today) return;
      
      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, []);
      }
      dailyForecasts.get(dateKey)!.push(item);
    });

    // Convertir en format d'affichage (prendre les 5 premiers jours à partir de demain)
    const result: DayForecast[] = [];
    let count = 0;
    
    for (const [dateKey, forecasts] of dailyForecasts) {
      if (count >= 5) break;
      
      // Prendre la prévision du milieu de journée (vers 12h) ou la première disponible
      const midDayForecast = forecasts.find(f => {
        const hour = new Date(f.dt * 1000).getHours();
        return hour >= 11 && hour <= 13;
      }) || forecasts[0];

      const date = new Date(dateKey);
      const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      
      result.push({
        date: dateKey,
        dayName: count === 0 ? 'Demain' : dayNames[date.getDay()],
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

  // Mapping des codes météo vers des icônes FontAwesome
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
