'use-strict';
// requires
var gulp = require('gulp');
var del = require('del');
var twig = require('gulp-twig');
var data = require('gulp-data');
var path = require('path');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var autoprefixer = require('autoprefixer');
var csscomb = require('postcss-csscomb');
var flexbugs = require('postcss-flexbugs-fixes');
var base64 = require('gulp-base64');
var combineMq = require('gulp-combine-mq');
var concat = require('gulp-concat');
var size = require('gulp-size');
var jade = require('gulp-jade');
var jadeInheritance = require('gulp-jade-inheritance');
var rename = require('gulp-rename');
var pugLinter = require('gulp-pug-linter');
var changed = require('gulp-changed');
var cached = require('gulp-cached');
var gulpif = require('gulp-if');
var postcss = require('gulp-postcss');
var scsslint = require('gulp-scss-lint');
var plumber = require('gulp-plumber');
var filter = require('gulp-filter');
var runSequence = require('run-sequence');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var reload = browserSync.reload;

// configuration
var paths = {
  source: 'source',
  css: 'source/assets/css',
  scss: 'source/assets/scss',
  js: 'source/assets/js',
  img: 'source/assets/images',
  sprites: 'source/assets/images/sprites',
  fonts: 'source/assets/fonts/**/*',
  content: 'source/content'
};

watch = {
  twig: paths.source + '/**/*.twig',
  jade: paths.source + '/**/*.jade',
  css: paths.css + '/**/*.css',
  scss: paths.scss + '/**/*.scss',
  js: paths.js + '/**/*.js',
  img: paths.img + '/**/*',
  content: paths.content + '/**/*'
};

dest = {
  source: 'html',
  css: 'html/assets/css',
  scss: 'html/assets/css',
  js: 'html/assets/js',
  img: 'html/assets/images',
  fonts: 'html/assets/fonts',
  content: 'html/content'
};

options = {
  imageopt: {
    progressive: true,
    interlaced: true,
    svgoPlugins: [
      {removeViewBox: false},
      {removeUselessStrokeAndFill: false},
      {cleanupIDs: false}
    ]
    // use: [pngquant()]
  }
}

devBuild = true;

// browser sync

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: dest.source
    },
    // https: true,
    // online: true,
    online: false,
    open: false
    // open: 'external'
  });
});

// styles

gulp.task('scss', function() {
  var plugins = [
    autoprefixer({browsers: ['last 5 version']}),
    flexbugs(),
    csscomb('zen')
  ];
  return gulp.src(paths.scss+'/*.*')
    // .pipe(scsslint({'config': '.scss-lint.yml'}))
    .pipe(gulpif(devBuild, sourcemaps.init()))
    .pipe(sassGlob())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(base64({
      baseDir: paths.img,
      extensions: [/#datauri/i]
    }))
    .pipe(gulpif(!devBuild, combineMq({ beautify: true })))
    .pipe(gulpif(!devBuild, postcss(plugins)))
    .pipe(gulpif(devBuild, sourcemaps.write('./')))
    .pipe(gulp.dest(dest.scss))
    .pipe(size({title: 'CSS'}))
    .pipe(reload({stream: true}));
});

gulp.task('css', function() {
  return gulp.src(paths.css+'/**/*.*')
  .pipe(gulp.dest(dest.css))
  .pipe(reload({stream: true}));
});

// twig
gulp.task('twig', function() {
  return gulp.src(paths.source+'/*.twig')
    .pipe(data(function(file){
      try {
        return require('./source/data/' + path.basename(file.path, '.twig') + '.json');
      } catch (err) {
        return;
      }
    }))
    .pipe(twig())
    .pipe(gulp.dest(dest.source));
});

// html

gulp.task('html', function() {
  return gulp.src(paths.source+'/*.html')
    .pipe(gulp.dest(dest.source))
    .pipe();
});

// jade

gulp.task('jade', function() {
  return gulp.src(paths.source+'/**/*.jade')
    .pipe(plumber(function(error){
      gutil.log(error.message);
      this.emit('end');
    }))
    .pipe(changed(dest.source, {extension: '.html'}))
    .pipe(gulpif(global.isWatching, cached('jade')))
    .pipe(debug({title: 'debug-before'}))
    .pipe(jadeInheritance({basedir: paths.source, extension: '.jade', skip: 'node_modules', saveInTempFile: true}))
    .pipe(debug({title: 'debug-after'}))
    .pipe(filter(function(file) {
      return /source[\\\/]pages/.test(file.path);
    }))
    .pipe(debug({title: 'debug-after-filter'}))
    .pipe(data(function(file){
      try {
        return require('./source/pages/' + path.basename(file.path, '.jade') + '.json');
      } catch (err) {
        return;
      }
    }))
    .pipe(jade({
      pretty: true
    }))
    .pipe(rename({dirname: '.'}))
    .pipe(gulp.dest(dest.source))
    .on('end', browserSync.reload);
});

gulp.task('jade:linter', function() {
  return gulp.src(paths.source+'/**/*.jade')
    .pipe(pugLinter())
    .pipe(pugLinter.reporter('fail'))
});

// images

gulp.task('img', function() {
  return gulp.src(paths.img+'/**/*.*')
  .pipe(gulpif(!devBuild, imagemin(options.imageopt)))
  .pipe(gulp.dest(dest.img))
  .pipe(reload({stream: true}));
});

// vendor-js

gulp.task('vendorjs', function() {
  return gulp.src(paths.js+"/vendor/*.js")
    .pipe(gulp.dest(dest.js+"/vendor/"))
    .pipe(reload({stream: true}));
});

// js

gulp.task('userjs', function() {
  return gulp.src(paths.js+"/*.js")
    .pipe(gulp.dest(dest.js))
    .pipe(reload({stream: true}));
});

// content
gulp.task('contents', function() {
  return gulp.src(paths.content+'/**/*.*')
  .pipe(gulp.dest(dest.content))
  .pipe(reload({stream: true}));
});

// fonts
gulp.task('fonts', function() {
  return gulp.src(paths.fonts)
  .pipe(gulp.dest(dest.fonts));
});

// clean

gulp.task('clean', function() {
  return del([
    dest.source
  ]);
});

// watch

gulp.task('setWatch', function() {
  global.isWatching = true;
});

gulp.task('watch', ['setWatch', 'browser-sync', 'jade'], function() {
  gulp.watch(watch.css, ['css']);
  gulp.watch(['source/blocks/**/*.scss', 'source/assets/scss/**/*.scss'], ['scss']);
  gulp.watch(watch.js, ['vendorjs', 'userjs']);
  gulp.watch(watch.img, ['img']);
  gulp.watch(watch.fonts, ['fonts']);
  gulp.watch(watch.jade, ['jade']);
  // gulp.watch(watch.twig, ['twig']);
  gulp.watch(watch.content, ['contents']);
});

// build

gulp.task('build', ['clean'], function() {
  runSequence(
    // 'sprite',
    ['css', 'scss', /*'twig',*/ 'jade', 'jade:linter', 'img', 'contents', 'fonts', 'vendorjs', 'userjs'],
    'watch', function() {}
  );
});

// default

gulp.task('default', ['build']);

// deploy

gulp.task('deploy', ['clean'], function() {
  devBuild = false;
  runSequence(
    // 'sprite', 'svg',
    ['css', 'scss', /*'twig',*/ 'jade', 'img', 'contents', 'fonts', 'vendorjs', 'userjs']
  );
});