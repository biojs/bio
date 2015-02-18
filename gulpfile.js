var buildDir = "build";
var pkgName = "bio";

var bio = require('./index.js');

// packages
var gulp = require('gulp');

// browser builds
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');

// gulp helper
var source = require('vinyl-source-stream'); // converts node streams into vinyl streams
var gzip = require('gulp-gzip');
var rename = require('gulp-rename');
var chmod = require('gulp-chmod');
var streamify = require('gulp-streamify'); // converts streams into buffers (legacy support for old plugins)
var watch = require('gulp-watch');

// path tools
var fs = require('fs');
var path = require('path');
var join = path.join;
var mkdirp = require('mkdirp');
var del = require('del');

// auto config
var outputFileMin = join(buildDir, pkgName + ".min.js");
var packageConfig = require('./package.json');

// a failing test breaks the whole build chain
gulp.task('build', ['build-browser', 'build-browser-gzip']);
gulp.task('default', ['build']);

// will remove everything in build
gulp.task('clean', function(cb) {
  del([buildDir], cb);
});

// just makes sure that the build dir exists
gulp.task('init', ['clean'], function() {
  mkdirp(buildDir, function(err) {
    if (err) console.error(err);
  });
});

// browserify debug
gulp.task('build-browser', ['init'], function() {
  var b = browserify({
    debug: true,
    hasExports: true
  });
  exposeBundles(b);
  return b.bundle()
    .pipe(source(pkgName + ".js"))
    .pipe(chmod(644))
    .pipe(gulp.dest(buildDir));
});

// browserify min
gulp.task('build-browser-min', ['init'], function() {
  var b = browserify({
    hasExports: true,
    standalone: pkgName
  });
  exposeBundles(b);
  return b.bundle()
    .pipe(source(pkgName + ".min.js"))
    .pipe(chmod(644))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(buildDir));
});

gulp.task('build-browser-gzip', ['build-browser-min'], function() {
  return gulp.src(outputFileMin)
    .pipe(gzip({
      append: false,
      gzipOptions: {
        level: 9
      }
    }))
    .pipe(rename(pkgName + ".min.gz.js"))
    .pipe(gulp.dest(buildDir));
});

// exposes all packages + the main one
function exposeBundles(b) {
  b.add("./browser.js", {
    expose: packageConfig.name
  });
  for (pkg in bio) {
    b.require(bio[pkg]);
  }
}

// watch task for browserify 
// watchify has an internal cache -> subsequent builds are faster
gulp.task('watch', function() {
  var util = require('gulp-util');

  var b = browserify({
    debug: true,
    hasExports: true,
    cache: {},
    packageCache: {}
  });

  // expose bundles
  exposeBundles(b);

  function rebundle(ids) {
    b.bundle()
      .on("error", function(error) {
        util.log(util.colors.red("Error: "), error);
      })
      .pipe(source(pkgName + ".js"))
      .pipe(chmod(644))
      .pipe(gulp.dest(buildDir));
  }

  var watcher = watchify(b);
  watcher.on("update", rebundle)
    .on("log", function(message) {
      util.log("Refreshed:", message);
    });
  return rebundle();
});
