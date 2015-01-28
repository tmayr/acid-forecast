var express = require('express');
var exphbs = require('express-handlebars');
var broccoli_middlware = require('broccoli-middleware');
var Promise = require('bluebird');
var needle = Promise.promisifyAll(require('needle'));

var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var forecast_uri = 'https://api.forecast.io/forecast/2fd1e5e0ed7da1df98ab7a244ea3e9fc'

var cities = {
    // 'new-york': {
    //     'lat': '40.7142700',
    //     'lng': '-74.0059700'
    // },
    // 'buenos-aires': {
    //     'lat': '-34.6131500',
    //     'lng': '-58.3772300'
    // },
    // 'lima': {
    //     'lat': '-12.0431800',
    //     'lng': '-77.0282400'
    // },
    'santiago': {
        'lat': '-33.4569400',
        'lng': '-70.6482700',
        'name': 'Santiago, Chile',
        'forecast': false
    },
    'toronto': {
        'lat': '43.7001100',
        'lng': '-79.4163000',
        'name': 'Toronto, Canada',
        'forecast': false
    }
}

function build_forecast_city_uri(city){
    return forecast_uri + '/' + city.lat + ',' + city.lng + '?units=si&exclude=minutely,hourly,daily,alerts,flags';
}

app.get('/', function(req, res) {
  // we return a needle promise for each city and wait for each to finish to assign them to their city, and all of them to finish before we render
  Promise.map(Object.keys(cities), function(city){
    var city = cities[city];
    return (
        needle
            .getAsync(build_forecast_city_uri(city))
            .then(function(response){
                city.forecast = response[0].body
            })
    )
  }).then(function(){
      res.render("index", {
        'cities': cities
      });
  });
});

// using the middleware as an assets pipeline, pretty cool
app.use(broccoli_middlware);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

app.listen(3000);
