
'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs');

var PeerServer = require('peer').PeerServer;
var removeUserFromPool = require('./lib/controllers/userpool').removeUserFromPool;

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');

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
