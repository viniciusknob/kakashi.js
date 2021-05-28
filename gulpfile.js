const { src, dest, series } = require('gulp');
const fs = require('fs');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const htmlMinify = require('gulp-htmlmin');
const cssConcat = require('gulp-concat-css');
const cssMinify = require('gulp-clean-css');
const jsConcat = require('gulp-concat');
const jsMinify = require('gulp-minify');


const DIST_PATH = 'dist';
const BUILD_PATH = 'build';


function _htmlMinify() {
    return src('src/html/modal.html')
        .pipe(htmlMinify({
            collapseWhitespace: true,
            removeComments: true,
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(`${BUILD_PATH}/html`));
}

function _cssConcat() {
    return src([
            'src/css/*',
        ])
        .pipe(cssConcat('kakashi.css'))
        .pipe(dest(`${BUILD_PATH}/css`));
}

function _cssMinify() {
    return src([
            `${BUILD_PATH}/css/kakashi.css`
        ])
        .pipe(cssMinify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(`${BUILD_PATH}/css`));
}

function _minToJS() {
    return src(`${BUILD_PATH}/js/kakashi.js`)
        .pipe(replace('__css__', fs.readFileSync(`${BUILD_PATH}/css/kakashi.min.css`, 'utf8')))
        .pipe(replace('__modal__', fs.readFileSync(`${BUILD_PATH}/html/modal.min.html`, 'utf8')))
        .pipe(dest(`${BUILD_PATH}/js`));
}

function _jsConcat() {
    return src([
            'src/js/kakashi.js',
            'src/js/content.js',
            'src/js/indexeddb.js',
            'src/js/style.js',
            'src/js/snackbar.js',
            'src/js/fab.js',
            'src/js/modal.js',
            'src/js/statusinvest.js',
            'src/js/avenue.js',
            'src/js/main.js'
        ])
        .pipe(jsConcat('kakashi.js'))
        .pipe(dest(`${BUILD_PATH}/js`));
}

function _jsMinify() {
    return src([
            `${BUILD_PATH}/js/kakashi.js`
        ])
        .pipe(jsMinify({
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(dest(DIST_PATH));
}

exports.default = series(
    _htmlMinify,
    _cssConcat,
    _cssMinify,
    _jsConcat,
    _minToJS,
    _jsMinify,
);
