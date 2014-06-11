'use strict';

angular.module('facePongApp')
  .controller('ArenaCtrl', function ($scope, $http) {

    var arenaWidth = 500, arenaHeight = 500;

    var svg = d3.select('#arena')
                .append('svg')
                .attr({
                  'width': arenaWidth,
                  'height': arenaHeight
                });

    $scope.host = false;

    $scope.connected = false;

    $scope.disableJoins = true;

    $scope.running = false;

    $scope.score = { score: { host: 0, client: 0 } };

    var Paddle = function(side) {
      this.height = 10, this.width = 80;
      this.paddle = svg.append('rect')
                       .classed('paddle', true)
                       .classed(side + '_paddle', true)
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

    var Ball = function() {
      this.radius = 6;
      this.paddleHits = 0;
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

          $scope.$apply(function() {
            $scope.score.score.client++;
          });

          // console.log($scope.score);
          peerConnToMe.send($scope.score);
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

          $scope.$apply(function() {
            $scope.score.score.host++;
          });

          // console.log($scope.score)
          peerConnToMe.send($scope.score);
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

      // paddle1.updatePos(ballX, arenaHeight - 15);
      // paddle2.updatePos(ballX, 15);

      var newCX = ballX + ( this.vector.x * this.speed.x * fps );
      var newCY = ballY + ( this.vector.y * this.speed.y * fps );

      this.ball.attr({
        cx: newCX,
        cy: newCY
      });

      if ( $scope.host ) {
        peerConnToMe.send( {'ball': { cx: newCX, cy: newCY } } );
      }

      // debugger;
      var scored = this.checkCollision(ballX, ballY);

      if ( scored ) {
        return true;
      }

      return false;
    };

    var makeArena = function() {
      var strokeWidth = 4

      // Background
      svg.append('rect')
         .classed('pongTable', true)
         .attr({
           height: arenaHeight,
           width: arenaWidth
         });

      // Left Boundary
      svg.append('line')
         .attr({
           'x1': 2,
           'x2': 2,
           'y1': 0,
           'y2': arenaHeight,
           'stroke-width': strokeWidth,
           'stroke': 'grey'
         });

      // Right Boundary
      svg.append('line')
         .attr({
           'x1': arenaWidth - 2,
           'x2': arenaWidth - 2,
           'y1': 0,
           'y2': arenaHeight,
           'stroke-width': strokeWidth,
           'stroke': 'grey'
         });

      // Top Boundary
      svg.append('line')
         .attr({
           'x1': 0,
           'x2': arenaWidth,
           'y1': 2,
           'y2': 2,
           'stroke-width': strokeWidth,
           'stroke': 'grey'
         });

      // Bottom Boundary
      svg.append('line')
         .attr({
           'x1': 0,
           'x2': arenaWidth,
           'y1': arenaHeight - 2,
           'y2': arenaHeight - 2,
           'stroke-width': strokeWidth,
           'stroke': 'grey'
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

    // var d3TimerInterval = 50;

    function run() {
      setTimeout(function() {
        var prevRunTime = Date.now();

        d3.timer(function() {
          var now = Date.now();
          var scored = gameBall.move( now - prevRunTime );

          prevRunTime = now;
          // d3TimerInterval = 200;

          if ( scored ) {
            d3.select('.ball').remove();
            // d3TimerInterval = 50;
            gameBall = new Ball();
            if ( $scope.score.score.host < 5 && $scope.score.score.client < 5 ) {
              run();
            }
          }

          return scored;
        }, 50);
      }, 3000);
    };

    makeArena();

    var paddle1 = new Paddle('top');
    var paddle2 = new Paddle('bottom');
    var gameBall = new Ball();

    paddle1.updatePos(arenaWidth / 2, arenaHeight - 15);
    paddle2.updatePos(arenaWidth / 2, 15);

    var myConn;

    document.addEventListener('facetrackingEvent', function(ev) {

      var evX = ev.x;

      if ( evX <= 90 ) {
        evX = 90;
      } else if ( evX >= 310 ) {
        evX = 310;
      }

      // console.log('evX', evX);

      var paddleMoveScale = d3.scale.linear().domain([90, 310]).range([500, 0]);

      var x = paddleMoveScale( evX );

      // console.log('x', x);
      if ( $scope.host ) {
        paddle1.updatePos(x, arenaHeight - 15);
      } else {
        paddle2.updatePos(x, 15);
      }
      // myConn.send({'xPos': x});
      if ( $scope.connected ) {
        peerConnToMe.send({'faceMove': x});
      }
    });

    document.addEventListener('headtrackrStatus', function(ev) {
      if ( ev.status === 'found' ) {
        // gameBall = new Ball();
        // if ( $scope.host && $scope.connected && !$scope.running ) {
        //   console.log('headtrackr status found... running game');
        //   run();
        //   $scope.running = true;
        // }
      } else if ( ev.status === 'camera found' ) {
        $scope.$apply(function() {
          $scope.disableJoins = false;
        });
      }
    });

    $scope.playerPeer = {'myId': ''};

    $scope.peerIdInput = { 'id': '' };
    $scope.sendData;

    var startCam = (function() {

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

    startCam();

    // console.log(location.hostname);

    var peer = new Peer({host: location.hostname, port: 3000, path: '/arena'});
    var peerConnToMe;

    peer.on('open', function(id) {
      $scope.playerPeer.myId = id;
      angular.element('#myPeerId').html('Your id is: <strong>' + id + '</strong>');
    });

    peer.on('connection', function(conn) {

      // Connect back to peer
      if ( !peerConnToMe ) {
        console.log('peer has connected to me', conn.peer);
        peerConnToMe = peer.connect(conn.peer);
        $scope.connected = true;
        if ( $scope.host ) {
          run();
          $scope.running = true;
        }
        // startCam();
      }

      conn.on('data', function(data) {
        // console.log(data);
        if ( data.faceMove ) {
          if ( $scope.host ) {
            paddle2.updatePos(data.faceMove, 15);
          } else {
            paddle1.updatePos(data.faceMove, arenaHeight - 15);
          }
        } else if ( data.ball ) {
          if ( !$scope.host ) {
            gameBall.ball.attr({
              cx: data.ball.cx,
              cy: data.ball.cy
            });
          }
        } else if ( data.score ) {
          if ( !$scope.host ) {
            // console.log(data.score);
            $scope.$apply(function() {
              $scope.score = { score: data.score };
            });
            d3.select('.ball').remove();
            gameBall = new Ball();
          }
        }
      });

      conn.on('close', function() {
        console.log('closed data connection');
      });

      conn.on('error', function(err) {
        alert(err);
      });
    });

    // var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    // peer.on('call', function(call) {
    //   console.log('call received');
    //   getUserMedia({video: true, audio: false}, function(stream) {
    //     call.answer(stream); // Answer the call with an A/V stream.
    //     call.on('stream', function(remoteStream) {
    //       // Show stream in some video/canvas element.
    //       console.log('streaming video');
    //     });
    //   }, function(err) {
    //     console.log('Failed to get local stream' ,err);
    //   });
    // });

    peer.on('error', function(err) {
      alert(err.message);
    });

    $scope.connectToPeer = function(peerId) {
      var oppId = peerId || $scope.peerIdInput.id;
      var conn = peer.connect(oppId);
      if ( oppId ) {
        $scope.host = true;
        console.log('This is the host');
      }
    };

    $scope.joinGame = function() {

      if ( $scope.connected ) {
        console.log('Already connected');
        return;
      }

      $http.get('/arena/joinpool/' + $scope.playerPeer.myId ).success(function(data) {
        // console.log('frontend peer joining pool', $scope.playerPeer.myId);
        // console.log('opponent id', data.oppId);
        if ( data.oppId ) {
          $scope.connectToPeer(data.oppId);

          // var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          // getUserMedia({video: true, audio: false}, function(stream) {
          //   console.log('call sent');
          //   var call = peer.call(data.oppId, stream);
          //   call.on('stream', function(remoteStream) {
          //     // Show stream in some video/canvas element.
          //     console.log('streaming video');
          //   });
          // }, function(err) {
          //   console.log('Failed to get local stream' ,err);
          // });
        }
      });
    };

    // $scope.sendData = function() {
    //   peerConnToMe.send({'testData': 'Testing 1 2 3...'});
    // };


  });
