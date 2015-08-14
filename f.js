/**
 * Created by sumeet on 8/12/15.
 */
'use strict';

var fs = require('fs');

    function readContents(dir, ext, skip, callback) {
        var list = fs.readdirSync(dir);

        if (skip.indexOf(dir) !== -1)
            return;

        list.forEach(function (entry) {
            var fullpath = dir + "/" + entry;
            if (fs.lstatSync(fullpath).isDirectory()) {
                readContents(fullpath, ext, skip, callback);
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
