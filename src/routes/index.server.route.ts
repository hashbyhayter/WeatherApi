import { Express } from 'express'
import WeatherWorld from '../weather-world';
import IndexController from '../controllers/index.server.controller'

export default class IndexRoute {
  constructor(app: Express) {
    let api = new WeatherWorld();
    let indexController = new IndexController(api);
    app.get('/', indexController.index)
    app.get('/weather/:postcode', indexController.weather)
    app.get('/msg', indexController.msg)
  }
}
