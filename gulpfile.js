// TODO: write cleanup and production scripts, extract from git repo and any 
// other production tasks, implement browserify

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
var unzip = require('gulp-unzip');
var zip = require('zip');
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
var remoteSrc = require('gulp-remote-src');
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
    js_src: 'src/assets/js/app/**/*.js',
    js_out: 'assets/js/',
    vendor_src: 'src/assets/js/vendor/**/*.js',
    vendor_out: 'assets/js/vendor/',
    files_src: 'src/**/*.{php,css,pdf,ttf,eof,woff,woff2,png,ico}',
    files_out: './'
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
// Tasks
///////////////////////////////////////////////////////////////////////////////
gulp.task('download-trinity', function() {
    remoteSrc(['master.zip'], { base: 'https://github.com/pherodine/trinity/' })
    .pipe(gulp.dest(io.files_out));
});

gulp.task('unzip-trinity', function() {
    gulp.src(io.files_out + "master.zip")
    .pipe(unzip())
    .pipe(gulp.dest(io.files_out));
});

gulp.task('delete-zip', function() {
    del([io.files_out + 'master.zip']);
});

gulp.task('setup', ['download-trinity', 'unzip-trinity', 'delete-zip']);

// Process the sass files
gulp.task('css', function() {
    return gulp.src(io.sass_src)
    .pipe(newer(io.sass_out))
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(gulp.dest(io.sass_out))
    .pipe(autoprefix(browsers))
    .pipe(base64({extensions: ['svg']}))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest(io.sass_out));
});

// Process JS Files
gulp.task('vendor', function() {
    return gulp.src(io.vendor_src)
    .pipe(newer(io.vendor_out))
    .pipe(gulp.dest(io.vendor_out));
});

gulp.task('js', ['vendor'], function() {
    return gulp.src(io.js_src)
    .pipe(newer(io.js_out))
    .pipe(concat('app.js'))
    .pipe(gulp.dest(io.js_out))
    .pipe(rename({suffix: '.min'}))
    //.pipe(stripdebug()) // comment out when developing
    .pipe(uglify())
    .pipe(gulp.dest(io.js_out));
});

// Process Images
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

// Syncronize Source Files
gulp.task('sync', function() {
    return gulp.src(io.files_src)
    .pipe(newer(io.files_out))
    .pipe(gulp.dest(io.files_out));
});

// FTP Deploy
gulp.task('deploy', ['css','js','images', 'sync'], function() {
    return gulp.src(ftp_access.glob, { base: './', buffer: false })
    .pipe(conn.newer(ftp_access.remote_dir))
    .pipe(conn.dest(ftp_access.remote_dir));
})

///////////////////////////////////////////////////////////////////////////////
// Watchers
///////////////////////////////////////////////////////////////////////////////
gulp.task('default', ['css','js','images', 'sync'], function() {
    gulp.watch(io.sass_src, ['css']); // watches for sass changes
    gulp.watch(io.js_src, ['js']); // watches for javascript changes
    gulp.watch(io.img_src, ['images']); //watch for image changes
    gulp.watch(io.vendor_src, ['vendor']); // watch for vendor changes
    gulp.watch(io.files_src, ['sync']); // watch for theme changes
    
    // Watch for CRUD actions in src and reflect in dist
    var sync_em = gulp.watch(io.files_src, ['sync']);
    sync_em.on('change', function(ev) {
        if(ev.type === 'deleted') {
            del(path.relative('./', ev.path).replace('src/', 'dist/'));
        }
    })
    .on('error', gutil.log);
    
    // Deploy Code Changes
    /* gulp.watch(ftp_access.glob) 
    .on('change', function(evt) {
        return gulp.src([evt.path], { base: './dist', buffer: false })
        .pipe(conn.newer(ftp_access.remote_dir))
        .pipe(conn.dest(ftp_access.remote_dir));
    })
    .on('error', gutil.log); */
});