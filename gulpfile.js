var gulp       = require('gulp'), // Подключаем Gulp
  pug          = require('gulp-pug'), //Pug to HTML
  stylus       = require('gulp-stylus'), //Подключаем stylus пакет,
  browserSync  = require('browser-sync'), // Подключаем Browser Sync
  concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
  uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
  cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
  rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
  del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
  imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
  pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
  cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
  fontmin = require('gulp-fontmin'), //TTF to EOT, OTF, WOFF, SVG + Font-face
  svgmin = require('gulp-svgmin'),
  cheerio = require('gulp-cheerio'),
  replace = require('gulp-replace'),
  svgSprite = require('gulp-svg-sprite'),
  autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов


gulp.task('stylus', function(){ // Создаем таск stylus
  return gulp.src('app/stylus/*.styl') // Берем источник
    .pipe(stylus()) // Преобразуем stylus в CSS посредством gulp-stylus
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
    .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
    .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
  browserSync({ // Выполняем browserSync
    server: { // Определяем параметры сервера
      baseDir: 'app' // Директория для сервера - app
    },
    notify: false // Отключаем уведомления
  });
});

// Pug to HTML
gulp.task('pug', function() {
 return gulp.src('app/pug/*.pug')
 .pipe(pug({
    doctype: 'html',
    pretty: true
 }))
 .pipe(gulp.dest('app/'));
});

// TTF to EOT, OTF, WOFF, SVG + Font-face
gulp.task('fontmin', function() {
  return gulp.src('app/fonts/*.ttf')
  .pipe(fontmin())
  .pipe(gulp.dest('app/fonts'))
});

// Font-face files to fonts.css
gulp.task('fface',['fontmin'], function(){
  return gulp.src('app/fonts/*.css')
  .pipe(concat('fonts.css'))
  .pipe(gulp.dest('app/css'))
});

// Removes font-face from fonts folder
gulp.task('fonts', ['fface'], function(){
  return del.sync('app/fonts/*.css')
});

gulp.task('scripts', function() {
  return gulp.src([ // Берем все необходимые библиотеки
    'app/libs/jquery/dist/jquery.js',
    ])
    .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
    .pipe(uglify())
    .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs', ['stylus'], function() {
  return gulp.src(['app/css/main.css']) // Выбираем файл для минификации
    .pipe(cssnano()) // Сжимаем
    .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
    .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('svg', function() {
  return gulp.src('app/img/svg/*.svg')
      .pipe(svgmin({
        js2svg: {
            pretty: true
        }
      }))
      .pipe(cheerio({
        run: function($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true }
      }))
      .pipe(replace('&gt;', '>'))
      .pipe(svgSprite({
          mode: {
              symbol: {
                  sprite: "sprite.svg"
              }
          }
      }))
      .pipe(gulp.dest('app/img/svg/'));
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
  gulp.watch('app/stylus/**/*.styl', ['stylus']); // Наблюдение за stylus файлами в папке stylus
  gulp.watch('app/pug/**/*.pug', ['pug']);
  gulp.watch('app/img/svg/*.svg', ['svg']);
  gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
  gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
  gulp.watch('app/img/general/**/*.{png,jpg,gif}');
});

gulp.task('clean', function() {
  return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
  return gulp.src('app/img/**/*') // Берем все изображения из app
    .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});



gulp.task('build', ['clean', 'svg', 'pug',  'img', 'stylus', 'scripts'], function() {

  var buildCss = gulp.src([ // Переносим библиотеки в продакшен
    'app/css/main.css'
    ])
  .pipe(gulp.dest('dist/css'))

  var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
  .pipe(gulp.dest('dist/fonts'))

  var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
  .pipe(gulp.dest('dist/js'))

  var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
  .pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
  return cache.clearAll();
})

gulp.task('default', ['watch']);
