import { Express } from 'express'
import WeatherWorld from '../weather-world';
import IndexController from '../controllers/index.server.controller'
import Weather from '../libs/weather';
import IndexValidator from '../validators';

export default class IndexRoute {
  constructor(app: Express) {
    let api = new WeatherWorld();
    let weatherLib = new Weather(api);
    let validator = new IndexValidator();
    let indexController = new IndexController(weatherLib, validator);
    app.get('/weather/:postcode', indexController.weather)
  }
}
