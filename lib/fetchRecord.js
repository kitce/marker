const find = require('lodash/find');
const toNumber = require('lodash/toNumber');
const moment = require('moment');
const getJSON = require('../apis/getJSON');
const config = require('../config/config');

const debug = require('debug')('marker:lib:fetchRecord');

const urlDateFormat = 'YYYYMMDD';
const dataDateFormat = 'DD/MM/YYYY';

const history = []; // cached query date ranges

module.exports = async (date) => {
  const query = getQuery(date);
  const entries = await getJSON(query);
  const formattedDate = date.format(dataDateFormat);
  const entry = find(entries, ({date}) => formattedDate === date);
  if (entry) return normalize(entry);
};

/**
 * Helper functions
 */
/**
 * Get query by date
 * @param {Moment} date
 * @returns {Object} {sd : <String>, ed : <String>}
 */
function getQuery (date) {
  const {start, end} = getDateRange(date);
  return {
    sd: start.format(urlDateFormat),
    ed: end.format(urlDateFormat)
  };
}

/**
 * Get query date range, cache it if the range is new
 * @param {Moment} date
 * @returns {Object} {start : <Moment>, end : <Moment>}
 */
function getDateRange (date) {
  const cached = find(history, ({start, end}) => {
    return date.isSameOrAfter(start) && date.isSameOrBefore(end);
  });
  if (cached) return cached;
  // although the API allows to query more than 3 months of records
  // it is better to follow what the official site says :
  // "Choose a search period of 3 months or less."
  const end = date.clone().add(3, 'months');
  const entry = {start: date, end};
  history.push(entry);
  return entry;
}

/**
 * Normalize requested data entry into ready-to-save MarkSix object
 * @private
 * @param {Object} entry
 * @return {Object}
 */
function normalize (entry) {
  const {date, id, no, sno} = entry;
  return {
    date: moment(date, dataDateFormat).format(config.dateFormat),
    id,
    numbers: no.split('+').map(toNumber),
    special: toNumber(sno)
  };
}
