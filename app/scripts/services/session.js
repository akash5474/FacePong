'use strict';

angular.module('facePongApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
