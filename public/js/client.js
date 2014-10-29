// client.js

var com;
(function(window){
    com = $.extend({ speez: {} }, com);
})(window);

var originalWidth = 960;
var originalWidthCenter = originalWidth * 0.5;
var originalHeight = 640;
var originalHeightCenter = originalHeight * 0.5;
var config;
var socket;
var game;
var stage;
var player;
var world;
var Layout = com.Layout;

var version = '0.0.0-1';

function initGame(){

    console.log('ver: ' + version);

    config = {
        dpr: window.devicePixelRatio,
        width: originalWidth,
        height: originalHeight,
        isLocal: true,
    }
    game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'container');

    game.state.add('boot', bootState);
    game.state.add('main', mainState);
    game.state.add('player', playerState);
    game.state.add('lobby', lobbyState);
    game.state.add('stage', stageState);
    game.state.start('boot');
}
window.addEventListener('load', initGame);