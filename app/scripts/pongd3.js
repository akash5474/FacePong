'use strict';

var videoInput = document.getElementById('inputVideo');
var canvasInput = document.getElementById('inputCanvas');

var htracker = new headtrackr.Tracker();
htracker.init(videoInput, canvasInput);
htracker.start();

var arenaWidth = 500, arenaHeight = 500;

var svg = d3.select('#arena')
            .append('svg')
            .attr({
              'width': arenaWidth,
              'height': arenaHeight
            });

var Paddle = function() {
  this.height = 10, this.width = 80;
  this.paddle = svg.append('rect')
                   .classed('paddle', true)
                   .attr({
                     'height': this.height,
                     'width': this.width
                   });
};

Paddle.prototype.updatePos = function(x, y) {
  if ( x - ( this.width / 2 ) <= 1 ) {
    x = 1;
  } else if ( x >= arenaWidth - 1 - ( this.width / 2 ) ) {
    x = arenaWidth - this.width - 1;
  } else {
    x -= this.width / 2;
  }

  this.paddle.attr({
          x: x,
          y: y - ( this.height / 2 )
        });
};

var makeArena = function() {
  var strokeWidth = 4

  // Left Boundary

  svg.append('line')
     .attr({
       'x1': 2,
       'x2': 2,
       'y1': 0,
       'y2': arenaHeight,
       'stroke-width': strokeWidth,
       'stroke': 'black'
     });

  // Right Boundary

  svg.append('line')
     .attr({
       'x1': arenaWidth - 2,
       'x2': arenaWidth - 2,
       'y1': 0,
       'y2': arenaHeight,
       'stroke-width': strokeWidth,
       'stroke': 'black'
     });

  // Top Boundary

  svg.append('line')
     .attr({
       'x1': 0,
       'x2': arenaWidth,
       'y1': 2,
       'y2': 2,
       'stroke-width': strokeWidth,
       'stroke': 'black'
     });

  // Bottom Boundary

  svg.append('line')
     .attr({
       'x1': 0,
       'x2': arenaWidth,
       'y1': arenaHeight - 2,
       'y2': arenaHeight - 2,
       'stroke-width': strokeWidth,
       'stroke': 'black'
     });

  // Middle Line

  svg.append('line')
     .attr({
       'x1': 4,
       'x2': arenaWidth - 4,
       'y1': ( arenaHeight / 2 ) - 2,
       'y2': ( arenaHeight / 2 ) - 2,
       'stroke-width': strokeWidth,
       'stroke': 'grey'
     });
};

makeArena();

var player1 = new Paddle();
var player2 = new Paddle();

player1.updatePos(arenaWidth / 2, arenaHeight - 15);
player2.updatePos(arenaWidth / 2, 15);

document.addEventListener('facetrackingEvent', function(ev) {
  player1.updatePos(ev.x * 2, arenaHeight - 15);
  player2.updatePos(ev.x * 2, 15);
});