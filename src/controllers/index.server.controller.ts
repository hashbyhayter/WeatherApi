import { Request, Response } from 'express';
import { database }  from '../database/index';

export default class IndexController {
  public index(req: Request, res: Response, next: Function): void {
    database('locations').where({
      postcode: 'BS16UW'
    }).select('postcode').first().then(x => {
      res.render('index', { title: x.postcode });
    });
  }

  public msg(req: Request, res: Response): void {
    res.json({ msg: 'Hello!' })
  }
}

export const indexController = new IndexController()
