// player.js

var _ = require('underscore');

function Player(socket, id, stage){
	this.stage = stage;
	this.socket = socket;
	this.id = id;
}
Player.prototype.constructor = Player;

// constants

Object.defineProperty(Player, "QUIT_STAGE_LEFT", { value: 201 });
Object.defineProperty(Player, "QUIT_STAGE_DISCONNECTED", { value: 202 });

// public methods

Player.prototype.setConfig = function(config) {
	this.boardCount = config.boardCount;
	this.cardCount = config.cardCount;
	this.hand = [];
	for (var i = 0; i < 5; i++) {
		this.hand.push(this.makeCard());
	};
};

Player.prototype.getCard = function(handId) {
	return this.hand[handId];
};

Player.prototype.playCard = function(handId, boardId) {
	var card = this.hand[handId];
	if(card === undefined){
		return false;
	}
	if(!this.stage.playCard(this, card, boardId)){
		return false;
	}
	var newCard = this.hand[handId] = this.makeCard();
	this.cardCount--;
	return { card: card, newCard: newCard };
};

Player.prototype.playOverlap = function(handId, overlapId) {
	if(this.hand[handId] === undefined || this.hand[overlapId] === undefined){
		return false;
	}
	if(this.hand[handId] !== this.hand[overlapId]){
		return false;
	}
	var newOverlapCard = this.hand[overlapId];
	this.hand[handId] = this.makeCard();
	return { newCard: this.hand[handId], newOverlapCard: newOverlapCard };
};

Player.prototype.makeCard = function() {
	return _.random(0, 9);
};

Player.prototype.isWin = function() {
	return this.cardCount === 0;
};

Player.prototype.quit = function() {
	
};

module.exports = Player;






