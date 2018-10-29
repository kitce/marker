import Bluebird from 'bluebird';
import {readdir, readFile, writeFile} from 'fs';
import _ from 'lodash';
import path from 'path';
import config from '../config/config';

const readdirAsync: any = Bluebird.promisify(readdir);
const readFileAsync: any = Bluebird.promisify(readFile);
const writeFileAsync: any = Bluebird.promisify(writeFile);

export interface IMarkSix {
  date: string;
  id: string;
  numbers: number[];
  special: number;
}

class MarkSix implements IMarkSix {
  date: string;
  id: string;
  numbers: number[];
  special: number;

  constructor (date: string, id: string, numbers: number[], special: number) {
    this.date = date;
    this.id = id;
    this.numbers = numbers;
    this.special = special;
  }

  /**
   * Find all stored records
   *
   * @static
   * @returns {Bluebird<MarkSix[]>}
   * @memberof MarkSix
   */
  static findAll (): Bluebird<MarkSix[]> {
    return readdirAsync(config.recordsDirectory)
      .map((filename: string) => this.get(filename));
  }

  /**
   * Get the stored record by filename
   *
   * @private
   * @static
   * @param {string} filename
   * @returns {Bluebird<MarkSix>}
   * @memberof MarkSix
   */
  private static get (filename: string): Bluebird<MarkSix> {
    const filePath = getFilePath(filename);
    return readFileAsync(filePath)
      .then((json: string) => JSON.parse(json))
      .then((data: IMarkSix) => this.init(data));
  }

  /**
   * Initialize the record into an instance
   *
   * @static
   * @param {IMarkSix} data
   * @returns {MarkSix}
   * @memberof MarkSix
   */
  static init (data: IMarkSix): MarkSix {
    const {date, id, numbers, special} = data;
    return new this(date, id, numbers, special);
  }

  /**
   * Get the default filename
   *
   * @readonly
   * @type {string}
   * @memberof MarkSix
   */
  get filename (): string {
    return `${this.date}.json`;
  }

  /**
   * Get the absolute file path
   *
   * @readonly
   * @type {string}
   * @memberof MarkSix
   */
  get filePath (): string {
    return getFilePath(this.filename);
  }

  /**
   * Get the JSON string
   *
   * @readonly
   * @type {string}
   * @memberof MarkSix
   */
  get json (): string {
    return JSON.stringify(this, null, 2);
  }

  /**
   * Save the record to file system
   *
   * @returns {this}
   * @memberof MarkSix
   */
  save (): this {
    this.presave();
    return writeFileAsync(this.filePath, this.json)
      .then(() => this);
  }

  /**
   * Do something before saving
   *
   * @private
   * @returns {this}
   * @memberof MarkSix
   */
  private presave (): this {
    this.validate();
    this.sort();
    return this;
  }

  /**
   * Sort the numbers
   *
   * @private
   * @returns {this}
   * @memberof MarkSix
   */
  private sort (): this {
    const comparator = (a: number, b: number) => (a - b);
    this.numbers = this.numbers.sort(comparator);
    return this;
  }

  /**
   * Validate the record
   *
   * @private
   * @returns {this}
   * @memberof MarkSix
   */
  private validate (): this {
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
 * Get the absolute file path of a record
 * @private
 */
function getFilePath (filename: string): string {
  return path.join(config.recordsDirectory, filename);
}

export default MarkSix;
