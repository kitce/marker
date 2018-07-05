const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const config = require('../config/config');
const fetchRecord = require('../lib/fetchRecord');
const MarkSix = require('../models/mark-six.model');

const debug = require('debug')('marker:script:fetch');

const readdirAsync = Promise.promisify(fs.readdir);
const readFileAsync = Promise.promisify(fs.readFile);
const writeFileAsync = Promise.promisify(fs.writeFile);

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
 * @return {Promise<Moment[]>}
 */
function getNoDrawDates () {
  const parse = (json) => {
    const dates = JSON.parse(json);
    return _.map(dates, date => moment(date));
  };
  const error = (err) => {
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
 * @param {Moment[]} noDrawDates
 * @return {Promise<Moment[]>}
 */
function getMissingDates (noDrawDates) {
  // 1993-01-05 is the first Mark Six draw
  const start = moment('1993-01-05', config.dateFormat);
  const end = moment().startOf('day');
  return getFetchedDates()
    .then((fetchedDates) => {
      const unwanted = _.concat(noDrawDates, fetchedDates);
      const datesSinceFirstDraw = getDatesBetween(start, end);
      const comparator = date => date.unix();
      return _.differenceBy(datesSinceFirstDraw, unwanted, comparator);
    });
}

/**
 * Get the dates between given start date and end date inclusively
 * @private
 * @param {Moment} start
 * @param {Moment} end
 * @return {Moment[]}
 */
function getDatesBetween (start, end) {
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
 * @return {Promise<Moment[]>}
 */
function getFetchedDates () {
  return readdirAsync(config.recordsDirectory)
    .map(filename => MarkSix.get(filename))
    .map(markSix => moment(markSix.date, config.dateFormat));
}

/**
 * Add the date to the list if not exist
 * *** This method will mutate `dates` ***
 * @private
 * @param {Moment[]} dates
 * @param {Moment} date
 * @return {Moment[]} `dates`
 */
function addDate (dates, date) {
  const _date = _.find(dates, _date => _date.isSame(date));
  if (!_date) dates.push(date);
  return dates;
}

/**
 * Save the no draw dates list to file
 * @private
 * @param {Moment[]} dates
 * @return {Promise<void>}
 */
function saveNoDrawDates (dates) {
  const _dates = _.map(dates, date => date.format(config.dateFormat));
  const json = JSON.stringify(_dates, null, 2);
  return writeFileAsync(config.noDrawDatesFilepath, json);
}
