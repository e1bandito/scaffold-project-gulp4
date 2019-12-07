'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var server = require('browser-sync').create();
var rigger = require('gulp-rigger');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var del = require('del');
var gcmq = require('gulp-group-css-media-queries');
var babel = require('gulp-babel');


// Автопрефиксы и минификация стилей
gulp.task('style', function(done) {
  gulp.src('src/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gcmq())
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
    done()
});

// Минификация js
gulp.task('js', function() {
  return gulp.src(['src/js/*.js', '!js/**/*.min.js'])
    .pipe(rigger())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/js'));
});


// html
gulp.task('html', function () {
  return gulp.src('src/*.html')
    .pipe(rigger())
    .pipe(gulp.dest('build'));
});


// Оптимизация изображений
gulp.task('images', function () {
  return gulp.src('src/img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest('src/img'));
});


// Конвертация в webp
gulp.task('webp', function () {
  return gulp.src('src/img/**/*.{png,jpg}')
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest('src/img'));
});


// Очиска build
gulp.task('clean', function () {
  return del('build');
});

// Копирование в build
gulp.task('copy', function () {
  return gulp.src([
    'src/fonts/**/*.{eot,svg,ttf,woff,woff2}',
    'src/img/**',
    'src/*.html',
  ], {
    base: 'src/'
  })
  .pipe(gulp.dest('build'));
});

// Watcher
gulp.task('serve', function() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch('src/sass/**/*.scss', gulp.series('style'));
  gulp.watch('src/js/**', gulp.series('js')).on('change', server.reload);
  gulp.watch('src/*.html', gulp.series('html')).on('change', server.reload);
});

// Сборка в build
gulp.task('build', gulp.series('clean', 'copy', 'style', 'js'));
