'use strict';

var videoInput = document.getElementById('inputVideo');
var canvasInput = document.getElementById('inputCanvas');

var htracker = new headtrackr.Tracker();
htracker.init(videoInput, canvasInput);
htracker.start();

var arenaWidth = 600, arenaHeight = 400;

var svg = d3.select('#arena')
            .append('svg')
            .attr({
              'width': arenaWidth,
              'height': arenaHeight
            });

var Paddle = function() {
  var height = 10, width = 80;
  var paddle = svg.append('rect')
                .classed('paddle', true)
                .attr({
                  'height': height,
                  'width': width
                });

  var update = function(x, y) {
    console.log(x);
    if ( x - ( width / 2 ) <= 1 ) {
      x = 1;
    } else if ( x >= arenaWidth - 1 - ( width / 2 ) ) {
      x = arenaWidth - width - 1;
    } else {
      x -= width / 2;
    }

    paddle.attr({
            x: x,
            y: y
          });

    return update;
  }

  return update;
};

var player1 = {
  paddle: Paddle()(arenaWidth/2, 390)
};

var player2 = {
  paddle: Paddle()(arenaWidth/2, 10)
}

document.addEventListener('facetrackingEvent', function(ev) {
  player1.paddle(ev.x*2, 390);
});