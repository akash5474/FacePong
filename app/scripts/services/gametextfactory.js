'use strict';

angular.module('facePongProdApp')
  .factory('GameTextFactory', function () {

    var GameText = function(svg, text, arenaWidth, arenaHeight) {
      this.svg = svg;
      this.text = text;
      this.arenaWidth = arenaWidth;
      this.arenaHeight = arenaHeight;
      this.svgText;
    }

    GameText.prototype.display = function() {
      this.remove();
      this.svgText = this.svg.append('text')
              .classed('game-text', true)
              .attr('text-anchor', 'middle')
              .attr('x', this.arenaWidth / 2)
              .attr('y', this.arenaHeight / 3)
              .text(this.text)
              .attr('font-family', 'Baumans')
              .attr('font-size', '40px')
              .attr('fill', 'white');
    };

    GameText.prototype.remove = function() {
      d3.select('.game-text').remove();
    };

    return GameText;
  });
