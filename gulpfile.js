var gulp = require('gulp');
var browserify = require('gulp-browserify');
var cssmin = require('gulp-cssmin');
var exec = require('child_process').exec;
var less = require('gulp-less');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var react = require('gulp-react');
var fs = require('fs');

var port = 8080;

gulp.task('lint', function () {
	exec([
			'node',
			'./node_modules/jsxhint/cli.js',
			//'--show-non-errors',
			'--config',
			'./.jshint',
			'./src/*.js ./demo/src/*.js'
		].join(' '),
	function (err, stdout, stderr) {
		if (stdout) {
			console.log(stdout);
		}
	});
});

gulp.task('prepublish', function () {
	gulp.src('./src/daterangepicker.js')
		.pipe(gulp.dest('./lib'));
	gulp.src('./src/index.js')
		.pipe(react())
		.pipe(gulp.dest('./lib'));
});

gulp.task('fonts', function () {
	gulp.src('./node_modules/bootstrap/dist/fonts/*')
		.pipe(gulp.dest('./demo/www/fonts/'));
});

gulp.task('app-content', function () {
	var content = fs.readFileSync('./demo/src/App.js', 'utf-8');
	fs.writeFileSync(
		'./demo/src/AppContent.js',
		[
			'/* autogenerated by gulpfile.js */',
			'exports.content = ' + JSON.stringify(content) + ';'
		].join('\n'),
		'utf-8'
	);
});

gulp.task('demo', function () {
	// styles
	gulp.src('./demo/src/less/demo.less')
		.pipe(less())
		.pipe(rename('demo.debug.css'))
		.pipe(gulp.dest('./demo/www/css/'))
		.pipe(cssmin())
		.pipe(rename('demo.min.css'))
		.pipe(gulp.dest('./demo/www/css/'));

	// scripts
	gulp.src('./demo/src/App.js')
		.pipe(browserify({
			debug: true,
			transform: ['reactify']
		}))
		.pipe(rename('demo.debug.js'))
		.pipe(gulp.dest('./demo/www/js/'))
		.pipe(uglify())
		.pipe(rename('demo.min.js'))
		.pipe(gulp.dest('./demo/www/js/'));
});

gulp.task('server', function() {
	connect.server({
		root: './demo/www',
		livereload: true,
		port: 8080
	});
});

gulp.task('watch', function () {
	gulp.watch(['./src/index.js','./demo/src/**/*.js'], ['build']);
});

gulp.task('build', ['lint', 'fonts', 'app-content', 'demo', 'prepublish']);
gulp.task('default', ['build', 'server', 'watch']);

//handle errors
process.on('uncaughtException', function (e) {
	console.error(e);
});
