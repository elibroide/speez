// speedPlayer.js

var _ = require('underscore');
var gamePath = '../../game/speez/';
var Stage = require(gamePath + 'stage');
var Player = require(gamePath + 'player');

// exports

module.exports.join = function(req, stage) {
	if(stage.players.length >= Stage.MAX_PLAYERS){
		req.io.respond({
			confirm: false,
			code: 101,
			reason: 'stage is full',
		});
		return;
	}
	var id = req.socket.speezId;
	var player = new Player(req.socket, id, stage);
	stage.players[id] = player;
	var join = stage.join(player);
	if(join.confirm === false){
		req.io.respond({
			confirm: false,
			code: join.code,
			reason: join.reason,
		});
		return;
	}
	player.name = join.name;
	var playerData = _.pick(player, ['id', 'name', 'points', 'block', 'fazt']);
	console.log(playerData);
	stage.socket.emit('speed:stage:join', playerData);
	req.io.respond(_.extend({ confirm: true, stageId: stage.id }, playerData));
	return player;
}

module.exports.disconnect = function(socket){
	var stage = socket.player.stage;
	stage.leave(socket.player);
	stage.socket.emit('speed:stage:leave', {
		id: socket.player.id,
		code: Stage.LEAVE_DISCONNECT,
		reason: 'player disconnected',
	});
	socket.leavePlayer();
}

module.exports.messages = {

	name: function(req){
		if(req.data.name){
			req.player.name = req.data.name;
		} else {
			req.player.name = req.stage.getName(req.player.name);
		}
		req.stage.socket.emit('speed:stage:name', { playerId: req.player.id, name: req.player.name });
		req.io.respond({name: req.player.name});
	},

	leave: function(req){
		req.stage.leave(req.player);
		req.stage.socket.emit('speed:stage:leave', {
			id: req.player.id,
			code: Stage.LEAVE_USER_CHOICE,
			reason: 'player left',
		});
		var playerSocket = req.player.socket;
		playerSocket.leave(req.stage.roomId);
		delete playerSocket.player;
		req.io.respond({ confirm: true });
	},

	ready: function(req){
		var isAllReady = req.stage.setReady(req.player, req.data.isReady);
		req.stage.socket.emit('speed:stage:ready', {
			id: req.player.id,
			isReady: req.data.isReady,
		});
		if(!isAllReady){
			return;
		}
		
		// setting player/stage load data
		var options = { cardCount: 20, boardCount: 2 };
		req.stage.setConfig(options);
		var playerBoards = _.map(req.stage.boards, function(board){
			return {color: board.color}; 
		});

		// loading each player
		req.stage.setCards();
		_.each(_.keys(req.stage.players), function(key){
			// setting player load data
			var player = req.stage.players[key];
			player.setConfig(options);
			var playerData = _.pick(player, [ 'cardCount', 'boardCount', 'hand' ]);
			playerData.boards = playerBoards;
			player.socket.emit('speed:player:load', playerData);
		})

		// Getting stage load data
		var stageData = _.pick(req.stage,  [ 'cardCount', 'boardCount' ]);
		req.stage.socket.emit('speed:stage:load', stageData);
	},

	loaded: function(req){
		if(!req.stage.setLoaded(req.player)){
			return;
		}
		req.stage.startGame();
		req.stage.broadcast('speed:player:start');
		req.stage.socket.emit('speed:stage:start');
	},

	cardBoard: function(req){
		var data = req.player.playCardBoard(req.data.handId, req.data.boardId);
		data = _.extend(data, { handId: req.data.handId, boardId: req.data.boardId })
		if(!data.confirm){
			req.io.respond(data)
			return;
		}
		req.io.respond(data);
		var win = req.stage.isWin();
		req.stage.socket.emit('speed:stage:cardBoard', { boardId: req.data.boardId, card: data.card, playerId: req.player.id, points: data.points, cardCount: req.player.cardCount, fazt: data.fazt });
		if(win){
			req.stage.eachPlayer(function(player){
				if(player.id === win){
					player.socket.emit('speed:player:winner', { winner: true });
				} else {
					player.socket.emit('speed:player:winner', { winner: false });
				}
			});
			req.stage.socket.emit('speed:stage:winner', win);
			return;
		}
		if(!req.stage.isAnyMoveExist()){
			req.stage.socket.emit('speed:stage:noMoves');
		}
	},

	cardOverlap: function(req) {
		var data = req.player.playOverlap(req.data.handId, req.data.overlapId);
		data = _.extend(data, { handId: req.data.handId, overlapId: req.data.overlapId })
		req.stage.socket.emit('speed:stage:cardOverlap', { playerId: req.player.id, points: data.points, cardCount: req.player.cardCount });
		req.io.respond(data);
		if(!req.stage.isAnyMoveExist()){
			req.stage.socket.emit('speed:stage:noMoves');
		}
	},

	next: function(req){
		if(!req.stage.setLoaded(req.player)){
			return;
		}
		req.stage.broadcast('speed:player:next');
		req.stage.socket.emit('speed:stage:next');
	},
};
