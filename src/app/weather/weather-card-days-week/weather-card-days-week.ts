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
