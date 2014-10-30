// speedPlayer.js

var _ = require('underscore');

module.exports = {
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
		req.io.respond({ boards: req.stage.boards});
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

