export interface WeatherDisplay {
  name: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  fontAwesomeIcon: string;
  country: string;
  isCurrentLocation?: boolean;
}

export interface DayForecast {
  date: string;
  dayName: string;
  temperature: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  fontAwesomeIcon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}
