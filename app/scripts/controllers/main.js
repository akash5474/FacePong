'use strict';

angular.module('facePongProdApp')
  .controller('MainCtrl', function ($scope, $http, PaddleFactory, BallFactory, ArenaFactory, CameraFactory, GameTextFactory) {

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

    var Paddle = PaddleFactory;
    var Ball = BallFactory;
    var ArenaText = GameTextFactory;
    var makeArena = ArenaFactory;
    var startCam = CameraFactory;

    makeArena(svg, arenaWidth, arenaHeight);

    var paddle1 = new Paddle('top', svg);
    var paddle2 = new Paddle('bottom', svg);
    var gameBall = new Ball(svg, arenaWidth, arenaHeight);
    var gameText = new ArenaText(svg, 'Allow Camera Access', arenaWidth, arenaHeight);
    gameText.display();

    paddle1.updatePos(arenaWidth / 2, arenaHeight - 15, arenaWidth);
    paddle2.updatePos(arenaWidth / 2, 15, arenaWidth);

    function run() {
      gameText.text = 'Starting Point!'
      peerConnToMe.send({start: true});
      gameText.display();
      setTimeout(function() {
        gameText.remove();
      }, 2000);
      setTimeout(function() {
        var prevRunTime = Date.now();
        d3.timer(function() {
          var now = Date.now();
          var scored = gameBall.move( now - prevRunTime, $scope, peerConnToMe, paddle1, paddle2 );

          prevRunTime = now;
          // d3TimerInterval = 200;

          if ( scored ) {
            d3.select('.ball').remove();
            // d3TimerInterval = 50;
            gameBall = new Ball(svg, arenaWidth, arenaHeight);
            if ( $scope.score.score.host < 5 && $scope.score.score.client < 5 ) {
              run();
            } else {
              if ( $scope.score.score.host === 5 ) {
                gameText.text = 'YOU WIN!'
                gameText.display();
                peerConnToMe.send({ result: 'lose' });
              } else {
                gameText.text = 'YOU LOSE!'
                gameText.display();
                peerConnToMe.send({ result: 'win' });
              }
            }
          }

          return scored;
        }, 50);
      }, 3000);
    };

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
        paddle1.updatePos(x, arenaHeight - 15, arenaWidth);
      } else {
        paddle2.updatePos(x, 15, arenaWidth);
      }

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
          gameText.remove();
          gameText.text = 'Finding Opponent...';
          $scope.disableJoins = false;
        });
      }
    });

    $scope.playerPeer = {'myId': ''};

    $scope.peerIdInput = { 'id': '' };
    // $scope.sendData;

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
        gameText.text = 'Opponent Found!';
        gameText.display();
        peerConnToMe = peer.connect(conn.peer);
        $scope.connected = true;

        if ( $scope.host ) {
          run();
          $scope.running = true;
        } else {
          gameText.text = 'Starting Point!'
          gameText.display();
          setTimeout(function() {
            gameText.remove();
          }, 2000);
        }
        // startCam();
      }

      conn.on('data', function(data) {
        // console.log(data);
        if ( data.faceMove ) {
          if ( $scope.host ) {
            paddle2.updatePos(data.faceMove, 15, arenaWidth);
          } else {
            paddle1.updatePos(data.faceMove, arenaHeight - 15, arenaWidth);
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
            gameBall = new Ball(svg, arenaWidth, arenaHeight);
          }
        } else if ( data.start ) {
          gameText.text = 'Starting Point!'
          gameText.display();
          setTimeout(function() {
            gameText.remove();
          }, 2000);
        } else if ( data.result ) {
          if ( data.result === 'win' ) {
            gameText.text = 'YOU WIN!'
            gameText.display();
          } else if ( data.result === 'lose' ) {
            gameText.text = 'YOU LOSE!'
            gameText.display();
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
      gameText.display();
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
