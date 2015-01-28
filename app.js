var express = require('express');
var exphbs = require('express-handlebars');
var broccoli_middlware = require('broccoli-middleware');
var Promise = require('bluebird');
var needle = Promise.promisifyAll(require('needle'));
var moment = require('moment');

var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var forecast_uri = 'https://api.forecast.io/forecast/2fd1e5e0ed7da1df98ab7a244ea3e9fc'

var cities = {
    'new-york': {
        'lat': '40.7142700',
        'lng': '-74.0059700',
        'name': 'Nueva York',
        'country': 'USA',
        'forecast': false
    },
    'bangkok': {
        'lat': '13.736717',
        'lng': '100.523186',
        'name': 'Bangkok',
        'country': 'Thailand',
        'forecast': false
    },
    'lima': {
        'lat': '-12.0431800',
        'lng': '-77.0282400',
        'name': 'Lima',
        'country': 'Perú',
        'forecast': false
    },
    'santiago': {
        'lat': '-33.4569400',
        'lng': '-70.6482700',
        'name': 'Santiago',
        'country': 'Chile',
        'forecast': false
    },
    'wellington': {
        'lat': '41.2889',
        'lng': '174.7772',
        'name': 'Wellington',
        'country': 'New Zeland',
        'forecast': false
    }
}

function build_forecast_city_uri(city){
    return forecast_uri + '/' + city.lat + ',' + city.lng + '?units=si&exclude=minutely,hourly,daily,alerts,flags';
}

function get_time_lightness(hours){
    hours = parseInt(hours, 10);
    var hsl_value = 10;

    // 10 is the lowest lightness value we'll show
    if(hours <= 15){
        // 70/15 because thats how fast we want 15 hours to pass, each hour is 70/15 light
        hsl_value = hours * (70/15);
    }else{
        // 100/9 because thats how fast we want 9 hours to pass
        hsl_value = 100 - (hours * (100/9));
    }
    return Math.max(10, hsl_value);
}

app.get('/', function(req, res) {
  // we return a needle promise for each city and wait for each to finish to assign them to their city, and all of them to finish before we render
  Promise.map(Object.keys(cities), function(city){
    var city = cities[city];

    return (
        needle
            .getAsync(build_forecast_city_uri(city))
            .then(function(response){
                city.forecast = response[0].body;

                // parse some data into useful formats to display
                city.forecast.currently.humidity = Math.floor(city.forecast.currently.humidity * 100);
                city.forecast.currently.temperature = Math.floor(city.forecast.currently.temperature);
                city.forecast.currently.apparentTemperature = Math.floor(city.forecast.currently.apparentTemperature);

                var datetime = moment.unix(city.forecast.currently.time).utc().add(city.forecast.offset, 'hours');
                city.forecast.currently.time = datetime.format('HH:mm DD/MM/YY');

                city.forecast.currently.hsl_value = get_time_lightness(datetime.format('HH'));
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
        error: process.env.NODE_ENV === 'dev' ? err : ''
    });
});

app.listen(process.env.PORT || 3000);
