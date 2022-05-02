import { Express } from 'express'
import WeatherWorld from '../weather-world';
import IndexController from '../controllers/index.server.controller'
import Weather from '../libs/weather';

export default class IndexRoute {
  constructor(app: Express) {
    let api = new WeatherWorld();
    let weatherLib = new Weather(api);
    let indexController = new IndexController(weatherLib);
    app.get('/weather/:postcode', indexController.weather)
  }
}
