const querystring = require('querystring');
const hkjc = require('../../../config/hkjc');
const browse = require('../../browse');

const url = `${hkjc.host}/marksix/Results_Detail.aspx`;

/**
 * Browse the results detail page and extract the result
 * @param {Moment} date - the date of Mark Six to be fetched
 * @return {Promise} it resolves what returned by extract()
 */
module.exports = (date) => {
  const url = getURL(date);
  const nightmare = browse(url, {nightmare : {moment : true}});
  return nightmare.inject('js', hkjc.helpers.ResultsDetailPage.browserified)
                  .evaluate(extract)
                  .end();
};

/**
 * Helper functions
 */
/**
 * Extract the result from the page
 * @private
 * @return {Object}
 */
function extract () {
  // in browser scope
  return window.getData();
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
    date : date.format(hkjc.dateFormat)
  };
  const _query = querystring.unescape(querystring.stringify(query));
  return `${url}?${_query}`;
}
