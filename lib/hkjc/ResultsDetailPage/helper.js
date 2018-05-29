const toNumber = require('lodash/toNumber');
const trim = require('lodash/trim');
const hkjc = require('../../../config/hkjc');

/**
 * Extract the Mark Six data from the page
 * @return {(Object|undefined)} - The Mark Six data
 */
window.getData = () => {
  if (hasResult()) {
    const $mainTable = $('#mainTable');
    const drawDate = $mainTable.find('td.content:contains("Draw Date")').eq(1).text().match(/\d{2}\/\d{2}\/\d{4}/)[0];
    const number = $mainTable.find('td.content:contains("Draw Number")').eq(1).text().match(/\d+\/\d+/)[0];
    const $drawResults = $mainTable.find('td.content:not(:contains("Draw Results")) img');
    const $numbers = $drawResults.slice(0, 6);
    const $extra = $drawResults.slice(6);
    const date = moment(drawDate, hkjc.dateFormat).format('YYYY-MM-DD');
    const numbers = $numbers.map((index, element) => getNumber(element));
    const extra = getNumber($extra);
    return {
      date,
      number,
      result : {
        numbers,
        extra
      }
    };
  }
};

/**
 * Helper functions
 */
/**
 * Check whether the result exists or not
 * @private
 * @return {Boolean}
 */
function hasResult () {
  const text = trim($('#oddsTable').text());
  return text !== 'No Information';
}

/**
 * Get the number from the image element
 * @private
 * @param {(Element|jQuery)} image - The image element
 * @return {number}
 */
function getNumber (image) {
  const src = $(image).attr('src');
  const number = src.match(/no_(\d+)\.gif/)[1];
  return toNumber(number);
}
