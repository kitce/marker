import mkdirp from 'mkdirp';
import path from 'path';

const config = {
  dateFormat: 'YYYY-MM-DD',
  recordsDirectory: path.resolve('data/records'),
  noDrawDatesFilepath: path.resolve('data/no-draw-dates.json')
};

mkdirp.sync(config.recordsDirectory);

export default config;
