const { src, dest, series, parallel } = require('gulp');
const jsConcat = require('gulp-concat');
const jsMinify = require('gulp-minify');

const DIST_PATH = 'dist'

function concat() {
	return src([
		'src/js/kakashi.js',
		'src/js/indexeddb.js',
		'src/js/notification.js',
		'src/js/statusinvest.js',
		'src/js/main.js'
	])
	.pipe(jsConcat('kakashi.js'))
	.pipe(dest(DIST_PATH));
}

function minify() {
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

exports.default = series(concat, minify);
