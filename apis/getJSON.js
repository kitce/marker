const axios = require('axios');
const Promise = require('bluebird');
const ms = require('ms');
const {Cache} = require('memory-cache');
const hash = require('object-hash');
const pRetry = require('p-retry');
const querystring = require('querystring');
const config = require('../config/config');
const {host} = require('../constants/hkjc');

const debug = require('debug')('marker:api:getJSON');

const cache = new Cache();
const cacheTTL = ms('30 seconds');

/**
 * Request MarkSix records JSON
 * @param {Object} query
 * @param {String} query.sd - Start date (YYYYMMDD)
 * @param {String} query.ed - End date (YYYYMMDD)
 * @param {Number} [query.sb = 0] - 1 : snowball, 0 : all, default : 0
 * @returns {Promise<Object>}
 */
module.exports = (query) => {
  const _query = getQuery(query);
  debug(_query);
  const queryHash = hash(query);
  const cached = cache.get(queryHash);
  if (cached) {
    debug('cache found', queryHash);
    return Promise.resolve(cached);
  }
  const url = getURL(_query);
  const request = {
    headers: {
      'User-Agent': config.userAgent,
      'Accept-Encoding': 'gzip, deflate'
    }
  };
  const retry = {
    factor: 1.2, // default : 2
    retries: 5, // maximum number of times to retry the operation
    minTimeout: ms('1 second'), // minimum delay for the first retry, will be multiply by the 'factor' option
    maxTimeout: ms('5 seconds'), // maximum delay between two retries
    onFailedAttempt (err) {
      console.warn(
        'Failed to fetch JSON\n' +
        `Error : ${err.message}\n` +
        `URL : ${url}\n` +
        `Attempts : ${err.attemptNumber}/${this.retries}`
      );
    }
  };
  debug('fetching', url);
  const fetch = () => axios.get(url, request);
  const attempt = pRetry(fetch, retry);
  return Promise.resolve(attempt)
    .then(res => res.data)
    .tap(cacheData(queryHash));
};

/**
 * Helper functions
 */
function getURL (query) {
  const url = `${host}/marksix/getJSON.aspx`;
  const _query = querystring.stringify(query);
  return `${url}?${_query}`;
}

function getQuery (query = {}) {
  const defaults = {
    sb: 0
  };
  return {
    ...defaults,
    ...query
  };
}

function cacheData (queryHash) {
  return (data) => {
    cache.put(queryHash, data, cacheTTL);
    debug('cached', queryHash);
  };
}
