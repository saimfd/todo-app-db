const gulp = require('gulp');
const sass = require('gulp-sass');
const jade = require('gulp-jade');

var sassFiles = 'public/css/*.sass'
    cssDest = 'public/css/'
    jadeFiles = 'pages/*.jade'

gulp.task('default', () => {

})

gulp.task('styles', () => {
  gulp.src(sassFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(cssDest))
})

gulp.task('watch',function() {
    gulp.watch(sassFiles,['styles']);
});
