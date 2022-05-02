import { Request, Response } from 'express';
import Weather from 'libs/weather';

export default class IndexController {
  dateFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
  constructor (private lib: Weather) {
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
    let now = new Date();
    let latestDate = new Date(`${now.getFullYear()}-${this.addLeadingZeros(now.getMonth()+1)}-${this.addLeadingZeros(now.getDate())}`);

    if (start > end){
      res.status(400).send('Start date can not be after date.');
      return;
    }

    if (start < earliestDate){
      res.status(400).send(`Start date can not be before 2008-07-01 ${latestDate.toDateString()}`);
      return;
    }

    if (end > latestDate){
      res.status(400).send(`End date can not be after ${latestDate.toDateString()}`);
      return;
    }

    this.lib.getWeather(req.params.postcode, start, end).then((weatherData) => {
      res.status(200).send(weatherData);
    });
  }

  private addLeadingZeros = (number: number) => number.toString().padStart(2, '0');
}