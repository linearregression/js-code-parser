var fs = require('fs');
var esprima = require('esprima');

var parser = function(content, fname) {
  try {
    var json = esprima.parse(content);
  } catch(err) {
    throw "ERROR:" + fname + ":parsing:" + err;
  }

  //console.log(JSON.stringify(json, null, 2));
  //

  try {
    if (json.body[0]
        && json.body[0].type === 'ExpressionStatement' 
        && json.body[0].expression.type == 'CallExpression'
        && json.body[0].expression.callee.name == 'define') {
      var expr = json.body[0].expression;
      if (expr.arguments[0].type == 'FunctionExpression') {
        console.log("ERROR:" + fname + ":define is passing in require");
	return;
      }
      var args = json.body[0].expression.arguments[0].elements;
      args.forEach(function(val, index, array) {
        console.log(val.value);
      });
      //console.log(args);
    }
  } catch(err) { 
   console.log(JSON.stringify(json, null, 2));
   throw fname + ":reading:" + err;
  }
};

process.argv.forEach(function (val, index, array) {
  if (index > 1) {
    //console.log("index: " + index + " val: " + val);
    try {
      if (!fs.lstatSync(val).isDirectory()) {
        var content = fs.readFileSync(val);
        parser(content, val);
      }
    } catch(err) {
      console.log("ERROR:" + val + ":" + err);
    }
  }
});
