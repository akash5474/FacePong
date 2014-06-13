'use strict';

angular.module('facePongProdApp')
  .factory('ArenaFactory', function () {

    var makeArena = function(svg, arenaWidth, arenaHeight) {
      var strokeWidth = 4

      // Background
      svg.append('rect')
         .classed('pongTable', true)
         .attr({
           height: arenaHeight,
           width: arenaWidth,
         })
         .style('fill', 'black');

      // Left Boundary
      svg.append('line')
         .attr({
           'x1': 2,
           'x2': 2,
           'y1': 0,
           'y2': arenaHeight,
           'stroke-width': strokeWidth,
           'stroke': 'lightgrey'
         });

      // Right Boundary
      svg.append('line')
         .attr({
           'x1': arenaWidth - 2,
           'x2': arenaWidth - 2,
           'y1': 0,
           'y2': arenaHeight,
           'stroke-width': strokeWidth,
           'stroke': 'lightgrey'
         });

      // Top Boundary
      svg.append('line')
         .attr({
           'x1': 0,
           'x2': arenaWidth,
           'y1': 2,
           'y2': 2,
           'stroke-width': strokeWidth,
           'stroke': 'lightgrey'
         });

      // Bottom Boundary
      svg.append('line')
         .attr({
           'x1': 0,
           'x2': arenaWidth,
           'y1': arenaHeight - 2,
           'y2': arenaHeight - 2,
           'stroke-width': strokeWidth,
           'stroke': 'lightgrey'
         });

      // Middle Line
      svg.append('line')
         .attr({
           'x1': 4,
           'x2': arenaWidth - 4,
           'y1': ( arenaHeight / 2 ) - 2,
           'y2': ( arenaHeight / 2 ) - 2,
           'stroke-width': strokeWidth,
           'stroke': 'lightgrey'
         });
    };

    return makeArena;
  });
