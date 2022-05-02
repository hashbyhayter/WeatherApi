import WeatherWorld, { WeatherData } from 'weather-world';
import { database }  from '../database/index';

interface locationIdRecord
{
  locationID: number;
}

interface weatherRecord
{
  WeatherID: number;
  LocationID: number[];
  date: Date;
  temperature: number;
  description: string;
  postcode: string;
}

export default class Weather {
  constructor (private api: WeatherWorld) {
  }

  public getWeather = (postcode: string, start: Date, end: Date): Promise<WeatherData[]> => {
    let dayInMilliSeconds = 1000 * 3600 * 24;
    let searchEnd = new Date(end.getTime() + dayInMilliSeconds - 1000);
    let promise = new Promise<WeatherData[]>((resolve)=> {
        database('locations').where({
            postcode
          })
          .select<locationIdRecord[]>('locationID')
          .then((locationRecords) => {
            if(locationRecords.length > 0) {
              database('weather')
                .innerJoin('locations', 'locations.locationID', 'weather.locationID')
                .where({ postcode: 'BS16UW' })
                .whereBetween('date', [start, searchEnd])
                .orderBy('date', "asc")
                .select<weatherRecord[]>('*')
                .then((results) => {
                  let mapDatabaseResults = results.map((x): WeatherData => ({
                      date: x.date,
                      temperature: x.temperature,
                      description: x.description
                  }));
      
                  if(results.length === this.getExpectedNumberOfRecords(start, end)) {
                    resolve(mapDatabaseResults);
                  } else {
                    this.api.getWeatherData(postcode, start, end)
                      .then((weatherData) => {
                        let filteredResults = weatherData.filter((x) => (mapDatabaseResults.find((y) => y.date.getTime() === x.date.getTime()) === undefined));
                        let mappedResults = filteredResults.map((x) => ({...x, locationID: locationRecords[0].locationID}));
                        database('weather').insert(mappedResults).then(() => {
                            resolve(weatherData);
                        });
                      });
                  }
                });
            } else {
              this.api.getWeatherData(postcode, start, end)
              .then((weatherData) => {
                database('locations')
                  .returning('locationID')
                  .insert<locationIdRecord[]>({ postcode }).then((y) => {
                    let locationID: number = y[0].locationID;
                    let mappedResults = weatherData.map((x) => ({...x, locationID}));
                    database('weather').insert(mappedResults).then(() => {
                        resolve(weatherData);
                    });
                  });
              });
            }
          });
    });
    return promise;
  }

  private getExpectedNumberOfRecords(start: Date, end: Date){
    let dayInMilliSeconds = 1000 * 3600 * 24;
    let endDate = new Date(end.getTime() + dayInMilliSeconds);
    let numDays = ((endDate.getTime() - start.getTime()) / dayInMilliSeconds);
    let expectedNumberOfRecords = numDays * 8;
    return expectedNumberOfRecords;
  }
}