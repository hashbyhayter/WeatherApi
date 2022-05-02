import { assert } from 'chai'
import { Request } from 'express';
import { after } from 'mocha'
import * as sinon from 'sinon'
import IndexValidator from '../../src/validators'

const mockRequest = (queryData) => {
    return {
        query: { ...queryData },
    };
  };
  

describe('Valdator spec', function() {
    let validator: IndexValidator;
    let now = new Date('2022-05-02');

    beforeEach(() => {
        validator = new IndexValidator();
        sinon.useFakeTimers(now.getTime());
        /*
        sandbox = sinon.sandbox.create();
        clock = sinon.useFakeTimers(now.getTime());
        */
    })

    it('returns false when there are no dates', async () => {
        let request = { query: { start: undefined, end: undefined} } as any as Request;
        let result = validator.validateWeatherRequest(request);
        assert.isFalse(result.valid);
        assert.strictEqual('start and end must be set', result.errors[0]);
    })

    it('returns false when dates are in the wrong format', async () => {
        let request = { query: { start: '01-01-2012', end: '1-4-12'} } as any as Request;
        let result = validator.validateWeatherRequest(request);
        assert.isFalse(result.valid);
        assert.strictEqual('Incorrect date format used, use yyyy-MM-dd', result.errors[0]);
    })

    it('returns false when end date after today', async () => {
        let request = { query: { start: '2022-01-01', end: '2022-06-01'} } as any as Request;
        let result = validator.validateWeatherRequest(request);
        assert.isFalse(result.valid);
        assert.strictEqual('End date can not be after Mon May 02 2022', result.errors[0]);
    })

    it('returns false when start date before earliest date', async () => {
        let request = { query: { start: '2001-01-01', end: '2022-01-01'} } as any as Request;
        let result = validator.validateWeatherRequest(request);
        assert.isFalse(result.valid);
        assert.strictEqual('Start date can not be before Tue Jul 01 2008', result.errors[0]);
    })

    it('returns false when start date if after the end date', async () => {
        let request = { query: { start: '2021-01-03', end: '2021-01-01'} } as any as Request;
        let result = validator.validateWeatherRequest(request);
        assert.isFalse(result.valid);
        assert.strictEqual('Start date can not be after the end date', result.errors[0]);
    })

    it('returns mutliple errors if there is more than one', async () => {
        let request = { query: { start: '2001-01-01', end: '2023-01-01'} } as any as Request;
        let result = validator.validateWeatherRequest(request);
        assert.isFalse(result.valid);
        assert.strictEqual(2, result.errors.length);
        assert.strictEqual('Start date can not be before Tue Jul 01 2008', result.errors[0]);
        assert.strictEqual('End date can not be after Mon May 02 2022', result.errors[1]);
    })

    it('returns true if there are no errors', async () => {
        let request = { query: { start: '2021-01-01', end: '2021-01-02'} } as any as Request;
        let result = validator.validateWeatherRequest(request);
        assert.isTrue(result.valid);
        assert.strictEqual(0, result.errors.length);
    })
})
