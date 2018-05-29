const config = require('../config');
const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const readdirAsync = Promise.promisify(fs.readdir);
const readFileAsync = Promise.promisify(fs.readFile);
const writeFileAsync = Promise.promisify(fs.writeFile);

class MarkSix {
  constructor (data = {}) {
    this.date = data.date;
    this.number = data.number;
    this.result = data.result;
  }

  static findAll () {
    return readdirAsync(config.recordsDir).map(getMarkSix);
  }

  static init (data) {
    return new this(data);
  }

  get filename () {
    return `${this.date}.json`;
  }

  get filePath () {
    return getFilePath(this.filename);
  }

  presave () {
    this.validate();
    this.sort();
    return this;
  }

  sort () {
    this.result.numbers = _.sortBy(this.result.numbers);
  }

  async save () {
    this.presave();
    const json = JSON.stringify(this, null, 2);
    await writeFileAsync(this.filePath, json);
    return this;
  }

  validate () {
    if (!this.date) throw new Error('missing draw date');
    if (!this.number) throw new Error('missing draw number');
    if (this.result.numbers.length !== 6) {
      throw new Error(`expected 6 numbers but got ${this.result.numbers.length}`);
    }
    if (!(this.result.extra && _.isNumber(this.result.extra))) {
      throw new Error(`extra number should not be ${this.result.extra} (${typeof this.result.extra})`);
    }
    return this;
  }
}

/**
 * Helper functions
 */
/**
 * Get a Mark Six record by a given filename
 * @private
 * @param {String} filename
 * @return {MarkSix}
 */
function getMarkSix (filename) {
  const filePath = getFilePath(filename);
  return readFileAsync(filePath)
  .then(JSON.parse)
  .then(data => MarkSix.init(data));
}

/**
 * Get the record file path
 * @private
 * @param {String} filename
 * @return {String}
 */
function getFilePath (filename) {
  return path.join(config.recordsDir, filename);
}

module.exports = MarkSix;
