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
    }

    // Identify FireTV
    config.isFireTV = window.location.hash.toLowerCase().indexOf('type=firetv') !== -1;

    config.isPlayer = window.location.hash.toLowerCase().indexOf('type=player') !== -1 ||
        (detector.mobile() && !config.isFireTV);

    // set size
    originalWidth = config.width;
    originalHeight = config.height;
    originalWidthCenter = originalWidth * 0.5;
    originalHeightCenter = originalHeight * 0.5;

    // set address
    if(window.location.protocol.indexOf('file') === 0){
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

    game.state.add('boot', bootState);
    game.state.add('preload', preloadState);
    game.state.add('main', mainState);
    game.state.add('player', playerState);
    game.state.add('playerFinish', playerFinishState);
    game.state.add('lobby', lobbyState);
    game.state.add('lobbyPlayer', lobbyPlayerState);
    game.state.add('stage', stageState);
    game.state.add('stageFinish', stageFinishState);

    console.log(config);
    game.state.start('boot');

}
// window.addEventListener('load', initGame);

// Listen for orientation changes
window.addEventListener("orientationchange", function() {
    // Announce the new orientation number
    
}, false);















