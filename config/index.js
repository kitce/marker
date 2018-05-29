const path = require('path');
const hkjc = require('./hkjc');

// Load .env into process.env
const dotenv = require('dotenv').config();

if (dotenv.error) throw dotenv.error;

const {
  NODE_ENV,
  SHOW_NIGHTMARE,
  STANDARD_DATE_FORMAT,
  RECORDS_DIRECTORY,
  UNAVAILABLE_DATES_FILEPATH,
  FIRST_MARK_SIX_DATE
} = process.env;

if (!NODE_ENV) throw new Error('NODE_ENV must be set');

module.exports = {
  env : NODE_ENV,
  hkjc,
  nightmare : {
    show : SHOW_NIGHTMARE === 'true'
  },
  standardDateFormat : STANDARD_DATE_FORMAT,
  recordsDir : path.resolve(RECORDS_DIRECTORY),
  unavailableDatesFilePath : path.resolve(UNAVAILABLE_DATES_FILEPATH),
  firstMarkSixDate : FIRST_MARK_SIX_DATE,
  files : {
    jquery : './node_modules/jquery/dist/jquery.min.js',
    lodash : './node_modules/lodash/lodash.min.js',
    moment : './node_modules/moment/min/moment.min.js'
  }
};
