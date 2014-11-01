// speedPlayer.js

var _ = require('underscore');
var gamePath = '../../game/speez/';
var Stage = require(gamePath + 'stage');

module.exports = {

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
			isReady: req.player.isReady,
		});
		if(!isAllReady){
			return;
		}
		var options = { cardCount: 15, boardCount: 2 };
		req.stage.setConfig(options);
		_.each(_.keys(req.stage.players), function(key){
			var player = req.stage.players[key];
			player.setConfig(options);
			// Send data to player
			var playerData = _.pick(player, [ 'cardCount', 'boardCount', 'hand' ]);
			var boards = _.map(req.stage.boards, function(board) {
				return { color: board.color };
			});
			playerData = _.extend(playerData, { boards: boards });
			player.socket.emit('speed:player:load', playerData);
		})
		req.stage.randomizeBoards();
		req.stage.socket.emit('speed:stage:load', _.pick(req.stage, [ 'cardCount', 'boardCount', 'boards' ]));
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
		var data = req.player.playCard(req.data.handId, req.data.boardId);
		if(!data){
			req.io.respond({ confirm: false })
			return;
		}
		req.io.respond({ confirm: true, handId: req.data.handId, newCard: data.newCard });
		var win = req.stage.isWin();
		req.stage.socket.emit('speed:stage:card', { boardId: req.data.boardId, card: data.card, playerId: req.player.id });
		if(win){
			req.stage.eachPlayer(function(player){
				if(player.id === win){
					player.socket.emit('speed:player:winner', { winner: true });
				} else {
					player.socket.emit('speed:player:winner', { winner: false });
				}
			});
			req.stage.socket.emit('speed:stage:winner', { winner: win });
		}
	},

	cardOverlap: function(req) {
		var data = req.player.playOverlap(req.data.handId, req.data.overlapId);
		if(data === false){
			req.io.respond({ confirm: false });
			return;
		}
		req.io.respond({ confirm: true, 
			handId: req.data.handId, 
			overlapId: req.data.overlapId, 
			newCard: data.newCard, 
			overlapNewCard: data.newOverlapCard 
		});
	},

	next: function(req){
		if(!req.stage.setLoaded(req.player)){
			return;
		}
		req.stage.broadcast('speed:player:next');
		req.stage.socket.emit('speed:stage:next');
	},
};
