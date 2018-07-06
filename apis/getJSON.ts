import axios from 'axios';
import Promise from 'bluebird';
import ms from 'ms';
import {Cache} from 'memory-cache';
import hash from 'object-hash';
import pRetry from 'p-retry';
import {stringify} from 'querystring';
import config from '../config/config';
import {host} from '../constants/hkjc';

const debug = require('debug')('marker:api:getJSON');

/**
 * Typings
 */
export namespace GetJSON {
  type CommaSeparatedNumber = string; // number separated by comma between each 3 digits

  enum Snowball {
    Yes = 1, // snowball draws only
    No = 0 // all draws
  }

  export interface Query {
    sd: string, // start date, YYYYMMDD
    ed: string, // end date, YYYYMMDD
    sb?: Snowball
  }

  export interface Record {
    id: string; // draw number
    date: string; // draw date, DD/MM/YYYY
    no: string; // 6 draw result numbers separated by "+"
    sno: string; // special number
    sbcode: string; // snowball code
    sbnameE: string; // snowball name in English
    sbnameC: string; // snowball name in Chinese (Traditional)
    inv: CommaSeparatedNumber; // total turnover
    // prizes
    p1: CommaSeparatedNumber;
    p1u: CommaSeparatedNumber;
    p2: CommaSeparatedNumber;
    p2u: CommaSeparatedNumber;
    p3: CommaSeparatedNumber;
    p3u: CommaSeparatedNumber;
    p4: CommaSeparatedNumber;
    p4u: CommaSeparatedNumber;
    p5: CommaSeparatedNumber;
    p5u: CommaSeparatedNumber;
    p6: CommaSeparatedNumber;
    p6u: CommaSeparatedNumber;
    p7: CommaSeparatedNumber;
    p7u: CommaSeparatedNumber;
  }
}

const cache = new Cache();

/**
 * Request MarkSix records JSON
 * @public
 */
export default (query: GetJSON.Query): Promise<GetJSON.Record[]> => {
  const _query = getQuery(query);
  debug(_query);
  const queryHash = hash(query);
  const cached = <GetJSON.Record[]>cache.get(queryHash);
  if (cached) {
    debug('cache found', queryHash);
    return Promise.resolve(cached);
  }
  const url = getURL(_query);
  const request = {
    headers: {
      'User-Agent': config.userAgent,
      'Accept-Encoding': 'gzip, deflate'
    }
  };
  const retry = {
    retries: 5,
    factor: 1.2,
    minTimeout: ms('1 second'),
    maxTimeout: ms('5 seconds'),
    onFailedAttempt (err: any) {
      console.warn(
        'Failed to fetch JSON\n' +
        `Error : ${err.message}\n` +
        `URL : ${url}\n` +
        `Attempts : ${err.attemptNumber}/${this.retries}`
      );
    }
  };
  debug('fetching', url);
  const fetch = () => axios.get(url, request);
  const attempt = pRetry(fetch, retry);
  return Promise.resolve(attempt)
    .then(res => res.data)
    .tap(data => putCache(queryHash, data));
};

/**
 * Get the request URL
 *
 * @private
 * @param {GetJSON.Query} query The query object
 * @returns {string}
 */
function getURL (query: GetJSON.Query): string {
  const url = `${host}/marksix/getJSON.aspx`;
  const _query = stringify(query);
  return `${url}?${_query}`;
}

/**
 * Get the query object with default query options
 *
 * @param {GetJSON.Query} query The query object
 * @private
 */
function getQuery (query: GetJSON.Query): GetJSON.Query {
  const defaults = {
    sb: 0
  };
  return {
    ...defaults,
    ...query
  };
}

/**
 * Cache the records for a period of time (30 seconds)
 * @private
 */
function putCache (queryHash: string, records: GetJSON.Record[]): void {
  const time = ms('30 seconds');
  cache.put(queryHash, records, time);
  debug('cached', queryHash);
}
