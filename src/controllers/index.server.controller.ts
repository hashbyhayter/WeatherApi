import { Request, Response } from 'express';
import WeatherWorld from 'weather-world';
import { database }  from '../database/index';

export default class IndexController {
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

  public msg(req: Request, res: Response): void {
    res.json({ msg: 'Hello!' })
  }
}