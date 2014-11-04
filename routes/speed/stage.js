// speedPlayer.js

var _ = require('underscore');
var gamePath = '../../game/speez/';
var Stage = require(gamePath + 'stage');
var Player = require(gamePath + 'player');

// Config
var fs = require('fs');
var config = getConfig();
function getConfig(){
	var config = JSON.parse(fs.readFileSync('game/speez/speezConfig.json', 'utf8'))
	config.colors = _.map(config.colors, function(color){
		return parseInt(color);
	});
	return config;
}

// handlers

function handleAchieve(player, achievment, data){
	console.log(this.id + ' -> ' + player.id + ':' + achievment, '[', data, ']');
	player.socket.emit('speed:player:achieve', { achievement: achievment, data: data })
	this.socket.emit('speed:stage:achieve', { achievement: achievment, data: data, player: player.id })
}

// exports

module.exports.create = function(req, id){
	var stage = new Stage(req.socket, id, config);
	req.io.respond({
		id: stage.id,
	});
	stage.on(Stage.EVENT_ACHIEVE, handleAchieve.bind(stage));

	return stage;
}

module.exports.disconnect = function(socket){
	socket.stage.eachPlayer(function(player){
		player.socket.emit('speed:player:leave', {
			code: Player.QUIT_STAGE_DISCONNECTED,
			reason: 'stage disconnected'
		});
		player.socket.leavePlayer();
	});
	socket.leaveStage();
}

// game messages

module.exports.messages = {

	loaded: function(req) {
		if(!req.stage.setLoaded()){
			return;
		}
		req.stage.startGame();
		// req.io.room(req.stage.roomId).broadcast('speed:player:start');
		req.stage.broadcast('speed:player:start');
		req.stage.socket.emit('speed:stage:start');
	},
	
	speedy: function(req){
		if(!req.stage.isCanSpeedy()){
			return;
		}
		req.stage.speedy();
		var boards = _.map(req.stage.boards, function(board){
			return _.pick(board, [ 'current', 'color' ]);
		});
		req.io.respond({ boards: boards });
	},

	play: function(req){
		req.stage.play();
	},

	next: function(req){
		if(!req.stage.setLoaded(req.player)){
			return;
		}
		req.stage.socket.emit('speed:stage:next');
		req.stage.broadcast('speed:player:next');
	},

	nextLobby: function(req) {
		req.stage.broadcast('speed:player:nextLobby')
		req.io.respond(true);
	},

    test: function(req) {
    	req.io.emit('test stage');
    },
};

