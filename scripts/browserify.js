const Promise = require('bluebird');
const Browserify = require('browserify');
const fs = require('fs');
const _ = require('lodash');
const UglifyJS = require('uglify-es');
const hkjc = require('../config/hkjc');

const writeFileAsync = Promise.promisify(fs.writeFile);

const helpers = _.map(hkjc.helpers, (helper, name) => (
  uglify(browserify(helper.source), helper.browserified)
  .then(() => console.info(name, 'success', helper.browserified))
  .catch(err => console.error(name, 'failed', err))
));

Promise.all(helpers)
       .then(() => console.info('finished'));

/**
 * Helper functions
 */
/**
 * Browserify
 * @private
 * @param {String} source - the file path of the source file
 * @return {Stream.Readable} the readable stream of the browserified JS string
 */
function browserify (source) {
  const browserification = Browserify();
  browserification.add(source);
  return browserification.bundle();
}

/**
 * Uglify the file
 * @private
 * @param {Stream.Readable} readable - the readable stream of the browserified JS string
 * @param {String} destination - the destination of the uglified file
 * @return {Promise} it resolves `undefined` if everything works fine, otherwise, reject the error
 */
function uglify (readable, destination) {
  return new Promise((resolve, reject) => {
    let code = '';
    readable.on('data', chunk => code += chunk);
    readable.on('end', () => {
      const result = UglifyJS.minify(code);
      if (result.error) return reject(result.error);
      writeFileAsync(destination, result.code)
      .then(resolve)
      .catch(reject);
    });
  });
}
