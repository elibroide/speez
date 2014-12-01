// stage.js

var _ = require('underscore');
var events = require('events');

function Stage(socket, id, options){
	this.players = [];
	this.socket = socket;
	this.id = id;
	this.names = _.shuffle(options.names);
	this.colors = options.colors;
	this.state = Stage.STATE_LOBBY;

	// achievements
	this.on(Stage.EVENT_ACHIEVE, this.handleAchievePoints);

	// Screw achievements
	// this.on(Stage.EVENT_CARD_FAILED, this.checkScrewed);

	// First of game achievements
	// this.on(Stage.EVENT_CARD_SUCCESS, this.checkFirstOfGame);

	// Streak Break
	this.on(Stage.EVENT_CARD_SUCCESS, this.checkStreakBreak);

	// Streak
	// this.on(Stage.EVENT_SPEEDY, this.checkStreakSpeedy);

	// Last
	this.on(Stage.EVENT_CARD_OVERLAP, this.checkLast);
	this.on(Stage.EVENT_CARD_SUCCESS, this.checkLast);
}
Stage.prototype.constructor = Stage;
Stage.prototype.__proto__ = events.EventEmitter.prototype;

// Constants

Object.defineProperty(Stage, "CARD_BOARD_POINTS_ANY_THRESHOLD", { value: 3000 });
Object.defineProperty(Stage, "CARD_BOARD_POINTS_THRESHOLD", { value: 1000 });
Object.defineProperty(Stage, "CARD_PUT_TIMEOUT", { value: 0 });
Object.defineProperty(Stage, "MAX_PLAYERS", { value: 5 });

Object.defineProperty(Stage, "STATE_LOBBY", { value: 'lobby' });
Object.defineProperty(Stage, "STATE_PLAY", { value: 'play' });
Object.defineProperty(Stage, "STATE_SPEEDY", { value: 'speedy' });
Object.defineProperty(Stage, "STATE_FINISH", { value: 'finish' });

Object.defineProperty(Stage, "LEAVE_DISCONNECT", { value: 300 });
Object.defineProperty(Stage, "LEAVE_USER_CHOICE", { value: 301 });

Object.defineProperty(Stage, "EVENT_CARD_SUCCESS", { value: 'cardSuccess' });
Object.defineProperty(Stage, "EVENT_CARD_FAILED", { value: 'cardFailed' });
Object.defineProperty(Stage, "EVENT_SPEEDY", { value: 'speedy' });
Object.defineProperty(Stage, "EVENT_CARD_OVERLAP", { value: 'overlap' });
Object.defineProperty(Stage, "EVENT_START", { value: 'start' });
Object.defineProperty(Stage, "EVENT_ACHIEVE", { value: 'achieve' });

Object.defineProperty(Stage, "ACTION_CARD_BOARD", { value: 'cardBoard' });
Object.defineProperty(Stage, "ACTION_CARD_OVERLAP", { value: 'cardOverlap' });
Object.defineProperty(Stage, "ACTION_SPEEDY", { value: 'speedy' });

Object.defineProperty(Stage, "SCREW_TIME", { value: 1000 });
Object.defineProperty(Stage, "LAST_COUNT", { value: [1, 5] });
Object.defineProperty(Stage, "STREAK_COUNT", { value: [3, 5, 10] });

Object.defineProperty(Stage, "ACHIEVE_FIRST_OF_GAME", { value: 'firstOfGame' });
Object.defineProperty(Stage, "ACHIEVE_SCREWED", { value: 'screwed' });
Object.defineProperty(Stage, "ACHIEVE_SCREW", { value: 'screw' });
Object.defineProperty(Stage, "ACHIEVE_LAST", { value: 'last' });
Object.defineProperty(Stage, "ACHIEVE_STREAK", { value: 'streak' });
Object.defineProperty(Stage, "ACHIEVE_STREAK_BREAK", { value: 'streakBreak' });
Object.defineProperty(Stage, "ACHIEVE_STREAK_BROKE", { value: 'streakBroke' });
Object.defineProperty(Stage, "ACHIEVE_QUICK", { value: 'quick' });

// private methods

function saveBoardLastPlay(){
	if(!this.currentPlayer){
		return;
	}
	var play = { action: Stage.ACTION_CARD_BOARD, player: this.currentPlayer.id, card: this.current, timestamp: this.currentTimestamp };
	this.history.push(play);
}

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
	if(this.countPlayer()){
		return;
	}
	this.state = Stage.STATE_LOBBY;
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
	for (var i = 0; i < this.boardCount; i++) {
		this.boards.push({
			current: 0,
			currentPlayer: null,
			currentTimestamp: null,
			history: [],
			id: i,
			saveLastPlay: saveBoardLastPlay,
		});
	};
	this.boards = this.boards;
};

Stage.prototype.isCanSpeedy = function() {
	return Date.now() - this.lastCardTime > Stage.CARD_PUT_TIMEOUT && this.state === Stage.STATE_PLAY;
};

Stage.prototype.saveSpeedy = function() {
	var timestamp = Date.now();
	this.history.push({ action: Stage.ACTION_SPEEDY, timestamp: timestamp });
	this.currentBoard = null;
	_.each(this.boards, function(board){
		board.saveLastPlay(board);
		board.currentPlayer = null;
		board.history.push({ action: Stage.ACTION_SPEEDY, timestamp: timestamp });
	});
};

Stage.prototype.play = function() {
	this.state = Stage.STATE_PLAY;
	// setting speedy mode
	this.randomizeBoards();
};

Stage.prototype.speedy = function() {
	this.state = Stage.STATE_SPEEDY;
	this.saveLastPlay();
	this.saveSpeedy();
	this.initStreak();
	this.emit(Stage.EVENT_SPEEDY);
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
	this.firstPlayerGame = null;
	this.history = [];
	this.lastCardTime = 0;
	this.initStreak();
	this.state = Stage.STATE_SPEEDY;
	this.emit(Stage.EVENT_START);
};

Stage.prototype.playCardBoard = function(player, card, boardId) {
	if(this.state !== Stage.STATE_PLAY) {
		return { confirm: false, reason: 'not in play' };
	}
	var board = this.boards[boardId];
	console.log('play', card, 'to', board.current);
	if(board === undefined){
		return {confirm: false, reason: 'no board'};
	}
	if(this.checkCardProximity(card, board.current)){
		this.lastCardTime = Date.now();
		this.saveLastPlay();
		board.saveLastPlay();
		this.currentBoard = board;
		board.current = card;
		board.currentPlayer = player;
		board.currentTimestamp = this.lastCardTime;
		this.emit(Stage.EVENT_CARD_SUCCESS, player, card, board);
		var fazt = this.checkStreak(player);
		var points = this.getCardBoardPoints(player, board, card);
		if(fazt){
			points += this.getFaztPoints();
		}
		if(this.firstOfGame){
			this.firstOfGame = false;
			points += this.getFirstOfGamePoints();
		}
		return { confirm: true, points: points, fazt: fazt };
	}
	this.emit(Stage.EVENT_CARD_FAILED, player, card, board);
	return { confirm: false, reason: 'failed', screw: this.checkScrewed(player, card, board) };
};

Stage.prototype.saveLastPlay = function() {
	var board = this.currentBoard;
	if(!board){
		return;
	}
	var play = { action: Stage.ACTION_CARD_BOARD, card: board.current, player: board.currentPlayer.id, timestamp: board.currentTimestamp, board: board.id };
	this.history.push(play);
};

Stage.prototype.playCardOverlap = function(player, card, overlapCard) {
	this.emit(Stage.EVENT_CARD_OVERLAP, player, card, overlapCard);
	this.history.push({ action: Stage.ACTION_CARD_OVERLAP, player: player.id, card: card, overlapCard: overlapCard });
	return { confirm: true, points: this.getCardOverlapPoints() };
};

Stage.prototype.setCards = function() {
	var cards = Math.ceil(this.cardCount / 10) * 10 * this.countPlayer();
	this.library = [];
	for (var i = 0; i < cards; i++) {
		this.library.push(i % 10);
	};
	this.library = _.shuffle(this.library);
	console.log(cards);
};

Stage.prototype.getCard = function() {
	return this.library.pop();
};

Stage.prototype.randomizeBoards = function() {
	var tries = 100;
	do{
		var colors = _.shuffle(this.colors);
		_.each(this.boards, function(board){
			board.color = colors.pop();
			board.current = _.random(0,9);
		});
		tries--;
	} while(!this.isMoveExist() && tries > 0);
};

Stage.prototype.isMoveExist = function() {
	var found = false;
	this.eachPlayer(function(player){
		for (var i = 0; i < this.boards.length; i++) {
			var randomHand = _.shuffle(player.hand);
			for (var j = 0; j < randomHand.length; j++) {
				if(randomHand[j] === undefined){
					continue;
				}
				if(this.checkCardProximity(randomHand[j], this.boards[i].current)){
					found = true;
					return false;
				}
			};
		};
	}, true);
	return found;
};

Stage.prototype.isAnyMoveExist = function() {
	if(this.isMoveExist()){
		return true;
	}
	var found = false;
	this.eachPlayer(function(player){
		for (var i = 0; i < player.hand.length; i++) {
			if(player.hand[i] === undefined){
				continue;
			}
			for (var j = 0; j < player.hand.length; j++) {
				if(player.hand[j] === undefined || i === j){
					continue;
				}
				if(player.hand[i] === player.hand[j]){
					found = true;
					return false;
				}
			};
		};
	});
	return found;
};

Stage.prototype.isWin = function() {
	this.winner = this.findPlayer(function(player){
		return player.isWin();
	});
	if(!this.winner){
		return null;
	}
	this.state = Stage.STATE_FINISH;
	var points = this.getWinnerPoints();
	this.winner.points += points;

	// getting best blocker
	var bestBlocker = this.getBest('block', false);
	if(bestBlocker){
		bestBlocker.points += 300;
		bestBlocker = bestBlocker.id;
	}
	var bestFazt = this.getBest('fazt', false);
	if(bestFazt) {
		bestFazt.points += 300;
		bestFazt = bestFazt.id;
	}

	return { winner: this.winner, points: points, bestFazt: bestFazt, bestBlocker: bestBlocker, bestFaztPoints: 300, bestBlockerPoints: 300 };
};

Stage.prototype.getBest = function(property, ignoreZero, direction) {
	if(direction === undefined){
		direction = 1;
	}
	var max = -9007199254740992;
	var players = [];
	this.eachPlayer(function(player){
		var value = player[property] * direction;
		if(!ignoreZero && value === 0){
			return;
		}
		if(value > max){
			players = [player];
			max = player[property];
		} else if(value === max){
			players.push(player);
		}
	});
	if(players.length === 1){
		return players[0];
	}
	return null;
};

Stage.prototype.checkCardProximity = function(card1, card2) {
	return (card2 + 10 - 1) % 10 === card1 || (card2 + 10 + 1) % 10 === card1
};

Stage.prototype.countPlayer = function() {
	return _.keys(this.players).length;
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

Stage.prototype.getPlayerCount = function() {
	return _.keys(this.players).length;
};

Stage.prototype.quit = function() {
	
};

// Points

Stage.prototype.getWinnerPoints = function() {
	return 1000;
};

Stage.prototype.getCardBoardPoints = function(player, board, card) {
	return 100;
};

Stage.prototype.getCardOverlapPoints = function(player, card, overlapCard) {
	return 50;
};

Stage.prototype.getScrewPoints = function() {
	return 100;
};

Stage.prototype.getFaztPoints = function() {
	return 100;
};

Stage.prototype.getFirstOfGamePoints = function() {
	return 10;
};

// Achievements

Stage.prototype.handleAchievePoints = function(player, achievement, data, points) {
	player.addPoints(points);
};

Stage.prototype.checkScrewed = function(player, card, board) {
	if(!board.currentPlayer){
		return;
	}
	if(player.id !== board.currentPlayer.id && Date.now() - board.currentTimestamp < Stage.SCREW_TIME){
		// this.emit(Stage.EVENT_ACHIEVE, player, Stage.ACHIEVE_SCREWED, { screw: board.currentPlayer.name, boardId: board.id });
		this.emit(Stage.EVENT_ACHIEVE, board.currentPlayer, Stage.ACHIEVE_SCREW, { screwId: player.id, screw: player.name, boardId: board.id }, this.getScrewPoints());
		board.currentPlayer.block++;
		return board.currentPlayer.name;
	}
	return null;
};

Stage.prototype.checkFirstOfGame = function(player, card, board) {
	if(!this.firstPlayerGame){
		this.firstPlayerGame = player;
		this.emit(Stage.EVENT_ACHIEVE, player, Stage.ACHIEVE_FIRST_OF_GAME, { }, 10);
	}
};

Stage.prototype.initStreak = function() {
	this.eachPlayer(function(player){
		player.streakCount = 0;
	});
	this.currentStreak = null;
};

Stage.prototype.checkStreakSpeedy = function() {
	var playerId = this.findPlayer(function(player){
		return player.streakCount >= Stage.STREAK_COUNT;
	});
	if(playerId){
		var player = this.players[playerId];
		this.emit(Stage.EVENT_ACHIEVE, player, Stage.ACHIEVE_STREAK, { count: player.streakCount });
	}
	this.initStreak();
};

Stage.prototype.checkStreak = function(player) {
	// Increment this player streak count
	if(this.currentStreak && this.currentStreak.player.id !== player.id){
		this.currentStreak.player.streakCount = 0;
	}
	player.streakCount++;
	// Check count
	var streakCount = player.streakCount;
	var fazt = streakCount % 3;
	this.currentStreak = { player: player, fazt: fazt };
	if(fazt !== 0){
		return false;
	}
	player.fazt++;
	// Notify achievement
	// this.emit(Stage.EVENT_ACHIEVE, player, Stage.ACHIEVE_STREAK, { fazt: fazt });
	return true;
};

Stage.prototype.checkStreakBreak = function(player) {
	if(!this.currentStreak){
		return;
	}
	// check same player
	if(this.currentStreak.level === 0 || this.currentStreak.player.id === player.id){
		return;
	}
	this.emit(Stage.EVENT_ACHIEVE, player, Stage.ACHIEVE_STREAK_BREAK, { level: this.currentStreak.level, name: this.currentStreak.player.name });
	this.emit(Stage.EVENT_ACHIEVE, this.currentStreak.player, Stage.ACHIEVE_STREAK_BROKE, { level: this.currentStreak.level, name: player.name });
	this.currentStreak.player.streakCount = 0;
	this.currentStreak = null;
};

Stage.prototype.checkLast = function(player) {
	var currentCards = player.cardCount - 1;
	if(Stage.LAST_COUNT.indexOf(currentCards) !== -1){
		this.emit(Stage.EVENT_ACHIEVE, player, Stage.ACHIEVE_LAST, { count: currentCards });
	}
};

module.exports = Stage;











