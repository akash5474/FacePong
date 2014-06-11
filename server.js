
'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

var PeerServer = require('peer').PeerServer;
var removeUserFromPool = require('./lib/controllers/userpool').removeUserFromPool;

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

// Populate empty DB with sample data
require('./lib/config/dummydata');

// Passport Configuration
var passport = require('./lib/config/passport');

// Setup Express
var app = express();
require('./lib/config/express')(app);
require('./lib/routes')(app);

// Start server
app.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));

  var peerServer = new PeerServer({port:3000, path:'/arena'});

  peerServer.on('connection', function(id) {
    console.log('Connection from ' + id);
  });

  peerServer.on('disconnect', function(id) {
    console.log('Disconnect of ' + id);
    removeUserFromPool(id);
  });
});

// Expose app
exports = module.exports = app;
