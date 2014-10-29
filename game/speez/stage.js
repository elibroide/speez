// stage.js

var _ = require('underscore');

function Stage(socket, id, options){
	this.players = [];
	this.socket = socket;
	this.id = id;
	this.names = _.shuffle(options.names);
	this.colors = options.colors;
	this.state = Stage.STATE_LOBBY;
}
Stage.prototype.constructor = Stage;

// Constants

Object.defineProperty(Stage, "CARD_PUT_TIMEOUT", { value: 1000 });
Object.defineProperty(Stage, "MAX_PLAYERS", { value: 4 });

Object.defineProperty(Stage, "STATE_LOBBY", { value: 'lobby' });
Object.defineProperty(Stage, "STATE_PLAY", { value: 'play' });
Object.defineProperty(Stage, "STATE_SPEEDY", { value: 'speedy' });

Object.defineProperty(Stage, "LEAVE_DISCONNECT", { value: 300 });

// public methods

Stage.prototype.join = function(player) {
	var name = this.names.splice(0, 1)[0];
	this.players[player.id] = player;
	return {
		confirm: true,
		id: player.id,
		name: name,
	};
};

Stage.prototype.leave = function(player) {
	delete this.players[player.id];
};

Stage.prototype.setReady = function(player) {
	var keys = _.keys(this.players);
	return keys.length > 0 && _.every(keys, function(key){
		return this.players[key].isReady;
	}.bind(this))
};

Stage.prototype.setConfig = function(config) {
	this.boardCount = config.boardCount;
	this.cardCount = config.cardCount;
	this.boards = [];
	this.colors = _.shuffle(this.colors);
	for (var i = 0; i < this.boardCount; i++) {
		this.boards.push({
			color: this.colors[i],
			current: 0,
		});
	};
	this.boards = this.boards;
};

Stage.prototype.isCanSpeedy = function() {
	return Date.now() - this.lastCardTime > Stage.CARD_PUT_TIMEOUT;
};

Stage.prototype.speedy = function() {
	this.randomizeBoards();
	this.state = Stage.STATE_SPEEDY;
};

Stage.prototype.play = function() {
	this.state = Stage.STATE_PLAY;
};

Stage.prototype.setLoaded = function(player) {
	if(player === undefined){
		this.isLoaded = true;
	} else {
		this.players[player.id].isLoaded = true;
	}
	return this.isLoaded && _.every(_.keys(this.players), function(key){
		return this.players[key].isLoaded;
	}.bind(this))
};

Stage.prototype.startGame = function() {
	_.each(_.keys(this.players), function(key){
		this.players[key].isLoaded = false;
		this.players[key].isReady = false;
	}.bind(this));
	this.lastCardTime = 0;
	this.state = Stage.STATE_SPEEDY;
};

Stage.prototype.playCard = function(player, card, board) {
	if(this.state !== Stage.STATE_PLAY) {
		return false;
	}
	if(board >= this.boards.length){
		return false;
	}
	var board = this.boards[board];
	if(this.checkCardProximity(card, board.current)){
		board.current = card;
		return true;
	}
	return false;
};

Stage.prototype.randomizeBoards = function() {
	do{
		_.each(this.boards, function(board){
			board.current = _.random(0,9);
		})
	} while(!this.isMoveExist());
};

Stage.prototype.isMoveExist = function() {
	var found = false;
	var keys = _.keys(this.players);
	keys = _.shuffle(keys);
	_.each(keys, function(key){
		var player = this.players[key];
		for (var i = 0; i < this.boards.length; i++) {
			for (var j = 0; j < player.hand.length; j++) {
				if(player.hand === undefined){
					continue;
				}
				if(this.checkCardProximity(player.hand[j], this.boards[i].current)){
					found = true;
					return false;
				}
			};
		};
	}.bind(this));
	return found;
};

Stage.prototype.isWin = function() {
	this.winner = false;
	_.each(_.keys(this.players), function(key){
		var player = this.players[key];
		if(player.library.length === 0 && _.every(player.hand, function(card){ return card === undefined; })){
			this.winner = player.id;
			return false;
		}
	}.bind(this));
	return this.winner;
};

Stage.prototype.checkCardProximity = function(card1, card2) {
	return (card2 + 10 - 1) % 10 === card1 || (card2 + 10 + 1) % 10 === card1
};

Stage.prototype.quit = function() {
	
};

module.exports = Stage;