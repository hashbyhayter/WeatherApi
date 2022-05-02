import { Request, Response } from 'express';
import Weather from 'libs/weather';
import IndexValidator from 'validators';

export default class IndexController {
  constructor (private lib: Weather, private validator: IndexValidator) {
  }

  public weather = (req: Request, res: Response, next: Function): void => {
    let modelValid = this.validator.validateWeatherRequest(req);
    if (!modelValid.valid) {
      res.status(400).send(modelValid.errors.join('\n'));
      return;
    }

    let start = new Date(req.query.start.toString());
    let end = new Date(req.query.end.toString());

    this.lib.getWeather(req.params.postcode, start, end).then((weatherData) => {
      res.status(200).send(weatherData);
    });
  }
}