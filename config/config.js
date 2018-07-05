const Joi = require('joi');
const mkdirp = require('mkdirp');
const path = require('path');

require('dotenv').config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test'])
    .default('development'),
  USER_AGENT: Joi.string().default('Mozilla/5.0')
}).unknown().required();

const {error, value: envVars} = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  userAgent: envVars.USER_AGENT,
  dateFormat: 'YYYY-MM-DD',
  recordsDirectory: path.resolve('data/records'),
  noDrawDatesFilepath: path.resolve('data/no-draw-dates.json')
};

mkdirp.sync(config.recordsDirectory);

module.exports = config;
