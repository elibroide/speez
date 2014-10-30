// speed.js

var _ = require('underscore');
var uuid = require('node-uuid');

var routes = {
	stage: require('./stage'),
	player: require('./player'),
}

var fs = require('fs');
var gamePath = '../../game/speez/';
var game = {
	Stage: require(gamePath + 'stage'),
	Player: require(gamePath + 'player'),
};

var config = getConfig();
var games = _.shuffle(_.range(1, 10));
var gameId = 'brobro.speez';
var runningGames = {};

function getConfig(){
	var config = JSON.parse(fs.readFileSync('routes/speed/speezConfig.json', 'utf8'))
	config.colors = _.map(config.colors, function(color){
		return parseInt(color);
	})
	return config;
}

function getSlot(){
	if(games.length === 0){
		return -1;
	}
	return games.splice(0, 1)[0];
}

function returnSlot(slot){
	games.push(slot);
}

function connect(){
	console.log('Connecting');
	this.on('disconnect', disconnect);
	this.speezId = uuid.v4();
}

function disconnect(){
	console.log('Disconnect');
	if(this.stage){
		returnSlot(this.stage.id);
		this.stage.quit();
		_.each(_.keys(this.stage.players), function(key){
			var player = this.stage.players[key];
			player.socket.emit('speed:player:leave', {
				code: game.Player.QUIT_STAGE_DISCONNECTED,
				reason: 'stage disconnected'
			});
			var playerSocket = player;
			delete playerSocket.player;
		}.bind(this));
		return;
	}  
	if(this.player){
		var stage = this.player.stage;
		stage.leave(this.player);
		stage.socket.emit('speed:stage:leave', {
			id: this.player.id,
			code: game.Stage.LEAVE_DISCONNECT,
			reason: 'player disconnected',
		});
		var playerSocket = this.player.socket;
		playerSocket.leave(stage.roomId);
		delete playerSocket.player;
		return;
	}
}

function checkStageActive(req, next){
	if(req.socket.gameId !== gameId){
		return;
	}
	if(!req.socket.stage){
		return;
	}
	req.stage = req.socket.stage;
	next();
}

function checkPlayerActive(req, next){
	if(req.socket.gameId !== gameId){
		return;
	}
	if(!req.socket.player){
		return;
	}
	req.player = req.socket.player;
	req.stage = req.player.stage;
	next();
}

function create(req){
	req.socket.gameId = gameId;
	var stage = new game.Stage(req.socket, this.id, config);
	stage.id = getSlot();
	stage.roomId = gameId + ':' + stage.id;
	runningGames[stage.id] = stage;
	req.socket.stage = stage
	// req.socket.join(stage.roomId);
	req.io.respond({
		id: stage.id,
	});	
	stage.broadcast = function(id, data, func){
		this.socket.broadcast.to(this.roomId).emit(id, data, func);
	}
}

function join(req){
	var stage = runningGames[req.data.id];
	if(!stage){
		req.io.respond({
			confirm: false,
			code: 100,
			reason: 'stage doesn\'t exist',
		});
		return;
	}
	if(stage.players.length >= game.Stage.MAX_PLAYERS){
		req.io.respond({
			confirm: false,
			code: 101,
			reason: 'stage is full',
		});
		return;
	}
	var id = req.socket.speezId;
	var player = new game.Player(req.socket, id, stage);
	stage.players[id] = player;
	var join = stage.join(player);
	if(join.confirm === false){
		req.io.respond({
			confirm: false,
			code: join.code,
			reason: join.reason,
		});
		return;
	}
	player.name = join.name;
	stage.socket.emit('speed:stage:join', _.pick(player, ['id', 'name']));
	req.socket.join(stage.roomId);
	req.socket.gameId = gameId;
	req.socket.player = player;
	req.io.respond({
		confirm: true,
		id: player.id,
		name: player.name,
	});
}

function middleLog(req, next){
	var data = req.data ? 'data=' + JSON.stringify(req.data) : '';
	console.log(req.socket.speezId + ': ' + req.io.event, data );
	next();
}

function getRoutes(app){
	app.io.sockets.on('connection', function(socket){
		connect.bind(socket)();
	});
	app.io.use(/^speed/, middleLog);
	app.io.use(/^speed:stage/, checkStageActive);
	app.io.use(/^speed:player/, checkPlayerActive);
	app.io.route('speed:stage', routes.stage);
	app.io.route('speed:player', routes.player);
	
	var route = {
		// Identify as a player of stage
		create: create,
		join: join,
	}
	app.io.route('speed', route);
}

module.exports = {
	getRoutes: getRoutes,
}









