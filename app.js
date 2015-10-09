var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var csv = require('fast-csv')
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoose = require('mongoose');
var routes = require('./routes/index');
var ipUtil = require('ip');
var get_ip = require('ipware')().get_ip;

var IP = require('./models/ip');

var dbConfig = require('./db');
mongoose.connect(dbConfig.prodUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("Database connection established.")
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);

console.log("app started")

app.get('/', function (req, res, next) {
    res.render('index', {
        title: "IP GEOLOCATION"
    })
});

app.get('/api/geoip', function (req, res, next) {
    //console.log(req.query.ip.split(".").slice(0,3).join("."));
    //var ip = "\/"+req.query.ip.split(".").slice(0,3).join(".")+".*\/";
    var ip = req.query.ip;
    if(ip)
        var ipRange = req.query.ip.split(".").slice(0,2).join(".")+".*";
    else
        var ip = get_ip(req);
    console.log(ip)
    IP.find({startRange: new RegExp(ipRange, "i")}).exec(function (err, ips) {
        var geoIp;
        for(var n in ips){
            var fromArr = ipUtil.toLong(ips[n].startRange)
            var toArr = ipUtil.toLong(ips[n].endRange)
            if(ipUtil.toLong(ip) > ipUtil.toLong(ips[n].startRange) && ipUtil.toLong(ip) < ipUtil.toLong(ips[n].endRange)){
                geoIp = ips[n];
                console.log("within range")
                //console.log(ipUtil.toLong(ips[n].startRange), ipUtil.toLong(ips[n].endRange))
            }
            //console.log(fromArr, toArr)
            /*for(i=0;i<ips.length;i++){
                if(fromArr[i]>toArr[i])
                    console.log("matches")
            }*/
        }
        res.json(geoIp);
    });
});
/*
//network;geoname_id;registered_country_geoname_id;represented_country_geoname_id;is_anonymous_proxy;is_satellite_provider;postal_code;latitude;longitude
var stream = fs.createReadStream("dbip-city.csv");

var csvStream = csv()
    .on("data", function (data) {
        var $ip = [];
        $ip["startRange"] = data[0];
        $ip["endRange"] = data[1];
        $ip["countryCode"] = data[2];
        $ip["country"] = data[3];
        $ip["city"] = data[4];
        saveIP($ip);
    })
    .on("end", function () {
        console.log("Done!");
        console.log('Everything saved successfully!')
    });

stream.pipe(csvStream);

var ipIndex = 0;
function saveIP(ipObject) {
    new IP({
        startRange: ipObject.startRange,
        endRange: ipObject.endRange,
        countryCode: ipObject.countryCode,
        country: ipObject.country,
        city: ipObject.city
    }).save(function (err, result) {
        if (err) {
            console.error(err);
        } else {
            //res.json({success : "Added Successfully", status : 200, data: result});
            ipIndex++;
            console.log(ipIndex);
        }
    });
}*/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;