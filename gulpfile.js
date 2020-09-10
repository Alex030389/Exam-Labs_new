'use strict';

const templatesFolder = 'templates';
const sourceFolder = 'src';
const developmentFolder = 'dev';
const buildFolder = 'build';
const svgSpriteName = 'sprite';
const cssFileName = 'style';
const jsFileName = 'all';
const jsModulesFilePath = './' + sourceFolder + '/js/modules/files.json';
const gulp = require('gulp');
const browserSync = require('browser-sync').create();

// Если файл с модулями js существует - рекваерит его.
try {
  var jsModules = require(jsModulesFilePath);
} catch (error) {
  var jsModules = false;
};

// При вызове, рекваерит путь с нужным модулем.
var lazyRequireTask = function (taskName, path, options) {
  options = options || {};
  options.taskName = taskName;
  gulp.task(taskName, function (callback) {
    var task = require(path).call(this, options);
    return task(callback);
  });
};

// Собирает стили из less, и сжимает для прода
lazyRequireTask('style', './tasks/style', {
  src: sourceFolder + '/less/' + cssFileName + '.less',
  dev: developmentFolder,
  build: buildFolder
});

// Из файлов svg для инлайновой вставки делает спрайт и бросает его в папку img. Для прода оптимизирует
lazyRequireTask('sprite:svg', './tasks/sprite-svg', {
  src: sourceFolder + '/images/**/inline*.svg',
  dev: developmentFolder,
  build: buildFolder,
  spriteName: svgSpriteName + '.svg'
});

// Вставляет svg спрайт. Для прода сжимает и меняет адрес css и js
lazyRequireTask('html', './tasks/html', {
  src: [sourceFolder + '/**/*.html', '!' + sourceFolder + '/**/' + templatesFolder + '/**/' + '/*.html'],
  dev: developmentFolder,
  build: buildFolder,
  spriteName: svgSpriteName + '.svg',
  cssFileName: cssFileName,
  jsName: jsFileName
});

// Оптимизирует графику
lazyRequireTask('images', './tasks/images', {
  src: [sourceFolder + '/images/**/*.{jpg,jpeg,png,gif}', sourceFolder + '/images/**/*.svg', '!' + sourceFolder + '/images/**/inline*.svg'],
  srcFolder: sourceFolder,
  dev: developmentFolder,
  build: buildFolder
});

// Конвертирует контентные изображения в webP формат
lazyRequireTask('webp', './tasks/webp', {
  src: sourceFolder + '/images/content/**/*.{jpg,png}',
  srcFolder: sourceFolder,
  dev: developmentFolder,
  build: buildFolder
});

// Склеивает js модули в один all.js, для прода сжимает
lazyRequireTask('scripts:modules', './tasks/scripts-modules', {
  src: jsModules,
  dev: developmentFolder,
  build: buildFolder,
  jsName: jsFileName
});

// Берет все подключаемые js файлы (библиотеки, полифиллы и т.д.) и копирует их. Для прода сжимает
lazyRequireTask('scripts:external', './tasks/scripts-external', {
  src: [
    sourceFolder + '/js/**/*.js',
    '!' + sourceFolder + '/js/modules/**/*.js',
    '!' + sourceFolder + '/js/plugins/**/*.js',
    '!' + sourceFolder + '/js/polyfills/**/*.js'
  ],
  srcFolder: sourceFolder,
  dev: developmentFolder,
  build: buildFolder
});

// Группирует задачи по работе со скриптами
gulp.task('scripts', gulp.parallel('scripts:modules', 'scripts:external'));

// Копирует все файлы из папки files
lazyRequireTask('files:copy', './tasks/files-copy', {
  src: sourceFolder + '/files/**/*.*',
  srcFolder: sourceFolder,
  dev: developmentFolder,
  build: buildFolder
});

// Форматирует шрифты ttf в woff
lazyRequireTask('ttf2woff', './tasks/ttf2woff', {
  src: sourceFolder + '/fonts/**/*.ttf',
  srcFolder: sourceFolder
});

// Форматирует шрифты ttf в woff2
lazyRequireTask('ttf2woff2', './tasks/ttf2woff2', {
  src: sourceFolder + '/fonts/**/*.ttf',
  srcFolder: sourceFolder
});

// Удаляет шрифты ttf из исходников
lazyRequireTask('del:ttf:fonts', './tasks/del-ttf-fonts', {
  src: sourceFolder + '/fonts/**/*.ttf'
});

// Группирует таски. Форматирует шрифты и удаляет исходники
gulp.task('fonts', gulp.series('ttf2woff', 'ttf2woff2', 'del:ttf:fonts'));

// Копирует шрифты
lazyRequireTask('fonts:copy', './tasks/fonts-copy', {
  src: sourceFolder + '/fonts/**/*.{woff,woff2}',
  srcFolder: sourceFolder,
  dev: developmentFolder,
  build: buildFolder
});

// Копирует подключаемые css
lazyRequireTask('css:copy', './tasks/css-copy', {
  src: sourceFolder + '/css/**/*.css',
  srcFolder: sourceFolder,
  dev: developmentFolder,
  build: buildFolder
});

// Удаляет папку dev или build
lazyRequireTask('clean', './tasks/clean', {
  dev: developmentFolder,
  build: buildFolder
});

gulp.task('watch', function () { // Запускает вотчер
	gulp.watch(sourceFolder + '/files/**/*.*', gulp.series('files:copy'));
	gulp.watch(sourceFolder + '/**/*.html', gulp.series('html'));
	gulp.watch(sourceFolder + '/less/**/*.*', gulp.series('style'));
	gulp.watch(sourceFolder + '/css/**/*.css', gulp.series('css:copy'));
	gulp.watch(sourceFolder + '/fonts/**/*.*', gulp.series('fonts', 'fonts:copy'));
	gulp.watch(sourceFolder + '/images/**/inline*.svg', gulp.series('sprite:svg'));
	gulp.watch([sourceFolder + '/images/**/*.*', '!' + sourceFolder + '/images/**/inline*.svg'], gulp.parallel('images', 'webp'));
	gulp.watch(sourceFolder + '/js/modules/**/*.*', gulp.series('scripts:modules'));
	gulp.watch([sourceFolder + '/js/**/*.js', '!' + sourceFolder + '/js/modules/**/*.js'], gulp.series('scripts:external'));
});

gulp.task('serve', function () { // Запускает сервер
	browserSync.init({
    server: developmentFolder,
	});
	browserSync.watch(developmentFolder + '/**/*.*').on('change', browserSync.reload);
});

gulp.task('build', gulp.series(
  'clean',
  'sprite:svg',
  gulp.parallel(
    'style',
    'css:copy',
    'html',
    'images',
    'webp',
    'scripts',
    'fonts:copy',
    'files:copy'
  )
));

gulp.task('dev', gulp.series(
  'build',
  gulp.parallel(
    'watch',
    'serve'
  )
));
