var express = require('express');
var exphbs = require('express-handlebars');
var broccoli_middlware = require('broccoli-middleware');
var https = require('https');

var app = express();

var forecast_uri = 'https://api.forecast.io/forecast/2fd1e5e0ed7da1df98ab7a244ea3e9fc'

var cities = {
    'new-york': {
        'lat': '40.7142700',
        'lng': '-74.0059700'
    },
    'buenos-aires': {
        'lat': '-34.6131500',
        'lng': '-58.3772300'
    },
    'lima': {
        'lat': '-12.0431800',
        'lng': '-77.0282400'
    },
    'santiago': {
        'lat': '-33.4569400',
        'lng': '-70.6482700'
    },
    'toronto': {
        'lat': '43.7001100',
        'lng': '-79.4163000'
    }
}

function build_forecast_city_uri(city){
    return forecast_uri + '/' + cities[city].lat + ',' + cities[city].lng;
}

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/:city', function(req, res) {
  var city = req.params.city;
  var city_uri = build_forecast_city_uri(city);

  https.get(city_uri, function(response){
    var body = '';
    response.on('data', function(d){
        body += d;
    });

    response.on('end', function(){
        console.log(JSON.parse(body))
        res.render("index");
    })
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
