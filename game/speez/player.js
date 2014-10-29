// player.js

var _ = require('underscore');

function Player(socket, id, stage){
	this.stage = stage;
	this.socket = socket;
	this.id = id;
}
Player.prototype.constructor = Player;

// constants

Object.defineProperty(Player, "JOIN_", { value: 201 });
Object.defineProperty(Player, "QUIT_STAGE_LEFT", { value: 201 });
Object.defineProperty(Player, "QUIT_STAGE_DISCONNECTED", { value: 202 });

// public methods

Player.prototype.setConfig = function(config) {
	this.boardCount = config.boardCount;
	this.cardCount = config.cardCount;
	this.library = [];
	for (var i = 0; i < this.cardCount; i++) {
		this.library.push(_.random(0, 9));
	};
};

Player.prototype.drawHand = function() {
	this.hand = [];
	for (var i = 0; i < 5; i++) {
		this.hand.push(this.library.pop());
	};
};

Player.prototype.getCard = function(handId) {
	return this.hand[handId];
};

Player.prototype.playCard = function(handId) {
	this.hand[handId] = this.library.pop();
};

Player.prototype.quit = function() {
	
};

module.exports = Player;
