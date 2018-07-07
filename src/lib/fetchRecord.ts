import Debug from 'debug';
import find from 'lodash/find';
import toNumber from 'lodash/toNumber';
import moment, {Moment} from 'moment';
import getJSON, {IQuery, IRecord} from '../apis/getJSON';
import config from '../config/config';
import {IMarkSix} from '../models/mark-six.model';

const debug = Debug('marker:lib:fetchRecord');

const urlDateFormat = 'YYYYMMDD';
const dataDateFormat = 'DD/MM/YYYY';

interface IDateRange {
  start: Moment;
  end: Moment;
}

const dateRanges: IDateRange[] = []; // cached query date ranges

export default async (date: Moment): Promise<IMarkSix | undefined> => {
  const query = getQuery(date);
  const entries = await getJSON(query);
  const _date = date.format(dataDateFormat);
  const entry = find(entries, ({date}) => _date === date);
  if (entry) return normalize(entry);
};

/**
 * Get query by date
 * @private
 */
function getQuery (date: Moment): IQuery {
  const {start, end} = getDateRange(date);
  return {
    sd: start.format(urlDateFormat),
    ed: end.format(urlDateFormat)
  };
}

/**
 * Get date range for query,
 * cache it if the range is new
 * @private
 */
function getDateRange (date: Moment): IDateRange {
  const cached = find(dateRanges, ({start, end}) => {
    return date.isSameOrAfter(start) && date.isSameOrBefore(end);
  });
  if (cached) return cached;
  // although the API allows to query more than 3 months of records
  // it is better to follow what the official site says :
  // "Choose a search period of 3 months or less."
  const end = date.clone().add(3, 'months');
  const entry = {start: date, end};
  dateRanges.push(entry);
  return entry;
}

/**
 * Normalize requested record into ready-to-save MarkSix object
 * @private
 */
function normalize (record: IRecord): IMarkSix {
  const {date, id, no, sno} = record;
  return {
    date: moment(date, dataDateFormat).format(config.dateFormat),
    id,
    numbers: no.split('+').map(toNumber),
    special: toNumber(sno)
  };
}
