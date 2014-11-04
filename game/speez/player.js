// player.js

var _ = require('underscore');

function Player(socket, id, stage){
	this.stage = stage;
	this.socket = socket;
	this.id = id;
}
Player.prototype.constructor = Player;

// constants

Object.defineProperty(Player, "HAND_SIZE", { value: 5 });

Object.defineProperty(Player, "QUIT_STAGE_LEFT", { value: 201 });
Object.defineProperty(Player, "QUIT_STAGE_DISCONNECTED", { value: 202 });

// public methods

Player.prototype.setConfig = function(config) {
	this.boardCount = config.boardCount;
	this.cardCount = config.cardCount;
	this.hand = [];
	for (var i = 0; i < Player.HAND_SIZE; i++) {
		this.hand.push(this.makeCard());
	};
};

Player.prototype.getCard = function(handId) {
	return this.hand[handId];
};

Player.prototype.playCardBoard = function(handId, boardId) {
	var card = this.hand[handId];
	if(card === undefined){
		return false;
	}
	if(!this.stage.playCardBoard(this, card, boardId)){
		return false;
	}
	this.cardCount--;
	if(this.cardCount >= Player.HAND_SIZE){
		this.hand[handId] = this.makeCard();
	} else {
		this.hand[handId] = undefined;
	}
	return { card: card, newCard: this.hand[handId] };
};

Player.prototype.playOverlap = function(handId, overlapId) {
	if(this.hand[handId] === undefined || this.hand[overlapId] === undefined){
		return false;
	}
	if(this.hand[handId] !== this.hand[overlapId]){
		return false;
	}
	// Set overlap card
	var oldOverlapCard = this.hand[overlapId];
	var newOverlapCard = this.hand[overlapId];
	// Set handId
	var oldCard = this.hand[handId];
	this.cardCount--;
	if(this.cardCount >= Player.HAND_SIZE){
		this.hand[handId] = this.makeCard();
	} else {
		this.hand[handId] = undefined;
	}
	var newCard = this.hand[handId];
	this.stage.playCardOverlap(this, oldCard, oldOverlapCard, newCard, newOverlapCard);
	this.hand[handId] = newCard;
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






