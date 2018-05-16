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
var fs = require('fs');
var bump = require('gulp-bump');
var prompt = require('gulp-prompt');
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
    root_out: './',
};

var theme_name = "trinity";
var style_css_out = "";

// All ftp settings
var ftp_access = {
    user: process.env.FDSTG_USER,
    pass: process.env.FDSTG_PASS,
    host: 'ftp.fixrdigital.co.uk',
    port: 21,
    glob: [
        io.root_out + '**/*',
        '!./node_modules/**/*',
        '!./.gitignore',
        '!./*.js',
        '!./*.json',
        '!./*.md'
    ],
    remote_dir: '/wp-content/themes/' + theme_name + "/"
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

var time = function() {
    var D = new Date();
    var hours = D.getHours();
    var mins = D.getMinutes();
    var secs = D.getSeconds();

    return "[" + ((hours < 10) ? "0" + hours : hours) + ":" + ((mins < 10) ? "0" + mins : mins) + ":" + ((secs < 10) ? "0" + secs : secs) +"] ";
}
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
    .then(paths => { console.log(time() + 'Deleted ', paths.join('\'\n')); });
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
});

gulp.task('theme:rename', function(callback) {
    var results;

    gulp.src(io.root_out)
    .pipe(prompt.prompt([
        {
            type: 'input',
            name: 'theme_name',
            message: 'Enter a new Theme name: ',
            default: 'Trinity'
        },
        {
            type: 'input',
            name: 'theme_uri',
            message: 'Enter the Theme URI: ',
            default: 'https://github.com/pherodine/trinity/'
        },
        {
            type: 'input',
            name: 'theme_description',
            message: 'Theme Description: ',
            default: 'A starter theme developed by FIXR Digital. Very minimal, clean and bloat free for quick start development'
        },
        {
            type: 'input',
            name: 'theme_author',
            message: 'Who authored this theme: ',
            default: 'Aaron Smyth of FIXR Digital'
        },
        {
            type: 'input',
            name: 'theme_author_uri',
            message: 'Author URI: ',
            default: 'https://fixrdigital.co.uk'
        },
        {
            type: 'input',
            name: 'theme_text_domain',
            message: 'Theme Text Domain: ',
            default: 'fixr'
        }
    ], function(res){
        style_css_out = "/*\n";
        for(var key in res) {

            if(key == "theme_name") {
                style_css_out += "\tTheme Name: " + res[key] + "\n";
            }

            if(key == "theme_uri") {
                style_css_out += "\tTheme URI: " + res[key] + "\n";
            }

            if(key == "theme_description") {
                style_css_out += "\tDescription: " + res[key] + "\n";
            }

            if(key == "theme_author") {
                style_css_out += "\tAuthor: " + res[key] + "\n";
            }

            if(key == "theme_author_uri") {
                style_css_out += "\tAuthor URI: " + res[key] + "\n";
            }
        }
        style_css_out += "\tVersion: 0.0.1\n";
        style_css_out += "\tLicense: GNU General Public License v3 or later\n";
        style_css_out += "\tLicense URI: http://www.gnu.org/licenses/gpl-3.0.html\n";

        if(res.theme_text_domain) {
            style_css_out += "\tText Domain: " + res.theme_text_domain + "\n";
        }

        style_css_out += "*/";

        // update style.css
        del(io.root_out + 'style.css')
        .then(paths => { console.log(time() + 'Deleted \'', paths.join('\'\n')); })
        .then(function() {
            // Create new style.css with new content
            fs.appendFile(io.root_out + 'style.css', style_css_out, function(err){
            if(err){ onError(err); }
                console.log(time() + 'Updated \'style.css\' successfully');
            });
        });

        callback();
    }))
    .pipe(gulp.dest(io.root_out));
});

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
    gulp.watch(ftp_access.glob) 
    .on('change', function(evt) {
        return gulp.src([evt.path], { base: './', buffer: false })
        .pipe(conn.newer(ftp_access.remote_dir))
        .pipe(conn.dest(ftp_access.remote_dir));
    })
    .on('error', onError);
});