import { Request } from 'express';

interface modelState
{
  valid: boolean;
  errors: string[]
}

export default class IndexValidator {
  dateFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

  public validateWeatherRequest = (req: Request): modelState => {
    let valid : modelState = { valid: true, errors: [] };

    if (req.query.start == undefined || req.query.end == undefined) {
        valid.valid = false;
        valid.errors.push('start and end must be set');
        return valid;
    }
    
    if (!this.dateFormat.test(req.query.start.toString()) || !this.dateFormat.test(req.query.end.toString())){
        valid.valid = false;
        valid.errors.push('Incorrect date format used, use yyyy-MM-dd');
        return valid;
    }
    
    let start = new Date(req.query.start.toString());
    let end = new Date(req.query.end.toString());
    let earliestDate = new Date(2008, 6, 1);
    let now = new Date();
    let latestDate = new Date(`${now.getFullYear()}-${this.addLeadingZeros(now.getMonth()+1)}-${this.addLeadingZeros(now.getDate())}`);

    if (start > end){
        valid.valid = false;
        valid.errors.push('Start date can not be after the end date');
    }

    if (start < earliestDate){
        valid.valid = false;
        valid.errors.push(`Start date can not be before ${earliestDate.toDateString()}`);
    }

    if (end > latestDate){
        valid.valid = false;
        valid.errors.push(`End date can not be after ${latestDate.toDateString()}`);
    }

    return valid;
  }

  private addLeadingZeros = (number: number) => number.toString().padStart(2, '0');
}