// expose all indexed packages

var bio = require('./index');

var modules = {};
for(var key in bio){
  modules[key] = require(bio[key]);
}

modules.VERSION = require('./package.json').version; // this will load the entire package json
module.exports = modules;
