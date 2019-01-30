import Bluebird from 'bluebird';
import Debug from 'debug';
import find from 'lodash/find';
import {Cache} from 'memory-cache';
import ms from 'ms';
import hash from 'object-hash';
import puppeteer, {Response} from 'puppeteer';
import {URL, URLSearchParams} from 'url';
import {host} from '../constants/hkjc';

const debug = Debug('marker:api:getJSON');

/**
 * Typings
 */
type CommaSeparatedNumber = string; // number separated by comma between each 3 digits

enum Snowball {
  Yes = 1, // snowball draws only
  No = 0 // all draws
}

export interface IQuery {
  sd: string; // start date, YYYYMMDD
  ed: string; // end date, YYYYMMDD
  sb?: Snowball;
}

export interface IRecord {
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

const baseURL = `${host}/marksix/getJSON.aspx`;
const cache = new Cache();

/**
 * Request MarkSix records JSON
 *
 * @public
 * @param {*} query The query object
 * @returns {Bluebird<IRecord[]>}
 */
export default (query: any): Bluebird<IRecord[]> => {
  const _query = getQuery(query);
  const queryHash = hash(_query);
  const cached = cache.get(queryHash) as IRecord[];
  if (cached) {
    debug('cache found', queryHash);
    return Bluebird.resolve(cached);
  }

  return new Bluebird(async (resolve, reject) => {
    const url = getURL(_query);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    debug('fetching', url);
    await page.goto(url);
    page.on('response', async (response: Response) => {
      const request = response.request();
      const status = response.status();
      const method = request.method();
      if (method === 'GET' && status !== 302) {
        const cookies = await page.cookies();
        const botMitigationCookie = find(cookies, ({name}) => name.startsWith('BotMitigationCookie'));
        if (botMitigationCookie) {
          try {
            const records = await response.json() as IRecord[];
            putCache(queryHash, records);
            resolve(records);
          } catch (err) {
            resolve([]);
          }
          await browser.close();
        }
      }
    });
    page.on('error', reject);
  });
};

/**
 * Get the request URL
 *
 * @private
 * @param {IQuery} query The query object
 * @returns {string}
 */
function getURL (query: IQuery): string {
  const url = new URL(baseURL);
  const urlSearchParams = new URLSearchParams(query as any);
  url.search = urlSearchParams.toString();
  return url.href;
}

/**
 * Get the query object with default query options
 *
 * @private
 * @param {*} query The query object
 * @returns {IQuery}
 */
function getQuery (query: any): IQuery {
  const defaults = {
    sb: Snowball.No
  };
  return {
    ...defaults,
    ...query
  };
}

/**
 * Cache the records for a period of time (30 seconds)
 *
 * @private
 * @param {string} queryHash
 * @param {IRecord[]} records
 */
function putCache (queryHash: string, records: IRecord[]): void {
  const time = ms('30 seconds');
  cache.put(queryHash, records, time);
  debug('cached', queryHash);
}
