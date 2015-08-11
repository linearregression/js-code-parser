'use strict';

var fs = require('fs');
var esprima = require('esprima');
var sqlite3 = require('sqlite3').verbose();
var htmlparser = require('htmlparser');
var util = require("util"); // for debugging objects

// global variables
var db;              // handler to db object

var storeConfig = function(module, path) {
    db.serialize(function() {

    });
};

// called through htmlParser
var configParser = function (content, fname, app) {
    try {
        var json = esprima.parse(content);
    } catch (err) {
        throw "ERROR:" + app.name + ":" + fname + ":parsing " + err;
    }

    //console.log(JSON.stringify(json, null, 2));

    json.body.forEach((function () {
        function findReqConfigs(elt, index, array) {
            //console.log("elt: " + elt.expression);
            if (elt.type === 'ExpressionStatement'
                && elt.expression.type === 'CallExpression'
                && elt.expression.callee.object.name === 'require'
                && elt.expression.callee.property.name === 'config') {

                //console.log(JSON.stringify(json, null, 2));
                elt.expression['arguments'][0].properties.forEach(function (pair, index, args) {
                    console.log("INFO:" + app.name + ":" + fname + ":name = " + pair.key.name + " val = " + pair.value.value);
                    if (pair.key.name === 'map') {
                        //console.log(JSON.stringify(pair, null, 2));
                        var mapFrom = pair.value.properties[0].key.value;
                        pair.value.properties[0].value.properties.forEach(function (shortcut) {
                            console.log("from: " + mapFrom + ":to: " + shortcut.key.name + ":value: " + shortcut.value.value);
                        });
                    } else if (pair.key.name === 'paths') {
                        db.serialize(function () {
                            //console.log(JSON.stringify(pair, null, 2));
                            pair.value.properties.forEach(function (shortcut) {
                                var data = {
                                    $app: app.name,
                                    $conffile: fname,
                                    $shortcut: shortcut.key.value,
                                    $filename: shortcut.value.value
                                };

                                db.get("select count(*) as cnt from conf where " +
                                    "app = $app and " +
                                    "conffile = $conffile and " +
                                    "shortcut = $shortcut and " +
                                    "filename = $filename", data,
                                    function (err, row) {
                                        //console.log("err: " + err + " row.cnt: " + row.cnt);
                                        if (!err && row.cnt === 0) {
                                            db.run("insert into conf(app, conffile, shortcut, filename) values " +
                                                "($app, $conffile, $shortcut, $filename)", data);
                                        }
                                    }
                                );
                                //console.log("pathFrom:" + shortcut.key.value + ":to:" + shortcut.value.value);
                            });
                        });
                    }
                });
            }
        }

        return findReqConfigs;
    })());

};

// called through processArgs
var htmlParser = function (rawHtml, fname, app) {
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error) {
            console.log("ERROR:" + app.name + ":" + fname + ":unable to html parse ");
            return;
        }

        //console.log("dom = " + util.inspect(dom, {showHidden: true, depth: null}));

        dom.forEach((function () {
            //dfs for script tags
            function parse(node) {
                if (node.type === 'script') {
                    var js = node.raw;
                    if (node.data === 'script') js = node.children[0].raw;

                    // TODO: some cheats, shared.js & require.config are relevant only
                    if (js.indexOf("require.config") > 0) {
                        configParser(js, fname, app);
                    } else if (js.indexOf("shared.js") > 0) {
                        var r = js.split("'")[1];
                        var s = r.split('/').splice(2, r.split('/').length).join('/');
                        console.log("i am here ... :" + app.search_mrsparkle + ":" + s);
                        readContents(app.search_mrsparkle, s, function (err, filename, jsContent) {
                            console.log("filename:" + filename);
                            configParser(jsContent, filename, app);
                        });
                    } else {
                        //console.log("INFO:" + app.name + ":" + fname + ":raw js = " + js);
                    }

                } else if (node.children) {
                    node.children.forEach(function (child) {
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
var defineParser = function (content, fname, app) {
    try {
        var json = esprima.parse(content);
    } catch (err) {
        throw "ERROR:" + app.name + ":" + fname + ":parsing:" + err;
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
                console.log("WARN:" + app.name + ":" + fname + ":define is passing in require:skipping for now");
                return;
            }

            var args = firstStatement.expression['arguments'][0].elements;

            db.serialize(function () {
                var data = {$app: app.name, $filename: fname.replace(app.stem, '')};
                db.run("insert into code(app, filename) values($app, $filename)", data);
                db.get("select codeid from code where app = $app and filename = $filename", data, function (err, row) {
                    if (err) {
                        console.log("ERROR:" + app.name + ":" + ":fetching code id");
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
        throw "ERROR:" + app.name + ":" + fname + ":reading:" + err;
    }
};

// synchronous dfs
function readContents(dir, ext, callback) {
    var list = fs.readdirSync(dir);

    list.forEach(function (entry) {
        var fullpath = dir + "/" + entry;
        if (fs.lstatSync(fullpath).isDirectory()) {
            readContents(fullpath, ext, callback);
        } else if (fullpath.indexOf(ext, fullpath.length - ext.length) !== -1) {
            callback(null, entry, fs.readFileSync(fullpath));
        }
    });
}

var processArgs = function () {
    var argv = require('minimist')(process.argv.slice(2));
    var appConfig = JSON.parse(fs.readFileSync(argv.c, 'utf8'));

    appConfig.applications.forEach(function (app) {

         readContents(app.js, ".js", function(err, filename, contents) {
            defineParser(contents, filename, app);
         });

        readContents(app.html, ".html", function (err, filename, contents) {
            htmlParser(contents, filename, app);
        });
    });
};

var ddl = function () {
    db.serialize(function () {

        db.run("create table if not exists code(codeid integer primary key autoincrement, " +
            "app varchar(10), filename varchar(20))");

        db.run("create table if not exists uses(usesid integer primary key autoincrement, " +
            "codeid integer, module varchar(20))");

        db.run("create table if not exists conf(confid integer primary key autoincrement, app varchar(10), " +
            "conffile varchar(20), shortcut varchar(10), filename varchar(20))");

        processArgs();
    });
};

db = new sqlite3.Database('db.sqlite', ddl);
