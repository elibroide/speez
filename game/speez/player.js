// player.js

var _ = require('underscore');

function Player(socket, id, stage){
	this.stage = stage;
	this.socket = socket;
	this.id = id;
	this.points = 0;
	this.block = 0;
	this.fazt = 0;
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
		return { confirm: false, reason: 'no such card' };
	}
	var response = this.stage.playCardBoard(this, card, boardId);
	if(!response.confirm){
		return response;
	}
	this.cardCount--;
	if(this.cardCount >= Player.HAND_SIZE){
		this.hand[handId] = this.makeCard();
	} else {
		this.hand[handId] = undefined;
	}
	this.addPoints(response.points);
	return _.extend({ card: card, newCard: this.hand[handId] }, response);
};

Player.prototype.playOverlap = function(handId, overlapId) {
	if(this.hand[handId] === undefined || this.hand[overlapId] === undefined){
		return { confirm: false, reason: 'no such card' };
	}
	if(this.hand[handId] !== this.hand[overlapId]){
		return { confirm: false, reason: 'cards not equal' };
	}
	var response = this.stage.playCardOverlap(this, this.hand[handId], this.hand[overlapId]);
	if(!response.confirm){
		return response;
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
	this.hand[handId] = newCard;
	this.addPoints(response.points);
	return _.extend({ newCard: this.hand[handId], newOverlapCard: newOverlapCard }, response);
};

Player.prototype.makeCard = function() {
	return this.stage.getCard();
};

Player.prototype.isWin = function() {
	return this.cardCount === 0;
};

Player.prototype.addPoints = function(points) {
	if(!points){
		return;
	}
	this.points += points;
};

Player.prototype.quit = function() {
	
};

module.exports = Player;






