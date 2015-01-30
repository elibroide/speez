// client.js

var com;
(function(window){
    com = $.extend({ speez: {} }, com);
})(window);

var preloadAvatar;
var detector;
var gameOrientation = 'portrait';
var originalWidth;
var originalWidthCenter;
var originalHeight;
var originalHeightCenter;
var config;
var socket;
var game;
var stage;
var player;
var world;
var Layout = com.Layout;
var gameCount = 0;
var palette = [
    0xFFD646,
    0x019AFF,
    0xEA1D00,
    0xC500EE,
    0x36DE49,
];
var avatarNames = [
    "Zumi",
    "Ziki",
    "ZaZok",
    "ZoZo",
    "Zoor",
    "Zeeps",
    "Zot",
];

function init(){

    // set config
    config = {
        dpr: window.devicePixelRatio,
        width: 640,
        height: 960,
        isLocal: true,
        platform: platformType,
        isPlayer: platformType === 'player' || platformType === 'mobile',
        isPackage: window.location.protocol.indexOf('file') > -1,
        version: gameVersion,
        isUnderConstruction: isUnderConstruction && window.location.hash.indexOf('user=bb') === -1 && window.location.protocol.indexOf('file') === -1,
    }

    // set size
    originalWidth = config.width;
    originalHeight = config.height;
    originalWidthCenter = originalWidth * 0.5;
    originalHeightCenter = originalHeight * 0.5;

    // set address
    if(config.isPackage){
        config.address = 'http://speez.herokuapp.com/';
        config.isPackage = true;
    } else {
        config.address = window.location.origin + '/';
        config.isPackage = false;
    }
    config.isLocal = config.address.indexOf('localhost') > -1;
    var script = $('<script>').attr('type', 'text/javascript').attr('src', config.address + 'socket.io/socket.io.js')
    $('head').append(script);

    // initiate singletones
    var audio = new Audio();
    game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '');
    game.stageColor = function(color){
        if(color !== undefined){
            game.stage.backgroundColor = common.getRgb(color);
        }
        return game.stage.backgroundColor;
    }

    // debug config
    console.log(config);

    // load game states
    game.state.add('boot', bootState);
    if(config.isUnderConstruction){
        game.state.add('mail', mailState);
    } else {
        game.state.add('preload', preloadState);
        game.state.add('main', mainState);
        game.state.add('player', playerState);
        game.state.add('playerFinish', playerFinishState);
        game.state.add('lobby', lobbyState);
        game.state.add('lobbyPlayer', lobbyPlayerState);
        game.state.add('stage', stageState);
        game.state.add('stageFinish', stageFinishState);
    }
    game.state.start('boot');
}



