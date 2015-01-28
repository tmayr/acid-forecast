var compileSass = require('broccoli-sass');
var mergeTrees = require('broccoli-merge-trees');

var appCss = compileSass(
    ['assets/scss'],
    '/app.scss',
    'assets/css/app.css'
);

module.exports = mergeTrees([appCss]);
