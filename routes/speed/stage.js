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

function handleAchieve(player, achievment, data, points){
	console.log(this.id + ' -> ' + player.id + ':' + achievment, '[', data, ']', points);
	var sendData = { achievement: achievment, data: data, points: points };
	player.send('speed:player:achieve', sendData);
	this.socket.emit('speed:stage:achieve', _.extend(sendData, { player: player.id }));
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
		player.send('speed:player:leave', {
			code: Player.QUIT_STAGE_DISCONNECTED,
			reason: 'stage disconnected'
		});
		player.socket.leavePlayer();
	});
	socket.leaveStage();
}

// game messages

module.exports.messages = {

	stageLeave: function(req){
		req.stage.eachPlayer(function(player){
			player.send('speed:player:leave', {
				code: Player.QUIT_STAGE_DISCONNECTED,
				reason: 'stage left'
			});
			player.socket.leavePlayer();
		});
		req.stage.socket.leaveStage();
		req.io.respond();
	},

	loaded: function(req) {
		if(!req.stage.setLoaded()){
			return;
		}
		req.stage.startGame();
		// req.io.room(req.stage.roomId).broadcast('speed:player:start');
		req.stage.broadcast('speed:player:start');
		req.stage.send('speed:stage:start');
	},
	
	speedy: function(req){
		if(!req.stage.isCanSpeedy()){
			return;
		}
		req.stage.speedy();

		req.stage.eachPlayer(function(player){
			player.send('speed:player:speedy');
		});
		req.io.respond();
	},

	play: function(req){
		req.stage.play();
		var boards = _.map(req.stage.boards, function(board){
			return { stage: _.pick(board, [ 'current', 'color' ]), player: _.pick(board, ['color']) };
		});
		req.stage.eachPlayer(function(player){
			player.send('speed:player:play', _.pluck(boards, 'player'));
		});
		req.io.respond(_.pluck(boards, 'stage'));
	},

	next: function(req){
		if(!req.stage.setLoaded(req.player)){
			return;
		}
		req.stage.send('speed:stage:next');
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

