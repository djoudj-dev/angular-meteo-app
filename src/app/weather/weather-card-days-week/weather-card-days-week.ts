import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { DayForecast } from '../../models/weather.interface';

@Component({
  selector: 'app-weather-card-days-week',
  imports: [CommonModule],
  templateUrl: './weather-card-days-week.html'
})
export class WeatherCardDaysWeek {
  readonly forecasts = input<DayForecast[]>([]);

  getIconColor(fontAwesomeIcon: string): string {
    if (fontAwesomeIcon.includes('sun')) return '#ffc107';
    if (fontAwesomeIcon.includes('cloud') && !fontAwesomeIcon.includes('rain')) return '#17a2b8';
    if (fontAwesomeIcon.includes('rain')) return '#007bff';
    if (fontAwesomeIcon.includes('moon')) return '#6c757d';
    if (fontAwesomeIcon.includes('bolt')) return '#dc3545';
    if (fontAwesomeIcon.includes('snowflake')) return '#e3f2fd';
    if (fontAwesomeIcon.includes('smog') || fontAwesomeIcon.includes('wind')) return '#6c757d';
    return '#ffc107';
  }
}
