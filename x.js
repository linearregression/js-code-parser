'use strict';

var fs = require('fs');
var esprima = require('esprima');
var sqlite3 = require('sqlite3').verbose();
var htmlparser = require('htmlparser');
var util = require("util");

// global variables
var db;              // handler to db object
var app = 'generic'; // which app are we processing?
var path_stem = '';  // remove system dependent paths from the db

// called through htmlParser
var configParser = function(content, fname) {
    try {
        var json = esprima.parse(content);
    } catch (err) {
        throw "ERROR:" + fname + ":parsing:" + err;
    }

    console.log(JSON.stringify(json, null, 2));

    json.body.forEach((function(){
        function findReqConfigs(elt, index, array) {
            //console.log("elt: " + elt.expression);
            if (elt.type === 'ExpressionStatement'
                && elt.expression.type === 'CallExpression'
                && elt.expression.callee.object.name === 'require'
                && elt.expression.callee.property.name === 'config') {
                elt.expression['arguments'][0].properties.forEach(function(pair, index, args) {
                    console.log("fname = " + fname + " name = " + pair.key.name + " val = " + pair.value.value);
                });
            }
        }
        return findReqConfigs;
    })());
};

// called through processArgs
var htmlParser = function (rawHtml, fname) {
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error) {
            console.log("ERROR: unable to html parse " + fname);
            return;
        }

        //console.log("dom = " + util.inspect(dom, {showHidden: true, depth: null}));

        dom.forEach((function() {
            //dfs for script tags
            function parse(node) {
                if (node.type === 'script') {
                    var js = node.raw;
                    if (node.data === 'script') js = node.children[0].raw;

                    // TODO: some cheats, shared.js & require.config are relevant only
                    if (js.indexOf("require.config") > 0) {
                        configParser(js, fname);
                    } else {
                        console.log("fname = " + fname + " raw js = " + js);
                    }

                } else if (node.children) {
                    node.children.forEach(function(child) {
                        parse(child);
                    });
                }
            }
            return parse;
        })());
    });

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);
};

// called through processArgs
var defineParser = function (content, fname) {
    try {
        var json = esprima.parse(content);
    } catch (err) {
        throw "ERROR:" + fname + ":parsing:" + err;
    }

    //console.log(JSON.stringify(json, null, 2));
    //

    try {
        var firstStatement = json.body[0];
        if (firstStatement
            && firstStatement.type === 'ExpressionStatement'
            && firstStatement.expression.type == 'CallExpression'
            && (firstStatement.expression.callee.name == 'define'
            || firstStatement.expression.callee.name == 'requirejs')) {
            var expr = firstStatement.expression;
            if (expr['arguments'][0].type == 'FunctionExpression') {
                console.log("ERROR:" + fname + ":define is passing in require");
                return;
            }
            var args = firstStatement.expression['arguments'][0].elements;
            db.serialize(function () {
                var data = {$app: app, $filename: fname.replace(path_stem, '')};
                db.run("insert into code(app, filename) values($app, $filename)", data);
                db.get("select codeid from code where app = $app and filename = $filename", data, function (err, row) {
                    if (err) {
                        console.log("ERROR:fetching code id");
                        return;
                    }

                    //console.log("INFO:codeid: " + row.codeid);
                    args.forEach(function (val, index, array) {
                        db.run("insert into uses(codeid, module) values($codeid, $module)",
                            {
                                $codeid: row.codeid,
                                $module: val.value
                            });
                        //console.log(val.value);
                    });
                });
            });
            //console.log(args);
        }
    } catch (err) {
        console.log(JSON.stringify(json, null, 2));
        throw fname + ":reading:" + err;
    }
};

var processArgs = function () {
    var argv = require('minimist')(process.argv.slice(2));
    app = argv.a;
    path_stem = argv.s;

    argv._.forEach(function (val, index, array) {
        //console.log("index: " + index + " val: " + val);
        try {
            if (!fs.lstatSync(val).isDirectory()) {
                var content = fs.readFileSync(val);
                if (argv.m === 'define') defineParser(content, val);
                else if (argv.m === 'html') htmlParser(content, val);
            }
        } catch (err) {
            console.log("ERROR:" + val + ":" + err);
        }
    });
};

var ddl = function () {
    db.serialize(function () {
        db.run("create table if not exists code(codeid integer primary key autoincrement, app varchar(10), filename varchar(20))");
        db.run("create table if not exists uses(usesid integer primary key autoincrement, codeid integer, module varchar(20))");
        db.run("create table if not exists require(requireid integer primary key autoincrement, module varchar(20), expanded varchar(20))");
        processArgs();
    });
};

db = new sqlite3.Database('db.sqlite', ddl);
