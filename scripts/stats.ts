import _ from 'lodash';
import MarkSix from '../models/mark-six.model';

interface Accumulation {
  number: number,
  count: number,
  percentage?: number
}

const allNumbers = _.times(49, index => index + 1);

(async () => {
  try {
    const markSixes = await MarkSix.findAll();
    const total = markSixes.length;
    const drawnNumbers = _.flatMap(markSixes, 'numbers');
    const drawnSpecialNumbers = _.map(markSixes, 'special');
    let accumulatedNumbers: Accumulation[] = [];
    let accumulatedSpecialNumbers: Accumulation[] = [];
    // overall occurrence
    _.each(drawnNumbers, (number) => accumulate(accumulatedNumbers, number));
    _.each(drawnSpecialNumbers, (number) => accumulate(accumulatedSpecialNumbers, number));
    accumulatedNumbers = addPercentageAndSort(accumulatedNumbers, total);
    accumulatedSpecialNumbers = addPercentageAndSort(accumulatedSpecialNumbers, total);
    // numbers that do not exist in last 10 draws
    const numbersInLast10 = mapLatestMarkSixesToNumbers(markSixes, 10);
    const numbersNotInLast10 = _.difference(allNumbers, numbersInLast10);
    const stats = {
      total,
      numbers: accumulatedNumbers,
      specials: accumulatedSpecialNumbers,
      numbersNotInLast10
    };
    console.log(stats);
  } catch (err) {
    console.error(err);
  }
})();

/**
 * Helper functions
 */
function accumulate (accumulations: Accumulation[], number: number): void {
  const accumulation = _.find(accumulations, {number}) || {number, count: 0};
  if (accumulation.count === 0) accumulations.push(accumulation);
  accumulation.count++;
}

function addPercentage (total: number): (accumulation: Accumulation) => Accumulation {
  return (accumulation) => {
    const percentage = _.floor(accumulation.count / total, 3);
    return {...accumulation, percentage};
  }
}

function addPercentageAndSort (accumulations: Accumulation[], total: number) {
  return _.chain(accumulations)
    .map(addPercentage(total))
    .sortBy('percentage')
    .reverse()
    .value();
}

function mapLatestMarkSixesToNumbers (markSixes: MarkSix[], quantity: number): number[] {
  return _.chain(markSixes)
    .sortBy('date')
    .takeRight(quantity)
    .flatMap('numbers')
    .uniq()
    .value();
}
