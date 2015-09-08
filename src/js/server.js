/* global require, __dirname, console */

/**
 * serve the application
 * Created by sumeet on 8/9/15.
 */
(function () {
    'use strict';

    var express = require('express');
    var app = express();
    var sqlite3 = require('sqlite3').verbose();
    var util = require('util');
    var fs = require('fs');

    var db;

    //console.log("dirname: " + __dirname);

    app.use('/static', express.static(__dirname + '/resources/public'));

    var sendFile = function (res, dir, file) {
        var options = {
            root: __dirname + dir,
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        res.sendFile(file, options, function (err) {
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
        var version = req.query.v;
        if (!version) version = '';
        sendFile(res, '/resources/public', 'index.html');
    });

    app.get('/js/vendor/:file', function (req, res) {

        console.log("Requested: " + req.params.file);

        sendFile(res, '/resources/public/vendor', req.params.file);
    });

    app.get('/:type(json|js|css)/:file', function (req, res) {

        console.log("Requested: " + req.params.file);

        var dir = '/resources/public/';
        if (req.params.type === 'json') {
            dir = '/resources/';
        }

        console.log("type: " + req.params.type + " file: " + req.params.file);

        sendFile(res, dir, req.params.file);
    });

    var server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;

        db = new sqlite3.Database('db.sqlite', function () {
            console.log("connected!");
        });

        console.log('visualizer app listening at http://%s:%s', host, port);
    });
})();