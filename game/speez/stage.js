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
Object.defineProperty(Stage, "LEAVE_USER_CHOICE", { value: 301 });

// public methods

Stage.prototype.join = function(player) {
	var name = this.getName();
	this.players[player.id] = player;
	return {
		confirm: true,
		id: player.id,
		name: name,
	};
};

Stage.prototype.getName = function(previousName) {
	if(previousName){
		this.names.push(previousName);
	}
	var name = this.names.splice(0, 1)[0];
	this.names = _.shuffle(this.names);
	return name;
};

Stage.prototype.leave = function(player) {
	delete this.players[player.id];
};

Stage.prototype.setReady = function(player, isReady) {
	player.isReady = isReady;
	if(this.everyPlayer(function(player){
		return player.isReady;
	})) {
		this.restoreReady();
		return true;
	}
	return false;
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
	if(this.isLoaded && this.everyPlayer(function(player){
		return player.isLoaded;
	})){
		this.restoreLoaded();
		return true;
	}
	return false;
};

Stage.prototype.restoreReady = function() {
	this.eachPlayer(function(player){
		player.isReady = false;
	});
}

Stage.prototype.restoreLoaded = function() {
	this.eachPlayer(function(player){
		player.isLoaded = false;
	});
	this.isLoaded = false;
};

Stage.prototype.startGame = function() {
	this.restoreLoaded();
	this.restoreReady();
	this.lastCardTime = 0;
	this.state = Stage.STATE_SPEEDY;
};

Stage.prototype.playCard = function(player, card, boardId) {
	if(this.state !== Stage.STATE_PLAY) {
		return false;
	}
	var board = this.boards[boardId];
	if(board === undefined){
		return false;
	}
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
	this.eachPlayer(function(player){
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
	}, true);
	return found;
};

Stage.prototype.isWin = function() {
	this.winner = this.findPlayer(function(player){
		return player.isWin();
	});
	return this.winner;
};

Stage.prototype.checkCardProximity = function(card1, card2) {
	return (card2 + 10 - 1) % 10 === card1 || (card2 + 10 + 1) % 10 === card1
};

Stage.prototype.eachPlayer = function(func, isRandom) {
	var keys = _.keys(this.players);
	if(isRandom){
		keys = _.shuffle(keys);
	}
	_.each(keys, function(key){
		func.call(this, this.players[key]);
	}.bind(this));
};

Stage.prototype.somePlayer = function(func) {
	return _.some(_.keys(this.players), function(key){
		return func.call(this, this.players[key]);
	}.bind(this));
};

Stage.prototype.everyPlayer = function(func) {
	return _.every(_.keys(this.players), function(key){
		return func.call(this, this.players[key]);
	}.bind(this));
};

Stage.prototype.findPlayer = function(func) {
	return _.find(_.keys(this.players), function(key){
		return func.call(this, this.players[key]);
	}.bind(this));
}


Stage.prototype.quit = function() {
	
};

module.exports = Stage;