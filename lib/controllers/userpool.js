'use strict';

var pool = [];

var connect = function(userHost, userClient, hostRes) {
  // setTimeout(function() {
    hostRes.json({ oppId: userClient });
    // userClient.res.json({ oppId: userHost.id });
    // userClient.res.send(200);
  // }, 2000);
};

exports.addUserToPool = function(req, res, next) {

  var userId = req.params.id;

  console.log('pool added user', userId);

  if ( pool.indexOf(userId) === -1 ) {
    pool.push(userId);
  }

  console.log('current pool length', pool.length);

  if ( pool.length > 1 ) {
    connect( pool[1], pool[0], res );
    pool.shift();
    pool.shift();
    console.log(pool.length);
  } else {
    res.send(200);
  }
};

exports.removeUserFromPool = function(userId) {
  var idx = pool.indexOf(userId);

  pool.splice(idx, 1);
  console.log('User removed from pool', userId);
  console.log('Pool length', pool.length);
};