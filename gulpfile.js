var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
// var gulpDocumentation = require('gulp-documentation');

gulp.task('sass', function(){
  return gulp.src('app/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  });
});

gulp.task('useref', function(){
  return gulp.src('app/*.html')
	  .pipe(useref())
	  .pipe(gulpIf('**/*.js', uglify()))
	  .pipe(gulpIf('**/*.css', cssnano()))
	  .pipe(gulp.dest('dist'));
});

gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
	  .pipe(cache(imagemin({
	    interlaced: true
	   })))
	  .pipe(gulp.dest('dist/images'));
});

gulp.task('docs', function () {
  const fs = require('fs-then-native')
  const jsdoc2md = require('jsdoc-to-markdown')

  return jsdoc2md.render({ files: 'app/js/*.js' })
    .then(output => fs.writeFile('api.md', output))
})

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
	  .pipe(gulp.dest('dist/fonts'));
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});

gulp.task('build', [/*`copy`, */`clean`, `sass`, `useref`, `images`, `fonts`], function (){
  console.log('Building files');
});

gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['sass', 'useref', 'images', 'fonts'],
    callback
  );
});

gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  );
});

gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
  gulp.watch('app/css/**/*.css', browserSync.reload);
});
