'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const combine = require('stream-combiner2').obj;
const include = require("posthtml-include");
const fileinclude = require('gulp-file-include');
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

module.exports = function (options) {
  return function () {
    return gulp.src(options.src)
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(
        plugins.if(
          !isDevelopment,
          combine(
            plugins.replace(options.cssFileName + '.css', options.cssFileName + '.min.css'),
            plugins.replace(options.dev + '/images/svg/' + options.spriteName, options.build + '/images/svg/' + options.spriteName),
            plugins.replace(options.jsName + '.js', options.jsName + '.min.js')
          )
        )
      )
      .pipe(plugins.htmlhint({
        "tagname-lowercase": [
          "feOffset",
          "feGaussianBlur",
          "feColorMatrix",
        ],
        "attr-lowercase": [
          "viewBox",
          "preserveAspectRatio",
          "filterUnits",
          "stdDeviation",
        ],
      }))
      .pipe(plugins.htmlhint.reporter())
      .pipe(plugins.posthtml([
        include()
      ]))
      .pipe(gulp.dest(plugins.if(!isDevelopment, options.build, options.dev)));
  };
};
