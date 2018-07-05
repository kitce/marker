const _ = require('lodash');
const MarkSix = require('../models/mark-six.model');

(async () => {
  try {
    const markSixes = await MarkSix.findAll();
    const stats = {
      total: markSixes.length,
      numbers: [],
      special: [],
      notInLast10: []
    };
    // overall occurrence
    _.each(markSixes, (markSix) => {
      // drawn numbers
      _.each(markSix.numbers, number => accumulate(stats.numbers, number));
      // special numbers
      accumulate(stats.special, markSix.special);
    });
    stats.numbers = _.sortBy(stats.numbers, 'count').reverse();
    stats.special = _.sortBy(stats.special, 'count').reverse();
    // percentage
    const calculatePercentage = (stat) => {
      const percentage = _.floor(stat.count / stats.total, 3);
      return {...stat, percentage};
    };
    stats.numbers = _.map(stats.numbers, calculatePercentage);
    stats.special = _.map(stats.special, calculatePercentage);
    // last 10 records
    const numbers = _
      .chain(markSixes)
      .sortBy('date')
      .takeRight(10)
      .flatMap(markSix => markSix.numbers)
      .uniq()
      .value();
    for (let i = 1; i <= 49; i++) {
      if (_.indexOf(numbers, i) < 0) {
        stats.notInLast10.push(i);
      }
    }
    console.log(stats);
  } catch (err) {
    console.error(err);
  }
})();

/**
 * Helper functions
 */
function accumulate (array, number) {
  const stat = _.find(array, {number}) || {number, count: 0};
  if (stat.count === 0) array.push(stat);
  stat.count++;
}
