const Joi = require('joi');
const path = require('path');

require('dotenv').config();

const envVarsSchema = Joi.object({
  NODE_ENV : Joi.string()
                .allow(['development', 'production', 'test'])
                .default('development'),
  SHOW_NIGHTMARE : Joi.boolean().default(false),
  USER_AGENT : Joi.string().default('Mozilla/5.0')
}).unknown().required();

const {error, value : envVars} = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env : envVars.NODE_ENV,
  showNightmare : envVars.SHOW_NIGHTMARE,
  userAgent : envVars.USER_AGENT,
  dateFormat : 'YYYY-MM-DD',
  recordsDirectory : path.resolve('data/records'),
  noDrawDatesFilepath : path.resolve('data/no-draw-dates.json')
};

module.exports = config;
