'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

module.exports = function (options) {
  return function () {
    return gulp.src(options.src)
      .pipe(plugins.imagemin([
        plugins.imagemin.svgo({
          plugins: [
            {removeViewBox: false}
          ]
        })
      ]))
      .pipe(plugins.cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[width]').removeAttr('width');
          $('[height]').removeAttr('height');
          $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true }
      }))
      .pipe(plugins.replace('&gt;', '>'))
      .pipe(plugins.svgstore({
        inlineSvg: true
      }))
      .pipe(plugins.rename(options.spriteName))
      .pipe(gulp.dest(plugins.if(!isDevelopment, options.build + '/images/svg', options.dev + '/images/svg')));
  };
};
