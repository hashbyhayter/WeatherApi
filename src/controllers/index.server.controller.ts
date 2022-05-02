import { Request, Response } from 'express';
import WeatherWorld, { WeatherData } from 'weather-world';
import { database }  from '../database/index';

export default class IndexController {
  dateFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
  constructor (private api: WeatherWorld) {
  }

  public index = (req: Request, res: Response, next: Function): void => {
    this.api.getWeatherData('BS16UW', new Date('2021-01-01'), new Date('2021-01-03'))
    .then((x) => {
      console.info(x);
      database('locations').where({
        postcode: 'BS16UW'
      }).select('postcode').first().then(x => {
        res.render('index', { title: x.postcode });
      });
    });
  }

  public weather = (req: Request, res: Response, next: Function): void => {
    if (req.query.start == undefined || req.query.end == undefined){
      res.status(400).send();
      return;
    }
    
    if (!this.dateFormat.test(req.query.start.toString()) || !this.dateFormat.test(req.query.end.toString())){
      res.status(400).send('Incorrect date format used, use yyyy-MM-dd.');
      return;
    }
    
    let start = new Date(req.query.start.toString());
    let end = new Date(req.query.end.toString());
    let earliestDate = new Date(2008, 6, 1);

    if (start > end){
      res.status(400).send('Start date can not be after date.');
      return;
    }

    if (start < earliestDate){
      res.status(400).send('Start date can not be before 2008-07-01');
      return;
    }

    database('locations').where({
      postcode: req.params.postcode
    })
    .select('locationID')
    .then((locationRecords) => {
      if(locationRecords.length > 0) {
        let dayInMilliSeconds = 1000 * 3600 * 24;
        let searchEnd = new Date(end.getTime() + dayInMilliSeconds - 1000);
        database('weather')
          .innerJoin('locations', 'locations.locationID', 'weather.locationID')
          .where({ postcode: 'BS16UW' })
          .whereBetween('date', [start, searchEnd])
          .orderBy('date', "asc")
          .then((results) => {
            let endDate = new Date(end.getTime() + dayInMilliSeconds);
            let numDays = ((endDate.getTime() - start.getTime()) / dayInMilliSeconds);
            let expectedNumberOfRecords = numDays * 8;

            // we have all the records return
            if(results.length === expectedNumberOfRecords) {
              res.status(200).send(results.map((x): WeatherData => ({
                date: x.date,
                temperature: x.temperature,
                description: x.description
              })));
            } else {
              this.api.getWeatherData(req.params.postcode, start, end)
                .then((weatherData) => {
                  let mappedResults = weatherData.map((x) => ({...x, locationID: locationRecords[0].locationID}));
                  database('weather').insert(mappedResults).then(() => {
                    res.status(200).send(weatherData);
                  });
                });
            }
          });
      } else {
        this.api.getWeatherData(req.params.postcode, start, end)
        .then((weatherData) => {
          database('locations')
            .returning('locationID')
            .insert({postcode: req.params.postcode}).then((y: any[]) => {
              let locationID: number = y[0].locationID;
              let mappedResults = weatherData.map((x) => ({...x, locationID}));
              database('weather').insert(mappedResults).then(() => {
                res.status(200).send(weatherData);
              });
            });
        });
      }
    });
  }

  public msg(req: Request, res: Response): void {
    res.json({ msg: 'Hello!' })
  }
}