//TODO: refactor using this https://github.com/cferdinandi/gulp-boilerplate
/**
 * Settings
 * Turn on/off build features
 */

var settings = {
  clean: true,
  scripts: true,
  polyfills: true,
  styles: true,
  svgs: true,
  copy: true,
  reload: true
};


/**
 * Template for banner to add to file headers
 */

var banner = {
  full:
    '/*!\n' +
    ' * <%= package.name %> v<%= package.version %>\n' +
    ' * <%= package.description %>\n' +
    ' * (c) ' + new Date().getFullYear() + ' <%= package.author.name %>\n' +
    ' * <%= package.license %> License\n' +
    ' * <%= package.repository.url %>\n' +
    ' */\n\n',
  min:
    '/*!' +
    ' <%= package.name %> v<%= package.version %>' +
    ' | (c) ' + new Date().getFullYear() + ' <%= package.author.name %>' +
    ' | <%= package.license %> License' +
    ' | <%= package.repository.url %>' +
    ' */\n'
};


/**
 * Gulp Packages
 */

// General
var { gulp, src, dest, watch, series, parallel } = require('gulp');
var del = require('del');
var flatmap = require('gulp-flatmap');
var lazypipe = require('lazypipe');
var rename = require('gulp-rename');
var header = require('gulp-header');
var package = require('./package.json');

// Scripts
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var optimizejs = require('gulp-optimize-js');

// Styles
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minify = require('gulp-cssnano');

// SVGs
var svgmin = require('gulp-svgmin');

// BrowserSync
var browserSync = require('browser-sync');

// old
var cleanCSS = require('gulp-clean-css');
var pkg = require('./package.json');
var htmlmin = require('gulp-htmlmin');

gulp.task('vendor', gulp.parallel(
  function vendor() {

    // Bootstrap
    gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
      .pipe(gulp.dest('./vendor/bootstrap'))

    // Font Awesome
    gulp.src([
      './node_modules/font-awesome/**/*',
      '!./node_modules/font-awesome/{less,less/*}',
      '!./node_modules/font-awesome/{scss,scss/*}',
      '!./node_modules/font-awesome/.*',
      '!./node_modules/font-awesome/*.{txt,json,md}'
    ])
      .pipe(gulp.dest('./vendor/font-awesome'))

    // jQuery
    gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
      .pipe(gulp.dest('./vendor/jquery'))

    // jQuery Easing
    gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
      .pipe(gulp.dest('./vendor/jquery-easing'))

  }));
vendor.description = 'Copy third party libraries from /node_modules into /vendor';
vendor.flags = {
  // '—-prod': 'Builds in production mode (minification, etc).'
};

// Compile SCSS
gulp.task('css:compile', function () {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./css'))
});

// Minify CSS
gulp.task('css:minify', gulp.series(gulp.parallel('css:compile')), function () {
  return gulp.src([
    './css/*.css',
    '!./css/*.min.css'
  ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js:minify', function () {
  return gulp.src([
    './js/*.js',
    '!./js/*.min.js'
  ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', ['js:minify']);

//Minify HTML
gulp.task('html:minify', function () {
  return gulp.src('./index.dev.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true
    }))
    .pipe(rename(('./index.html')))
    .pipe(gulp.dest('.'));
});

//HTML
gulp.task('html', ['html:minify']);

// Default task
gulp.task('default', ['css', 'js', 'html', 'vendor']);

// Configure the browserSync task
gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

// Dev task
gulp.task('dev', ['css', 'js', 'html', 'browserSync'], function () {
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./index.dev.html', ['html']);
  gulp.watch('./index.dev.html', browserSync.reload);
});
