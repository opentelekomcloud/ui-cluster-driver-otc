/* jshint node: true */
const gulp = require('gulp');
const clean = require('gulp-clean');
const gulpConcat = require('gulp-concat');
const gulpConnect = require('gulp-connect');
const replace = require('gulp-replace');
const babel = require('gulp-babel');
const include = require('gulp-include')
const argv = require('yargs').argv;
const pkg = require('./package.json');
const fs = require('fs');
const replaceString = require('replace-string');

const NAME_TOKEN = '%%DRIVERNAME%%';
const VERSION_TOKEN = '%%DRIVERVERSION%%';

const BASE = 'component/';
const DIST = 'dist/';
const TMP = 'tmp/';
const ASSETS = 'assets/';
const DRIVER_NAME = argv.name || pkg.name.replace(/^ui-cluster-driver-/, '');
const DRIVER_VERSION = pkg.version;

const DEBUG = argv.debug

console.log('Driver Name:', DRIVER_NAME);
console.log('Driver Version:', DRIVER_VERSION);

if (!DRIVER_NAME) {
  console.log('Please include a driver name with the --name flag');
  process.exit(1);
}
if (!DRIVER_VERSION) {
  console.log('Please include a driver version with the --ui-version flag');
  process.exit(1);
}

gulp.task('clean', function () {
  return gulp.src([`${DIST}*.js`, `${DIST}*.css`, `${DIST}*.hbs`, `${TMP}*.js`, `${TMP}*.css`, `${TMP}*.hbs`,], { read: false })
    .pipe(clean());
});

gulp.task('styles', gulp.series('clean', function () {
  return gulp.src([`${BASE}**.css`])
    .pipe(replace(NAME_TOKEN, DRIVER_NAME))
    .pipe(replace(VERSION_TOKEN, DRIVER_VERSION))
    .pipe(gulpConcat(`component.css`, { newLine: '\n' }))
    .pipe(gulp.dest(DIST));
}));

gulp.task('assets', gulp.series('styles', function () {
  return gulp.src(`${ASSETS}*`)
    .pipe(gulp.dest(DIST));
}));

const plugins = [
  "add-module-exports",
  [
    "transform-es2015-modules-amd", {
    "noInterop": true,
  }
  ]
]

if (!DEBUG) {
  plugins.push("transform-remove-console")
} else {
  console.log('DEBUG MODE! console.log calls won\'t be removed')
}

gulp.task('babel', gulp.series('assets', function () {
  const opts = {
    presets:  [
      [
        "@babel/preset-env", {
        targets: {
          browsers: ["> 1%"]
        }
      }]
    ],
    plugins:  plugins,
    comments: false,
    moduleId: `shared/components/cluster-driver/driver-${DRIVER_NAME}/component`
  };

  let hbs = fs.readFileSync(`${BASE}template.hbs`, 'utf8');

  hbs = replaceString(hbs, NAME_TOKEN, DRIVER_NAME);

  hbs = Buffer.from(hbs).toString('base64');

  return gulp.src([
    `${BASE}component.js`
  ])
    .pipe(include({
      extensions: 'js',
    }))
    .on('error', console.log)
    .pipe(replace('const LAYOUT;', `const LAYOUT = '${hbs}';`))
    .pipe(replace(NAME_TOKEN, DRIVER_NAME))
    .pipe(replace(VERSION_TOKEN, DRIVER_VERSION))
    .pipe(babel(opts))
    .pipe(gulpConcat(`component.js`, { newLine: '\n' }))
    .pipe(gulp.dest(TMP));
}));

gulp.task('rexport', gulp.series('babel', function () {
  const babelOpts = {
    presets:  [
      [
        "@babel/preset-env", {
        targets: {
          browsers: ["> 1%"]
        }
      }]
    ],
    plugins:  [
      "add-module-exports",
      [
        "transform-es2015-modules-amd", {
        "noInterop": true,
      }
      ]
    ],
    comments: false,
    moduleId: `ui/components/cluster-driver/driver-${DRIVER_NAME}/component`,
  }
  return gulp.src([
    `${BASE}rexport.js`
  ])
    .pipe(replace(NAME_TOKEN, DRIVER_NAME))
    .pipe(babel(babelOpts))
    .pipe(gulpConcat(`rexport.js`, { newLine: ';\n' }))
    .pipe(gulp.dest(TMP));
}));

gulp.task('alias', gulp.series('rexport', function () {
  return gulp.src([
    `${BASE}alias.js`
  ])
    .pipe(replace(NAME_TOKEN, DRIVER_NAME))
    .pipe(gulpConcat(`alias.js`, { newLine: '\n' }))
    .pipe(gulp.dest(TMP));
}));


gulp.task('compile', gulp.series('alias', function () {
  return gulp.src([
    `${TMP}component.js`,
    `${TMP}rexport.js`,
    `${TMP}alias.js`,
  ])
    .pipe(gulpConcat(`component.js`, { newLine: '\n' }))
    .pipe(gulp.dest(DIST));
}));

gulp.task('build', gulp.series('compile'));

gulp.task('watch', function () {
  return gulp.watch([`./${BASE}*.js`, `./${BASE}*.hbs`, `./${BASE}*.css`], gulp.parallel('build'));
});

gulp.task('server', gulp.parallel(['build', 'watch'], function () {
  return gulpConnect.server({
    root:  [DIST],
    port:  process.env.PORT || 3000,
    https: false,
  });
}));


gulp.task('default', gulp.series('build'));
