/**
 * Created by sumeet on 8/9/15.
 */

'use strict';

var express = require('express');
var app = express();

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


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('visualizer app listening at http://%s:%s', host, port);
});