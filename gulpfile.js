///////////////////////////////////////////////////////////////////////////////
// Global Dependencies
///////////////////////////////////////////////////////////////////////////////
var gulp = require('gulp');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var newer = require('gulp-newer');
var gutil = require('gulp-util');
var cache = require('gulp-cache');
var path = require('path');
var del = require('del');
///////////////////////////////////////////////////////////////////////////////
// CSS Dependencies
///////////////////////////////////////////////////////////////////////////////
var sass = require('gulp-sass');
var autoprefix = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var base64 = require('gulp-base64');
///////////////////////////////////////////////////////////////////////////////
// JS Dependencies
///////////////////////////////////////////////////////////////////////////////
//var jshint = require('gulp-jshint');
var stripdebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
///////////////////////////////////////////////////////////////////////////////
// Image Dependencies
///////////////////////////////////////////////////////////////////////////////
var imagemin = require('gulp-imagemin');
///////////////////////////////////////////////////////////////////////////////
// FTP Dependencies
///////////////////////////////////////////////////////////////////////////////
var ftp = require('vinyl-ftp');
///////////////////////////////////////////////////////////////////////////////
// Configurations
///////////////////////////////////////////////////////////////////////////////

// All source and distribution paths
var io = {
    assets_src: 'src/assets/',
    assets_out: 'assets/',
    sass_src: 'src/assets/sass/**/*.scss',
    sass_out: 'assets/css',

    img_src: 'src/assets/images/**/*.{gif,jpg,jpeg,png,svg}',
    img_out: 'assets/images',

    js_all_src: 'src/assets/js/**/*.js',
    js_app_src: 'src/assets/js/app/**/*.js',
    js_pro_src: 'src/assets/js/vendor/production/**/*.js',
    js_con_src: 'src/assets/js/vendor/conditional/**/*.js',
    js_dev_src: 'src/assets/js/build/**/*.js',
    js_dev_out: 'src/assets/js/build/',
    js_app_out: 'assets/js/',
    vendor_out: 'assets/js/vendor/',

    root_src: 'src/**/*.{php,css,pdf,ttf,eof,woff,woff2,png,ico}',
    root_out: './'
};

// All ftp settings
var ftp_access = {
    user: process.env.TMP_USER,
    pass: process.env.TMP_PASS,
    host: 'ftp.fixrdigital.co.uk',
    port: 21,
    glob: [
        './' + io.files_out + '/**',
        './' + io.sass_out + '/**',
        './' + io.js_out + '/**',
        './' + io.img_out + '/**',
        './' + io.files_out + '/fonts/**',
    ],
    remote_dir: '/wp-content/themes/fixr-tmpllp'
};
var conn = getFTPConnection();

// All autoprefixer settings
var browsers = [
    'last 2 versions',
    'ie >= 8',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

///////////////////////////////////////////////////////////////////////////////
// Helpers
///////////////////////////////////////////////////////////////////////////////
function getFilenameFromPath(_path) {
    return _path.substring(_path.lastIndexOf('\\')+1);
}

function getRootFile(_path, _exclude) {
    var exc = 'src\\';
    var front = _path.lastIndexOf(_exclude);
    var back = _path.substring(front + exc.length);

    return _path.substring(0, front) + back;
}

// custom error management for the plumber resource
var onError = function(err) {
    gutil.beep();
    console.log(err);
    this.emit('end');
};

// return a connection to the required ftp server
function getFTPConnection() {
    return ftp.create({
        host: ftp_access.host,
        port: ftp_access.port,
        user: ftp_access.user,
        password: ftp_access.pass,
        parallel: 10,
        log: gutil.log
    });
};

// return a usable timestamp
var dt_stamp = function() {
    var D = new Date();
    var y = D.getFullYear().toString();
    var m = ('0' + (D.getMonth() + 1)).slice(-2);
    var d = ('0' + (D.getDay() + 1)).slice(2);
    var s = D.getSeconds().toString();

    return y + m + d + s;
};
///////////////////////////////////////////////////////////////////////////////
// CSS Tasks
///////////////////////////////////////////////////////////////////////////////
gulp.task('css', function() {
    return gulp.src(io.sass_src)
    .pipe(newer(io.sass_out))
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(autoprefix(browsers))
    .pipe(base64({extensions: ['svg']}))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest(io.sass_out));
});

///////////////////////////////////////////////////////////////////////////////
// Javascript Tasks
///////////////////////////////////////////////////////////////////////////////
gulp.task('vendor:con', function() {
    return gulp.src(io.js_con_src)
    .pipe(newer(io.vendor_out))
    .pipe(stripdebug())
    .pipe(gulp.dest(io.vendor_out));
});

gulp.task('vendor:pro', function() {
    return gulp.src(io.js_pro_src)
    .pipe(newer(io.js_dev_out))
    .pipe(concat('01.app.js'))
    .pipe(stripdebug())
    .pipe(gulp.dest(io.js_dev_out));
});

gulp.task('bundle:app', ['vendor:pro'], function() {
    return gulp.src(io.js_app_src)
    .pipe(newer(io.js_dev_out))
    .pipe(concat('02.app.js'))
    .pipe(stripdebug())
    .pipe(gulp.dest(io.js_dev_out))
});

gulp.task('compose:js', ['vendor:con', 'bundle:app'], function() {
    return gulp.src(io.js_dev_src)
    .pipe(newer(io.js_app_out))
    .pipe(concat('bundle.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())    
    .pipe(gulp.dest(io.js_app_out));
});

gulp.task('js', ['compose:js'], function() {
    del(io.js_dev_out)
    .then(paths => { console.log('Deleted: ', paths.join('\n')); });
});

///////////////////////////////////////////////////////////////////////////////
// Process Images
///////////////////////////////////////////////////////////////////////////////
gulp.task('images', function() {
    return gulp.src(io.img_src)
    .pipe(newer(io.img_out))
    .pipe(cache(imagemin({
        progressive: true,
        interlaced: true,
        svgoPlugins: [{removeViewBox: false}, {removeUselessStrokeAndFill: false}]
    })))
    .pipe(gulp.dest(io.img_out));
});

///////////////////////////////////////////////////////////////////////////////
// Syncronize Source Files
///////////////////////////////////////////////////////////////////////////////
gulp.task('sync', function() {
    gulp.src(io.root_src)
    .pipe(newer(io.root_out))
    .pipe(gulp.dest(io.root_out));
});

///////////////////////////////////////////////////////////////////////////////
// FTP Deploy
///////////////////////////////////////////////////////////////////////////////
gulp.task('deploy', ['sync', 'css', 'js'], function() {
    return gulp.src(ftp_access.glob, { base: './', buffer: false })
    .pipe(conn.newer(ftp_access.remote_dir))
    .pipe(conn.dest(ftp_access.remote_dir));
})

///////////////////////////////////////////////////////////////////////////////
// Watchers
///////////////////////////////////////////////////////////////////////////////
gulp.task('default', ['sync', 'css', 'js'], function() {
    gulp.watch(io.sass_src, ['css']); // watches for sass changes
    gulp.watch(io.js_all_src, ['js']); // watches for javascript changes
    gulp.watch(io.files_src, ['sync']); // watch for theme changes

    // Watch and sync the root dirctory
    var sync_root = gulp.watch(io.root_src, ['sync'])
        sync_root.on('change', function(ev) {
            var file = getRootFile(ev.path, 'src\\');

            if(ev.type === "deleted") {
                del(file)
                .then(paths => { console.log('Deleted: ', paths.join(', ')); });
            }
        });
    
    // Deploy Code Changes
    /* gulp.watch(ftp_access.glob) 
    .on('change', function(evt) {
        return gulp.src([evt.path], { base: './dist', buffer: false })
        .pipe(conn.newer(ftp_access.remote_dir))
        .pipe(conn.dest(ftp_access.remote_dir));
    })
    .on('error', gutil.log); */
});