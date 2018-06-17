const path = require('path');
const querystring = require('querystring');
const hkjc = require('../../../constants/hkjc');
const browse = require('../../browse');

const dateFormat = 'DD/MM/YYYY';
const url = `${hkjc.host}/marksix/Results_Detail.aspx`;

/**
 * Browse the results detail page and extract the result
 * @param {Moment} date - the date of Mark Six to be fetched
 * @return {Promise<(Object|null)>}
 */
module.exports = (date) => {
  const url = getURL(date);
  const jQuery = path.resolve('node_modules', 'jquery/dist/jquery.min.js');
  const moment = path.resolve('node_modules', 'moment/min/moment.min.js');
  const helper = path.resolve(__dirname, 'helper.min.js');
  return browse(url)
  .inject('js', jQuery)
  .inject('js', moment)
  .inject('js', helper)
  .evaluate(extract, dateFormat)
  .end();
};

/**
 * Helper functions
 */
/**
 * Extract the result from the page
 * @private
 * @param {String} dateFormat
 * @return {(Object|null)}
 */
function extract (dateFormat) {
  // in browser scope
  if (window.hasResult()) {
    return window.getData(dateFormat);
  }
  return null;
}

/**
 * Get the results detail page URL
 * @private
 * @param {Moment} date
 * @return {String}
 */
function getURL (date) {
  const query = {
    lang : 'EN',
    date : date.format(dateFormat)
  };
  const _query = querystring.unescape(querystring.stringify(query));
  return `${url}?${_query}`;
}
