var fs = require('fs');
var esprima = require('esprima');
var sqlite3 = require('sqlite3').verbose();

// global variables
var db;
var app = 'generic';
var path_stem = '';

var jsParser = function (content, fname) {
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
            if (expr.arguments[0].type == 'FunctionExpression') {
                console.log("ERROR:" + fname + ":define is passing in require");
                return;
            }
            var args = firstStatement.expression.arguments[0].elements;
            db.serialize(function() {
                data = { $app: app, $filename: fname.replace(path_stem, '') };
                db.run("insert into code(app, filename) values($app, $filename)", data);
                db.get("select codeid from code where app = $app and filename = $filename", data, function(err, row) {
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

var processArgs = function() {
    var argv = require('minimist')(process.argv.slice(2));
    app = argv.a;
    path_stem = argv.s;
    argv._.forEach(function (val, index, array) {
        if (index > 1) {
            //console.log("index: " + index + " val: " + val);
            try {
                if (!fs.lstatSync(val).isDirectory()) {
                    var content = fs.readFileSync(val);
                    jsParser(content, val);
                }
            } catch (err) {
                console.log("ERROR:" + val + ":" + err);
            }
        }
    });
};

var ddl = function() {
    db.serialize(function() {
        db.run("create table if not exists code(codeid integer primary key autoincrement, app varchar(10), filename varchar(20))");
        db.run("create table if not exists uses(usesid integer primary key autoincrement, codeid integer, module varchar(20))");
        processArgs();
    });
};

db = new sqlite3.Database('db.sqlite', ddl);
