import Bluebird from 'bluebird';
import {readdir, readFile, writeFile} from 'fs';
import {map, concat, differenceBy} from 'lodash';
import find from 'lodash/find';
import moment, {Moment} from 'moment';
import config from '../config/config';
import fetchRecord from '../lib/fetchRecord';
import MarkSix from '../models/mark-six.model';

const debug = require('debug')('marker:script:fetch');

const readdirAsync: any = Bluebird.promisify(readdir);
const readFileAsync: any = Bluebird.promisify(readFile);
const writeFileAsync: any = Bluebird.promisify(writeFile);

(async () => {
  try {
    const noDrawDates = await getNoDrawDates();
    const missingDates = await getMissingDates(noDrawDates);
    const markSixes = [];
    for (let i = 0; i < missingDates.length; i++) {
      const missingDate = missingDates[i];
      const displayDate = missingDate.format(config.dateFormat);
      debug('fetching', displayDate);
      const data = await fetchRecord(missingDate);
      if (!data) {
        console.log(`${displayDate}, no draw`);
        addDate(noDrawDates, missingDate);
        debug('no. of no draw dates :', noDrawDates.length);
        await saveNoDrawDates(noDrawDates);
        debug('updated no draw dates list');
      } else {
        const markSix = await MarkSix.init(data).save();
        console.log(`${markSix.date}, saved ${markSix.id} to ${markSix.filename}`);
        markSixes.push(markSix);
      }
    }
    console.log(`Successfully fetched ${markSixes.length} Mark Six records`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();

/**
 * Helper functions
 */
/**
 * Get all known no draw dates
 * @private
 */
function getNoDrawDates (): Bluebird<Moment[]> {
  const parse = (json: string) => {
    const dates = JSON.parse(json);
    return map(dates, date => moment(date));
  };
  const error = (err: NodeJS.ErrnoException) => {
    // return empty array if not found
    if (err.code === 'ENOENT') return [];
    throw err;
  };
  return readFileAsync(config.noDrawDatesFilepath)
    .then(parse)
    .catch(error);
}

/**
 * Get the dates of non fetched Mark Six, excluding the known no draw dates
 * @private
 */
function getMissingDates (noDrawDates: Moment[]): Bluebird<Moment[]> {
  // 1993-01-05 is the first Mark Six draw
  const start = moment('1993-01-05', config.dateFormat);
  const end = moment().startOf('day');
  return getFetchedDates()
    .then((fetchedDates: Moment[]) => {
      const unwanted = concat(noDrawDates, fetchedDates);
      const datesSinceFirstDraw = getDatesBetween(start, end);
      const comparator = (date: Moment) => date.unix();
      return differenceBy(datesSinceFirstDraw, unwanted, comparator);
    });
}

/**
 * Get an array of the dates between start date and end date inclusively
 * @private
 */
function getDatesBetween (start: Moment, end: Moment): Moment[] {
  const dates = [];
  const date = start.clone();
  while (date.isBefore(end)) {
    dates.push(date.clone());
    date.add(1, 'days');
  }
  return dates;
}

/**
 * Get the list of fetched records' dates
 * @private
 */
function getFetchedDates (): Bluebird<Moment[]> {
  return readdirAsync(config.recordsDirectory)
    .map((filename: string) => {
      const date = filename.split('.')[0];
      return moment(date, config.dateFormat);
    });
}

/**
 * Add the date to the list if not exist
 * *** This method will mutate `dates` ***
 * @private
 */
function addDate (dates: Moment[], date: Moment): Moment[] {
  const _date = find(dates, _date => _date.isSame(date));
  if (!_date) dates.push(date);
  return dates;
}

/**
 * Save the no draw dates list to file
 * @private
 */
function saveNoDrawDates (dates: Moment[]): Bluebird<void> {
  const _dates = map(dates, date => date.format(config.dateFormat));
  const json = JSON.stringify(_dates, null, 2);
  return writeFileAsync(config.noDrawDatesFilepath, json);
}
