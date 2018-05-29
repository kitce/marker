const _ = require('lodash');
const MarkSix = require('../../models/mark-six.model');

module.exports = async () => {
  const stats = {numDraws : 0, numbers : [], extra : [], notInLast10 : []};
  const markSixes = await MarkSix.findAll();
  const _markSixes = _.sortBy(markSixes, 'date');
  stats.numDraws = _markSixes.length;
  // overall occurrence
  _.each(_markSixes, (markSix) => {
    // drawn numbers
    _.each(markSix.result.numbers, number => accumulate(stats.numbers, number));
    // extra numbers
    accumulate(stats.extra, markSix.result.extra);
  });
  stats.numbers = _.sortBy(stats.numbers, 'count').reverse();
  stats.extra = _.sortBy(stats.extra, 'count').reverse();
  // percentage
  const calculatePercentage = (stat) => {
    const percentage = _.floor(stat.count / stats.numDraws, 3);
    return {...stat, percentage};
  };
  stats.numbers = _.map(stats.numbers, calculatePercentage);
  stats.extra = _.map(stats.extra, calculatePercentage);
  // last 10 records
  const last10 = _.takeRight(_markSixes, 10);
  const numbers = _.chain(last10)
    .flatMap(markSix => markSix.result.numbers)
    .uniq()
    .value();
  for (let i = 1; i <= 49; i++) {
    if (_.indexOf(numbers, i) < 0) {
      stats.notInLast10.push(i);
    }
  }
  return stats;
};

/**
 * Helper functions
 */
function accumulate (array, number) {
  const stat = _.find(array, {number}) || {number, count : 0};
  if (stat.count === 0) array.push(stat);
  stat.count++;
}
