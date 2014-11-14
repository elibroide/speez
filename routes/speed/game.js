// speed.js

var _ = require('underscore');
var uuid = require('node-uuid');

var routes = {
	stage: require('./stage'),
	player: require('./player'),
}

var games = _.shuffle(_.range(1, 10));
var gameId = 'brobro.speez';
var runningGames = {};

function getSlot(){
	if(games.length === 0){
		return -1;
	}
	return games.splice(0, 1)[0];
}

function returnSlot(slot){
	games.push(slot);
	delete runningGames[slot];
}

function connect(){
	console.log('Connecting');
	this.on('disconnect', disconnect);
	this.leavePlayer = function(){
		this.leave(this.player.stage.roomId);
		delete this.player;
	}
	this.leaveStage = function(){
		this.leave(this.stage.roomId);
		delete this.stage;
	}
	this.speezId = uuid.v4();
}

function disconnect(){
	console.log('Disconnect');
	if(this.stage){
		returnSlot(this.stage.id);
		routes.stage.disconnect(this);
	} else if(this.player){
		routes.player.disconnect(this);
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
	app.io.route('speed:stage', routes.stage.messages);
	app.io.route('speed:player', routes.player.messages);
	
	var route = {
		// Identify as a player of stage
		create: function(req){
			var id = getSlot();
			// TODO: Check id
			var stage = routes.stage.create(req, id);
			stage.broadcast = function(id, data, func){
				this.socket.broadcast.to(this.roomId).emit(id, data, func);
			}
			stage.roomId = gameId + ':' + stage.id;
			req.socket.stage = stage;
			// req.socket.join(stage.roomId);
			req.socket.gameId = gameId;
			runningGames[id] = stage;
		},
		join: function(req){
			var stage = runningGames[req.data.id];
			if(!stage){
				req.io.respond({
					confirm: false,
					code: 100,
					reason: 'stage doesn\'t exist',
				});
				return;
			}
			var player = routes.player.join(req, stage);
			req.socket.join(stage.roomId);
			req.socket.gameId = gameId;
			req.socket.player = player;
		},
	}
	app.io.route('speed', route);
}

module.exports = {
	getRoutes: getRoutes,
}









