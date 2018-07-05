const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const config = require('../config/config');

const readdirAsync = Promise.promisify(fs.readdir);
const readFileAsync = Promise.promisify(fs.readFile);
const writeFileAsync = Promise.promisify(fs.writeFile);

class MarkSix {
  constructor (data = {}) {
    this.date = data.date;
    this.id = data.id;
    this.numbers = data.numbers;
    this.special = data.special;
  }

  /**
   * Find all fetched records
   * @static
   * @returns {Promise<MarkSix[]}
   * @memberof MarkSix
   */
  static findAll () {
    return readdirAsync(config.recordsDirectory)
      .map(filename => this.get(filename));
  }

  /**
   * Get a record by filename
   * @static
   * @param {String} filename
   * @return {Promise<MarkSix>}
   * @memberof MarkSix
   */
  static get (filename) {
    const filePath = getFilePath(filename);
    return readFileAsync(filePath)
      .then(JSON.parse)
      .then(data => this.init(data));
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

  get json () {
    return JSON.stringify(this, null, 2);
  }

  presave () {
    this.validate();
    this.sort();
    return this;
  }

  sort () {
    this.numbers = _.sortBy(this.numbers);
  }

  save () {
    this.presave();
    return writeFileAsync(this.filePath, this.json)
      .then(() => this);
  }

  validate () {
    const {date, id, numbers, special} = this;
    if (!date) throw new Error('missing draw date');
    if (!id) throw new Error('missing draw number');
    if (numbers.length !== 6) {
      throw new Error(`expected 6 numbers but got ${numbers.length}`);
    }
    if (!(special && _.isNumber(special))) {
      throw new Error(`special number should not be ${special} (${typeof special})`);
    }
    return this;
  }
}

/**
 * Helper functions
 */
/**
 * Get the record file path
 * @private
 * @param {String} filename
 * @return {String}
 */
function getFilePath (filename) {
  return path.join(config.recordsDirectory, filename);
}

module.exports = MarkSix;
