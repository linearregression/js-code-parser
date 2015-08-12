/**
 * Created by sumeet on 8/9/15.
 */

'use strict';

var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var util = require('util');
var readContents = require('./f.js');
var fs = require('fs');
var appConfig = JSON.parse(fs.readFileSync('app-conf.json', 'utf8'));


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
        appConfig.applications.forEach(function(app) {
            console.log("came in with app: " + app.name);
            db.each("select distinct u.module from uses u, code c where c.app = $app and u.codeid = c.codeid order by u.module",
                {$app: app.name}, function (err, mrow) {

                    console.log("app: " + app.name + " module: " + util.inspect(mrow, {showHidden: true, depth: null}));

                    if (err) {
                        console.log("ERROR:" + app.name + ":" + err + ":fetching distinct modules");
                        return;
                    }

                    readContents(app.shared, mrow.module + '.js', function (err, filename) {
                        db.run("insert into conf(app, conffile, shortcut, filename) values($app, $conffile, $shortcut, $filename)",
                            {
                                $app: app.name,
                                $conffile: 'null',
                                $shortcut: mrow.module,
                                $filename: filename
                            });
                    });

                }
            );
        });

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