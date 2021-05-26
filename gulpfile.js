const { src, dest, series } = require('gulp');
const fs = require('fs');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const cssConcat = require('gulp-concat-css');
const cssMinify = require('gulp-clean-css');
const jsConcat = require('gulp-concat');
const jsMinify = require('gulp-minify');


const DIST_PATH = 'dist';
const BUILD_PATH = 'build';


function _cssConcat() {
	return src([
		'src/css/fab.css',
		'src/css/snackbar.css',
	])
	.pipe(cssConcat('kakashi.css'))
	.pipe(dest(BUILD_PATH + '/css'));
}

function _cssMinify() {
	return src([
		'build/css/kakashi.css'
	])
	.pipe(cssMinify())
	.pipe(rename({
		suffix: '.min'
	}))
	.pipe(dest(BUILD_PATH + '/css'));
}

function _cssMinToJS() {
	return src('dist/kakashi.js')
		.pipe(replace('__css__', fs.readFileSync('build/css/kakashi.min.css', 'utf8')))
		.pipe(dest(DIST_PATH));
};

function _jsConcat() {
	return src([
		'src/js/kakashi.js',
		'src/js/indexeddb.js',
		'src/js/notification.js',
		'src/js/style.js',
		'src/js/snackbar.js',
		'src/js/fab.js',
		'src/js/statusinvest.js',
		'src/js/avenue.js',
		'src/js/main.js'
	])
	.pipe(jsConcat('kakashi.js'))
	.pipe(dest(DIST_PATH));
}

function _jsMinify() {
	return src([
		'dist/kakashi.js'
	])
	.pipe(jsMinify({
		ext: {
			min:'.min.js'
		}
	 }))
	 .pipe(dest(DIST_PATH));
}

exports.default = series(
	_cssConcat,
	_cssMinify,
	_jsConcat,
	_cssMinToJS,
	_jsMinify
);
