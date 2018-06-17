const browserify = require('browserify');
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const composer = require('gulp-uglify/composer');
const uglifyES = require('uglify-es');

const plugins = gulpLoadPlugins();

// use uglify-es for ES6+ support
const uglify = composer(uglifyES, console);

const files = {
  helpers : ['./**/helper.js'],
  packages : ['node_modules/**']
};

// build helper files
gulp.task('browserify', () => (
  gulp.src([...files.helpers, ...ignore(files.packages)], {read : false}) // no need of reading file because browserify does
      // transform file objects using gulp-tap plugin
      .pipe(plugins.tap((file) => {
        // replace file contents with browserify's bundle stream
        file.contents = browserify(file.path, {debug : true}).bundle(); // eslint-disable-line no-param-reassign
      }))
      // transform streaming contents into buffer contents
      // because gulp-sourcemaps does not support streaming contents
      .pipe(plugins.buffer())
      .pipe(plugins.sourcemaps.init())
      .pipe(uglify())
      .pipe(plugins.rename((path) => {
        path.basename += '.min'; // eslint-disable-line no-param-reassign
      }))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest('.'))
));

/**
 * Helper functions
 */
function ignore (paths) {
  return paths.map(path => `!${path}`);
}
