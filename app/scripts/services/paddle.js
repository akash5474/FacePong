'use strict';

angular.module('facePongApp')
  .factory('paddle', function () {

    var Paddle = function(side, svg) {
      this.height = 10, this.width = 80;
      this.paddle = svg.append('rect')
                       .classed('paddle', true)
                       .classed(side + '_paddle', true)
                       .attr({
                         'height': this.height,
                         'width': this.width
                       });
    };

    Paddle.prototype.updatePos = function(x, y, arenaWidth) {
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

    return Paddle;
  });
