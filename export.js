// expose all indexed packages

var bio = require('./index');

var modules = {};
for(var key in bio){
  modules[key] = require(bio[key]);
}

module.exports = modules;
