const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const config = require('../../config/config');
const MarkSix = require('../../models/mark-six.model');
const fetchMarkSix = require('./ResultsDetailPage/fetchMarkSix');

const readdirAsync = Promise.promisify(fs.readdir);
const readFileAsync = Promise.promisify(fs.readFile);
const writeFileAsync = Promise.promisify(fs.writeFile);

/**
 * Fetch and save the mark six records
 * @return {Promise<MarkSix[]>}
 */
module.exports = async () => {
  const noDrawDates = await getNoDrawDates();
  const missingDates = await getMissingDates(noDrawDates);
  const fetch = async (date) => {
    const data = await fetchMarkSix(date);
    if (data) {
      const markSix = MarkSix.init(data);
      const _markSix = await markSix.save();
      console.log(`${_markSix.date}, saved ${_markSix.number} to ${markSix.filename}`);
      return _markSix;
    } else {
      const displayDate = date.format(config.dateFormat);
      console.log(`${displayDate}, no draw`);
      const dates = addDate(noDrawDates, date);
      await saveNoDrawDates(dates);
      console.log('updated no draw dates list');
    }
  };
  return Promise.mapSeries(missingDates, fetch)
                .then(_.compact);
};

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
 * @param {Array<Moment>} noDrawDates
 * @return {Array<Moment>}
 */
async function getMissingDates (noDrawDates) {
  const start = moment('1993-01-05', config.dateFormat);
  const end = moment().startOf('day');
  const fetchedDates = await getFetchedDates();
  const unwanted = _.concat(noDrawDates, fetchedDates);
  const datesSinceFirstDraw = getDatesBetween(start, end);
  const comparator = date => date.unix();
  return _.differenceBy(datesSinceFirstDraw, unwanted, comparator);
}

/**
 * Get the dates between given start date and end date inclusively
 * @private
 * @param {Moment} start
 * @param {Moment} end
 * @return {Array<Moment>}
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
 * @private
 * @param {Moment[]} dates
 * @param {Moment} date
 * @return {Moment[]} dates
 */
function addDate (dates, date) {
  const _date = _.find(dates, _date => _date.isSame(date));
  if (!_date) return _.concat(dates, date);
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
