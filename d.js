/**
 * Created by sumeet on 8/9/15.
 */

'use strict';

var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();

var db;

app.use('/static', express.static('resources/public'));

var sendFile = function(res, dir, file) {
    var options = {
        root: __dirname + dir,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    res.sendFile(file, options, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent: ' + file);
        }
    });
};

app.get('/', function (req, res) {

    sendFile(res, '/resources/templates/', 'viz.html');
});

app.get('/:type(json|js|css)/:file', function (req, res) {

    console.log("Requested: " + req.params.file);

    sendFile(res, '/resources/public/', req.params.file);
});

app.post('/json/:file', function(req, res) {

    console.log("generating file: " + req.params.file);

    db.serialize(function() {
        db.each("select distinct app from code", function(err, row) {
            //console.log("came in");
            if (row) {
                console.log("app: " + row.app);
            }
        });

        //res.sendStatus(200);
    });

    res.sendStatus(200);
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    db = new sqlite3.Database('db.sqlite', function() {
        console.log("connected!");
    });

    console.log('visualizer app listening at http://%s:%s', host, port);
});