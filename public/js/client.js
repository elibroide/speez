// client.js

var com;
(function(window){
    com = $.extend({ speez: {} }, com);
})(window);

var originalWidth = 640;
var originalWidthCenter = originalWidth * 0.5;
var originalHeight = 960;
var originalHeightCenter = originalHeight * 0.5;
var config;
var socket;
var game;
var stage;
var player;
var world;
var Layout = com.Layout;

var version = '0.0.0-10';

function init(){

    console.log('ver: ' + version);

    config = {
        dpr: window.devicePixelRatio,
        width: originalWidth,
        height: originalHeight,
        isLocal: true,
    }
    config.address = document.URL;
    if(config.address.indexOf('file') === 0){
        config.address = 'http://speez.herokuapp.com/';
    }
    var script = $('<script>').attr('type', 'text/javascript').attr('src', config.address + 'socket.io/socket.io.js')
    $('head').append(script);

    // initiate singletones
    var audio = new Audio();

    game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'container');

    game.state.add('boot', bootState);
    game.state.add('preload', preloadState);
    game.state.add('main', mainState);
    game.state.add('player', playerState);
    game.state.add('playerFinish', playerFinishState);
    game.state.add('lobby', lobbyState);
    game.state.add('stage', stageState);
    game.state.add('stageFinish', stageFinishState);
    game.state.start('boot');
}
// window.addEventListener('load', initGame);