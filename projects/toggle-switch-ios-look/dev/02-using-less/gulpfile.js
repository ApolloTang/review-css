/* global */
'use strict';

var gulp = require('gulp'),
    jade = require('gulp-jade'),
    browserify = require('browserify'),
    vinylSource = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    streamify = require('gulp-streamify'),
    sass = require('gulp-sass'),
    less = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect'),
    argv = require('optimist').argv,
    gulpif = require('gulp-if');

var outputDir = 'builds/development';

console.log ('argv: ', argv);

var env = argv.env || 'development';
var port = argv.p || '9999';

console.log('env: ', env);

var doneInit = false;

gulp.task('initialize', function(cb) {
    if (!doneInit) {

        console.log('doing initialize task');

        // initialize task here

        console.log('done initialize task');
        doneInit = true;
        var err = null; // no error
        // if err is not null and not undefined, the orchestration will stop
        cb(err); // call cb to signal task initialize is done
    } else {
        // not first time so just exsit
        cb(null);
    }
});

gulp.task('before', ['initialize'], function(cb) {

    // do stuff -- async or otherwise
    // will run before task default


    console.log('done task before');
    var err = null; // no error
    // if err is not null and not undefined, the orchestration will stop
    cb(err); // call cb to signal task before is done
});


gulp.task('jade', ['before'], function(){
    return gulp.src('src/templates/**/*.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});


gulp.task('js', ['before'], function(){
    return browserify({
        entries: ['./src/js/main.js'],
        debug: env === 'development' // only include source map if NODE_ENV is set 'development'
    })
    .bundle()
    .pipe(vinylSource('app.js'))
    .pipe(
        gulpif( env === 'production', streamify(uglify())) // only uglify on production enviroment
     )
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});


gulp.task('sass', ['before'], function(){
    var config = {};
    if (env === 'development') { config.writeSrcMap = true; }
    if (env === 'production') { config.writeSrcMap = false; }

    return gulp.src('src/sass/main.scss')
    .pipe(sourcemaps.init())   // <--- sourcemaps initialize
    .pipe(sass({errLogToConsole: true}))
    .pipe( gulpif( config.writeSrcMap, sourcemaps.write()))
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});


gulp.task('less', ['before'],  function(){
    var config = {};
    console.log('in task less, --env =', env);
    if (env === 'development') { config.writeSrcMap = true; }
    if (env === 'production') { config.writeSrcMap = false; }

    return gulp.src('src/less/main.less')
    .pipe( sourcemaps.init())   // <--- sourcemaps initialize
    .pipe(less())
    .on('error', function(err){
        //see //https://github.com/gulpjs/gulp/issues/259
        console.log(err);
        this.emit('end');
    })
    .pipe( gulpif( config.writeSrcMap, sourcemaps.write()))
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});

gulp.task('watch', ['before'], function(){
    gulp.watch('src/templates/**/*.jade', ['jade']);
    gulp.watch('src/js/**/*.js', ['js']);
    // gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('src/less/**/*.less', ['less']);
})

gulp.task('connect', ['before'], function(){
    console.log ('port: ', port);
    connect.server({
        root: outputDir,
        livereload: true,
        port: port
    });
});

// gulp.task('default', ['js', 'jade', 'sass', 'watch', 'connect']);
gulp.task('default', ['js', 'jade', 'less', 'watch', 'connect']);


