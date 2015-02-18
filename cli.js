#!/usr/bin/env node

var bio = require('./index');
var spawn = require('child_process').spawn;
var minimist = require('minimist');
var _ = require('lodash');


var minimistOptions = {
  alias: {
    help: 'h'
  }
};

var argv = minimist(process.argv.slice(2), minimistOptions);

if (argv.help || argv._.length === 0) {
  console.log("Please check the documentation at http://doc.bionode.io");
}

var component = argv._[0];

var matches = _.filter(bio, function(v, k) {
  return k.indexOf(component) >= 0;
});

if (matches.length > 1) {
  console.log("Your selection is not unique - please enter more chars");
  console.log(matches);
  process.exit(1);
}
if (matches.length === 0) {
  console.log("Your selection is invalid. Available components are:");
  console.log(_.keys(bio).join("\n"));
  process.exit(1);
}

var comPath = __dirname + "/node_modules/" + matches[0] + "/";
var config = require(comPath + "package.json");
if (!("bin" in config) || _.keys(config.bin).length == 0) {
  console.log("The component doesn't provide a binary.");
  process.exit(1);
}
// FIXME: we only pick the first binary 
var binPath = config.bin[_.keys(config.bin)[0]];

var path = comPath + binPath;
var args = argv._.slice(1);
var cli = spawn(path, args);

cli.stdout.pipe(process.stdout);
cli.stderr.pipe(process.stderr);

if (!process.stdin.isTTY) {
  process.stdin.pipe(cli.stdin);
} else {
  cli.stdin.end();
}
