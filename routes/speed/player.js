// speedPlayer.js

var _ = require('underscore');
var gamePath = '../../game/speez/';
var Stage = require(gamePath + 'stage');

module.exports = {
	ready: function(req){
		req.player.isReady = req.data.isReady;
		req.stage.socket.emit('speed:stage:ready', {
			id: req.player.id,
			isReady: req.player.isReady,
		});
		if(!req.stage.setReady(req.player)){
			return;
		}
		var options = { cardCount: 15, boardCount: 2 };
		req.stage.setConfig(options);
		_.each(_.keys(req.stage.players), function(key){
			var player = req.stage.players[key];
			player.setConfig(options);
			// Send data to player
			var playerData = _.pick(player, [ 'cardCount', 'boardCount', 'library' ]);
			var boards = _.map(req.stage.boards, function(board) {
				return { color: board.color };
			});
			playerData = _.extend(playerData, { boards: boards });
			player.socket.emit('speed:player:load', playerData);
			player.drawHand();
		})
		req.stage.randomizeBoards();
		req.stage.socket.emit('speed:stage:load', _.pick(req.stage, [ 'cardCount', 'boardCount', 'boards' ]));
	},

	loaded: function(req){
		if(!req.stage.setLoaded(req.player)){
			return;
		}
		req.stage.startGame();
		req.io.room(req.stage.roomId).broadcast('speed:player:start');
		req.stage.socket.emit('speed:stage:start');
	},

	card: function(req){
		var card = req.player.getCard(req.data.handId);
		if(card === undefined){
			req.io.respond({ confirm: false });
			return;
		}
		if(!req.stage.playCard(req.player, card, req.data.boardId)){
			req.io.respond({ confirm: false });
			return;
		}
		req.player.playCard(req.data.handId);
		req.io.respond({ confirm: true });
		var win = req.stage.isWin();
		if(win){
			_.each(_.keys(req.stage.players), function(key){
				var player = req.stage.players[key];
				if(player.id === win){
					player.socket.emit('speed:player:finish', { isWin: true });
				} else {
					player.socket.emit('speed:player:finish', { isWin: false });
				}
			});
			req.stage.socket.emit('speed:stage:finish', { winner: win});
		} else {
			req.stage.socket.emit('speed:stage:card', { boardId: req.data.boardId, card: card, playerId: req.player.id });
		}
	},

    test: function(req) {
    	console.log(req.data);
    },
};
