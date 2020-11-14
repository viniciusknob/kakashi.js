const { src, dest, series, parallel } = require('gulp');
const jsConcat = require('gulp-concat');

function defaultTask() {
	return src([
		'src/js/kakashi.js',
		'src/js/indexeddb.js',
		'src/js/notification.js',
		'src/js/statusinvest.js',
		'src/js/main.js'
	])
	.pipe(jsConcat('kakashi.js'))
	.pipe(dest('dist'));
}

exports.default = defaultTask;
