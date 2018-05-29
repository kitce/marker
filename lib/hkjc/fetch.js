const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const config = require('../../config');
const MarkSix = require('../../models/mark-six.model');
const fetchMarkSix = require('./ResultsDetailPage/fetchMarkSix');

const readdirAsync = Promise.promisify(fs.readdir);
const readFileAsync = Promise.promisify(fs.readFile);
const writeFileAsync = Promise.promisify(fs.writeFile);

module.exports = async () => {
  const unavailableDates = await getUnavailableDates();
  const missingDates = await getMissingDates(unavailableDates);
  const fetch = async (date) => {
    const data = await fetchMarkSix(date);
    if (data) {
      const markSix = MarkSix.init(data);
      const _markSix = await markSix.save();
      console.log(`${_markSix.date}, saved ${_markSix.number} to ${markSix.filename}`);
      return _markSix;
    } else {
      const displayDate = date.format(config.standardDateFormat);
      console.log(`${displayDate}, no draw`);
      addUnavailableDate(unavailableDates, date);
      await saveUnavailableDates(unavailableDates);
    }
  };
  return Promise.mapSeries(missingDates, fetch)
                .then(_.compact);
};

/**
 * Helper functions
 */
/**
 * Get all known unavailable dates
 * @private
 * @return {Promise} it resolves <Array<Moment>>
 */
function getUnavailableDates () {
  const parse = (json) => {
    const dates = JSON.parse(json);
    return _.map(dates, date => moment(date));
  };
  const error = (err) => {
    // return empty array if not found
    if (err.code === 'ENOENT') return [];
    throw err;
  };
  return readFileAsync(config.unavailableDatesFilePath)
  .then(parse)
  .catch(error);
}

/**
 * Get the dates of non fetched Mark Six, excluding the known unavailable dates
 * @private
 * @param {Array<Moment>} unavailableDates
 * @return {Array<Moment>}
 */
async function getMissingDates (unavailableDates) {
  const start = moment(config.firstMarkSixDate, config.standardDateFormat);
  const end = moment().startOf('day');
  const fetchedDates = await getFetchedDates();
  const unwanted = _.concat(unavailableDates, fetchedDates);
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
 * @return {Promise} it resolves <Array<Moment>>
 */
function getFetchedDates () {
  return readdirAsync(config.recordsDir)
  .map(filename => MarkSix.get(filename))
  .map(markSix => moment(markSix.date, config.standardDateFormat));
}

/**
 * Add the date to the unavailable dates list
 * @private
 * @param {Array<Moment>} dates
 * @param {Moment} date
 */
function addUnavailableDate (dates, date) {
  const _date = _.find(dates, _date => _date.isSame(date));
  if (!_date) dates.push(date);
}

/**
 * Save the unavailable dates list to file
 * @private
 * @param {Array<Moment>} dates
 * @return {Promise} it resolves nothing
 */
function saveUnavailableDates (dates) {
  const _dates = _.map(dates, date => date.format(config.standardDateFormat));
  const json = JSON.stringify(_dates, null, 2);
  return writeFileAsync(config.unavailableDatesFilePath, json);
}
