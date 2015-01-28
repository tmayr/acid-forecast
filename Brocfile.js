var compileSass = require('broccoli-sass');
var mergeTrees = require('broccoli-merge-trees');

var appCss = compileSass(
    ['assets/scss'],
    '/app.scss',
    'assets/css/app.css',
    { outputStyle: 'compressed'}
);

module.exports = mergeTrees([appCss]);
