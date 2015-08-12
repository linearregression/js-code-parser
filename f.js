/**
 * Created by sumeet on 8/12/15.
 */
'use strict';

var fs = require('fs');

    function readContents(dir, ext, callback) {
        var list = fs.readdirSync(dir);

        list.forEach(function (entry) {
            var fullpath = dir + "/" + entry;
            if (fs.lstatSync(fullpath).isDirectory()) {
                readContents(fullpath, ext, callback);
            } else if (fullpath.indexOf(ext, fullpath.length - ext.length) !== -1) {
                if (callback.length === 2) {
                    callback(null, fullpath);
                } else {
                    callback(null, fullpath, fs.readFileSync(fullpath));
                }
            }
        });
    };

module.exports = readContents;
