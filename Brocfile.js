var compileSass = require('broccoli-sass');
var mergeTrees = require('broccoli-merge-trees');
var findBowerTrees = require('broccoli-bower');
var pickFiles = require('broccoli-static-compiler');
var autoprefixer = require('broccoli-autoprefixer');

var extraAssets = pickFiles('bower_components/weather-icons', {
     srcDir: '/',
     files: [
        '**/*.woff',
        '**/*.eot',
        '**/*.svg',
        '**/*.ttf',
        '**/*.otf',
        '**/weather-icons.min.css'],
     destDir: '/assets'
 });

var appCss = compileSass(
    ['assets/scss'],
    '/app.scss',
    'assets/css/app.css',
    { outputStyle: 'compressed'}
);

appCss = autoprefixer(appCss)

module.exports = mergeTrees([appCss, extraAssets]);
