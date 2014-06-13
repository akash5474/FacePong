'use strict';

angular.module('facePongProdApp')
  .factory('CameraFactory', function () {

    return (function() {

      var camNotStarted = true;

      return function() {
        if ( camNotStarted ) {
          camNotStarted = false;
          var videoInput = document.getElementById('inputVideo');
          var canvasInput = document.getElementById('inputCanvas');

          var htracker = new headtrackr.Tracker();
          htracker.init(videoInput, canvasInput);
          htracker.start();
        }
      };
    })();
  });
