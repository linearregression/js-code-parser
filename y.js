/**
 * Created by sumeet on 8/14/15.
 */

var readContents = require('./f.js');
var fs = require('fs');
var appConfig = JSON.parse(fs.readFileSync('app-conf.json', 'utf8'));

var db;

function associate() {
    db.serialize(function () {
        appConfig.applications.forEach(function (app) {
            console.log("came in with app: " + app.name);
            db.each("select distinct u.module from uses u, code c where c.app = $app and u.codeid = c.codeid order by u.module",
                {$app: app.name}, function (err, mrow) {

                    console.log("app: " + app.name + " module: " + util.inspect(mrow, {showHidden: true, depth: null}));

                    if (err) {
                        console.log("ERROR:" + app.name + ":" + err + ":fetching distinct modules");
                        return;
                    }

                    readContents(app.shared, mrow.module + '.js', app.skip, function (err, filename) {
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
}


db = new sqlite3.Database('db.sqlite', associate);
