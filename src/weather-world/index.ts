import axios from 'axios';
import { API_KEY_WEATHERWORLD } from '../var/config';

interface WeatherData {
    description: string,
    temperature: number,
    date: Date
}

export default class WeatherWorld {
  public getWeatherData(location: string, from: Date, to: Date): Promise<WeatherData[]> {
    return axios.get(
        'http://api.worldweatheronline.com/premium/v1/past-weather.ashx',
         this.getRequestDetails(location, from, to))
         .then((response) => {
             return response.data.data.weather
             .map((weather): WeatherData[] => ([
                weather.hourly.map((hourly): WeatherData => ({
                    description: hourly.weatherDesc[0].value,
                    temperature: hourly.tempC,
                    date: new Date(new Date(weather.date).setHours((hourly.time/100)))
                }))
             ]))
             .reduce((acc: WeatherData[], cur: WeatherData[][]) => ([...acc, ...(cur[0])]), []);
         })
         .catch((err) => console.error(err));
  }

  private getRequestDetails = (location: string, from: Date, to: Date) => ({
      params: {
          key: API_KEY_WEATHERWORLD,
          q: location,
          date: `${from.getFullYear()}-${this.addLeadingZeros(from.getMonth() + 1)}-${this.addLeadingZeros(from.getDate())}`,
          enddate: `${to.getFullYear()}-${this.addLeadingZeros(to.getMonth() + 1)}-${this.addLeadingZeros(to.getDate())}`,
          format: 'json'
        }
    });

  private addLeadingZeros = (number: number) => number.toString().padStart(2, '0');
}