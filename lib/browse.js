const Nightmare = require('nightmare');

/**
 * Wrapper function for nightmare
 * @param {String} url - The URL to be browsed
 * @param {Object} [options] - {browserWindow, nightmare}
 * @param {Object} [options.browserWindow] - The options to be passed to Nightmare constructor (https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions)
 * @param {Object} [options.nightmare] - The nightmare options
 * @param {Object} [options.nightmare.events] - Nightmare page events (https://github.com/segmentio/nightmare#onevent-callback)
 * @param {Function[]} [options.nightmare.events.console] - Array of console event listeners
 * @param {Function[]} [options.nightmare.events.page] - Array of page event listeners
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
  const browserWindowOptions = options.browserWindow;
  const nightmareOptions = getNightmareOptions(options.nightmare);
  const nightmare = Nightmare(browserWindowOptions);
  const {events} = nightmareOptions;
  const types = ['page', 'console'];
  for (const type of types) {
    for (const listener of events[type]) {
      nightmare.on(type, listener);
    }
  }
  nightmare.goto(url);
  return nightmare;
};

/**
 * Helper functions
 */
function getNightmareOptions (options = {}) {
  const defaults = {
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
