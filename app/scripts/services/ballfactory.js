'use strict';

angular.module('facePongApp')
  .factory('BallFactory', function () {
    var Ball = function(svg, arenaWidth, arenaHeight, scope) {
      this.radius = 6;
      this.paddleHits = 0;
      this.peerConnToMe;
      this.$scope = scope;
      this.ball = svg.append('circle')
                     .classed('ball', true)
                     .attr({
                       r: this.radius,
                       cx: ( arenaWidth / 2 ) - ( this.radius / 2 ),
                       cy: ( arenaHeight / 2 ) - ( this.radius / 2 )
                     });

      // Scale to turn math.random between -1 & 1
      var scale = d3.scale.linear().domain([0, 1]).range([-1, 1]);
      var vecX = scale(Math.random()), vecY = scale(Math.random());

      while ( (vecX < .2 && vecX > -.2) || (vecY < .25 && vecY > -.25) ) {

        if ( vecX < .2 && vecX > -.2 ) {
          vecX = scale(Math.random());
        }
        if ( vecY < .25 && vecY > -.25 ) {
          vecY = scale(Math.random());
        }
      }

      this.vector = {
        x: vecX,
        y: vecY
      };

      this.speed = {
        x: 16,
        y: 16
      };
    };

    Ball.prototype.hasHitPaddle = function(paddle) {
      // debugger;
      var ballX = +this.ball.attr('cx');
      var paddleX = +paddle.paddle.attr('x');
      var paddleWidth = +paddle.paddle.attr('width');

      // top && bottom
      return ballX + this.radius > paddleX && ballX + this.radius < paddleX + paddleWidth;
    };

    Ball.prototype.increaseSpeed = function() {
      this.paddleHits++;

      if ( this.speed.y < 100 && this.paddleHits && this.paddleHits % 3 === 0 ) {
        this.speed.y += 8;
        this.speed.x += 4;
      }
    };

    Ball.prototype.checkCollision = function(ballX, ballY) {
      var ball = this.ball;
      var ballX = +ball.attr('cx');
      var ballY = +ball.attr('cy');
      var topPaddle = paddle1;
      var bottomPaddle = paddle2;

      // Collision with left or right sides
      if ( ballX - this.radius < 6 ) {
        this.vector.x = -this.vector.x;
        ball.attr({
          cx: 7 + this.radius,
          cy: ballY
        });
      } else if ( ballX + this.radius > arenaWidth - 6 ) {
        this.vector.x = -this.vector.x;
        ball.attr({
          cx: arenaWidth - 7 - this.radius,
          cy: ballY
        });
      }

      // Collision with bottom paddle
      if ( ballY + this.radius > +topPaddle.paddle.attr('y') ) {
        if ( this.hasHitPaddle(topPaddle) ) {
          // console.log('bottom paddle collision');
          this.vector.y = -this.vector.y;
          ball.attr({
            cx: ballX,
            cy: +topPaddle.paddle.attr('y') - this.radius - 1
          });
          this.increaseSpeed();
        } else if ( ballY > +topPaddle.paddle.attr('y') + +topPaddle.paddle.attr('height') ) {
          // console.log('collision with bottom of arena');

          this.$scope.$apply(function() {
            this.$scope.score.score.client++;
          });

          // console.log(this.$scope.score);
          this.peerConnToMe.send(this.$scope.score);
          return 'top';
        }
      }

      // Collision with top paddle
      if ( ballY - this.radius < +bottomPaddle.paddle.attr('y') + +bottomPaddle.paddle.attr('height')/2 ) {
        if ( this.hasHitPaddle(bottomPaddle) ) {
          // console.log('top paddle collision');
          this.vector.y = -this.vector.y;
          ball.attr({
            cx: ballX,
            cy: +bottomPaddle.paddle.attr('y') + this.radius + +bottomPaddle.paddle.attr('height') + 1
          });
          this.increaseSpeed();
        } else if ( ballY < +bottomPaddle.paddle.attr('y') ) {
          // console.log('collision with top of arena');

          this.$scope.$apply(function() {
            this.$scope.score.score.host++;
          });

          // console.log(this.$scope.score)
          this.peerConnToMe.send(this.$scope.score);
          return 'bottom';
        }
      }

      return false;
    };

    Ball.prototype.move = function(delta_t) {
      var fps = delta_t > 0 ? ( delta_t / 100 ) : 1;
      var ball = this.ball;
      var ballX = +ball.attr('cx');
      var ballY = +ball.attr('cy');

      var newCX = ballX + ( this.vector.x * this.speed.x * fps );
      var newCY = ballY + ( this.vector.y * this.speed.y * fps );

      this.ball.attr({
        cx: newCX,
        cy: newCY
      });

      if ( this.$scope.host ) {
        this.peerConnToMe.send( {'ball': { cx: newCX, cy: newCY } } );
      }

      // debugger;
      var scored = this.checkCollision(ballX, ballY);

      if ( scored ) {
        return true;
      }

      return false;
    };

    return Ball;
  });
