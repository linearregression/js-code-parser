/**
 * Created by sumeet on 8/26/15.
 */
'use strict';

var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var filename = process.argv[2];
//console.log('Processing', filename);
var ast = esprima.parse(fs.readFileSync(filename), {loc: true});

var defineStatements = [];
var configStatements = [];
var firstEntry = '';

console.log("[");
estraverse.traverse(ast, {
    enter: enter,
    leave: function(node) {}
});
console.log("]");

function isDefine(node) {
    return (
    node.type === 'CallExpression'
    && node.callee.type === 'Identifier'
    && (node.callee.name === 'define' || node.callee.name === 'require'));
}

function isConfig(node) {

    // define or require need a non 0 length array argument

    return (
    node.type === 'CallExpression'
    && node.callee.object
    && node.callee.object.name === 'require'
    && node.callee.property.name === 'config');
}

function printEntry(entry) {
    console.log(firstEntry + JSON.stringify(entry, null, 2));
    if (firstEntry === '') {
        firstEntry = ',';
    }
}

function processDefine(node) {
    if (defineStatements.length == 0) {
        return;
    }

    if ( node.type === 'ArrayExpression') {

        node.elements.forEach(function (module) {

            if (!module.raw) {
                console.error("ERROR: file: " + filename + " module json: " + JSON.stringify(module, null, 2));
            } else {
                printEntry({
                    type: 'uses',
                    name: module.value
                });
            }

        });

        defineStatements.pop();
    } else if (node.type === 'CallExpression'
                && node.callee.type === 'Identifier'
                && node.callee.name === 'require') {
        printEntry({
            type: 'uses',
            name: node.arguments[0].value
        });

        if (!node.arguments[0].raw) {
            console.error("ERROR: file: " + filename + " arguments json: " + JSON.stringify(arguments, null, 2));
        }

        defineStatements.pop();
    }
}

function processConfig(node) {
    if (configStatements.length == 0 || node.type !== 'Property' || node.key.name !== 'paths') {
        return;
    }

    //console.error("config node: " + JSON.stringify(node, null, 2));

    node.value.properties.forEach(function(shortcut) {
        //console.error("config node: " + JSON.stringify(shortcut, null, 2));
        var name = shortcut.key.type === 'Identifier'? shortcut.key.name : shortcut.key.value;
        /*
        if (!name) {
            name = shortcut.key.name
        }
         */
        printEntry({
            type: 'shortcut',
            name: name,
            value: shortcut.value.value
        });
    });

    configStatements.pop();
}

function enter(node){
    //console.log("node: " + JSON.stringify(node, null, 2));
    processDefine(node);

    processConfig(node);

    if (isDefine(node)) {
        //console.log("defined");
        defineStatements.push("hey");
    }

    if (isConfig(node)) {
        //console.log("configured");
        configStatements.push("hey");
    }

}
