const config = require('../config');
const Nightmare = require('nightmare');

/**
 * Wrapper function for nightmare
 * @param {String} url - The URL to be browsed
 * @param {Object} [options] - {browserWindow, nightmare}
 *                             {Object} [browserWindow] - The options to be passed to Nightmare constructor (https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions)
 *                             {Object} [nightmare] - Available options :
 *                                                    {Boolean} [jQuery] - Inject jQuery, default : true
 *                                                    {Boolean} [lodash] - Inject lodash, default : false
 *                                                    {Boolean} [moment] - Inject lodash, default : false
 *                                                    {Object} [events] - Nightmare page events (https://github.com/segmentio/nightmare#onevent-callback)
 *                                                                        Available options :
 *                                                                        {Array<Function>} [console] - Array of console event listeners
 *                                                                        {Array<Function>} [page] - Array of page event listeners
 *
 * @return {Nightmare} - The nightmare instance
 *
 * @example
 * Browse Google homepage, show the window, not to inject jQuery
 * and listen to window.alert, console.log, console.error
 *
 * browse('https://www.google.com', {
 *   browserWindow : {
 *     show : true // Display browser window for debug purpose
 *   },
 *   nightmare : {
 *     jQuery : false,
 *     events : {
 *       page : [
 *         (type, message) => {
 *           if (type === 'alert') {
 *             console.log('alert triggered', message)
 *           }
 *         }
 *       ],
 *       console : [
 *         (type, ...args) => {
 *           if (type === 'log') {
 *             console.log('console.log triggered', ...args);
 *           }
 *           if (type === 'error') {
 *             console.log('console.error triggered', ...args);
 *           }
 *         }
 *       ]
 *     }
 *   }
 * });
 */
module.exports = (url, options = {}) => {
  const browserWindowOptions = getBrowserWindowOptions(options.browserWindow);
  const nightmareOptions = getNightmareOptions(options.nightmare);
  const nightmare = Nightmare(browserWindowOptions);
  const eventTypes = ['page', 'console'];
  for (const type of eventTypes) {
    for (const listener of nightmareOptions.events[type]) {
      nightmare.on(type, listener);
    }
  }
  nightmare.goto(url);
  if (nightmareOptions.jQuery) nightmare.inject('js', config.files.jquery);
  if (nightmareOptions.lodash) nightmare.inject('js', config.files.lodash);
  if (nightmareOptions.moment) nightmare.inject('js', config.files.moment);
  return nightmare;
};

/**
 * Helper functions
 */
function getBrowserWindowOptions (options = {}) {
  const defaults = {
    show : config.nightmare.show
  };
  return {
    ...defaults,
    ...options
  };
}

function getNightmareOptions (options = {}) {
  const defaults = {
    jQuery : true,
    lodash : false,
    moment : false,
    events : {
      page : [],
      console : []
    }
  };
  const events = options.events || {};
  return {
    ...defaults,
    ...options,
    events : {
      ...defaults.events,
      ...events
    }
  };
}
