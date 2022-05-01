import { Request, Response } from 'express';
import WeatherWorld from 'weather-world';
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

    this.api.getWeatherData(req.params.postcode, start, end)
      .then((x) => {
        res.status(200).send(x);
      });
  }

  public msg(req: Request, res: Response): void {
    res.json({ msg: 'Hello!' })
  }
}