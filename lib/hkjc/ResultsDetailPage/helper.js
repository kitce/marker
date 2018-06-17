const toNumber = require('lodash/toNumber');
const trim = require('lodash/trim');

/**
 * Extract the Mark Six data from the page
 * @return {Object} the Mark Six data
 */
window.getData = (dateFormat) => {
  const $mainTable = $('#mainTable');
  const drawDate = $mainTable.find('td.content:contains("Draw Date")').eq(1).text().match(/\d{2}\/\d{2}\/\d{4}/)[0];
  const number = $mainTable.find('td.content:contains("Draw Number")').eq(1).text().match(/\d+\/\d+/)[0];
  const $drawResults = $mainTable.find('td.content:not(:contains("Draw Results")) img');
  const $numbers = $drawResults.slice(0, 6);
  const $extra = $drawResults.slice(6);
  const date = moment(drawDate, dateFormat).format('YYYY-MM-DD');
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
};

/**
 * Check whether the result exists or not
 * @return {Boolean}
 */
window.hasResult = () => {
  const text = trim($('#oddsTable').text());
  return text !== 'No Information';
};

/**
 * Helper functions
 */
/**
 * Get the number from the image element
 * @private
 * @param {(Element|jQuery)} image - The image element
 * @return {Number}
 */
function getNumber (image) {
  const src = $(image).attr('src');
  const number = src.match(/no_(\d+)\.gif/)[1];
  return toNumber(number);
}
