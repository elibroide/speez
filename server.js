// server.js
// Eliezer Eyal Broide

var port = process.env.PORT || 5000;

// requiring needed modules
var _ = require('underscore');
var socket = require('socket.io');
var express = require('express');
var http = require('http');
// getting app and server
var app = express();
var server = http.createServer(app);
server.listen(port, function(err){
	if(err){
		console.log('Not listening ' + err);
	}
	console.log('Start listening port ' + port);
});
// socket
var io = socket.listen(server, {log: true});
var sockets = io.sockets;

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);

// Serve static files
app.use('/public', express.static(__dirname + '/public'));

app.get("/", function(request, response){
  	response.sendFile(__dirname + "/public/index.html");
});

app.get("/peers", function(request, response){
	response.json(_.values(peers));
});

app.get("/stages", function(request, response){
	response.json(_.values(stages));
});

// *** Speed game ***
var peerCount = 1;
var peers = {};
var stages = {};

io.on('connection', function (socket) {

	var peer = {
		id: peerCount,
		type: 'player',
		name: 'player_' + peerCount,
		socketId: socket.id,
	}
	peers[peer.id] = peer;
	peerCount++;
	peerLog(peer, 'connection ');

	// Common
	socket.on('disconnect', function(){
		peerLog(peer, 'disconnect');
		delete peers[peer.id];
		if(stages[peer.id]){
			delete stages[peer.id];
			_.each(peer.players, function(item){
				sockets.connected[item.socketId].leave('speed.stage_' + peer.id);
				emitToPeer(item, 'speed.player.leave', { reason: 'Stage has quit' });
				item.stageId = null;
			});
		}
		else if(peer.stageId && stages[peer.stageId]) {
			delete stages[peer.stageId].players[peer.id];
			emitToPeer(stages[peer.stageId], 'speed.stage.leave', { id: peer.id });
		}
	});

	socket.on('common.ping', function (data, callback) {
	    if(callback){
		    callback();
		}
	});

	socket.on('explode', function (data) {
		console.log('received explode: ' + JSON.stringify(data));
		socket.broadcast.emit('explode', { x: data.x, y: data.y, explosionType: data.explosionType });
	});

	// speed stage
	socket.on('speed.stage.identify', function(){
		peer.type = 'stage';
		peer = _.extend(peer, {
			state: 'lobby',
			players: {},
			game: {
				boardCount: 2,
			},
		})
		stages[peer.id] = peer;
		peerLog(peer, 'speed.stage.identify');
		socket.emit('speed.stage.identify', { stage: pickPeerData(peer) });
	});

	socket.on('speed.stage.load', function(){
		peerLog(peer, 'speed.stage.load');
		if(peer.players <= 0 || !_.every(peer.players, function(item){ return item.isReady; })){
			peerLog(peer, 'speed.stage.load: cannot load game while not meeting requisits')
			return;
		}
		peer.state = 'load';

		// load stage
		peer.isLoaded = false;
		peer.game = {
			boardCount: peer.game.boardCount,
			boards: [],
		}
		for(var i = 0; i < peer.game.boardCount; i++) {
			peer.game.boards.push({
				current: _.random(0, 9),
				old: [],
			});
		}
		socket.emit('speed.stage.load', { game: peer.game });
		// load players
		_.each(peer.players, function(item){
			// initiate the player
			item.isLoaded = false;
			item.game = {
				library: [],
				hand: [],
				timeLastCard: 0,
				timeToSpeedy: 4000,
				boardCount: peer.game.boardCount,
			}
			for(var i = 0; i < 30; i++){
				item.game.library.push(_.random(0,9));
			}
			emitToPeer(item, 'speed.player.load', { game: item.game });
			for(var i = 0; i < 5; i++){
				item.game.hand[i] = item.game.library.pop();
			}
		});
	});

	socket.on('speed.stage.loaded', function(){
		peerLog(peer, 'speed.stage.loaded');
		peer.isLoaded = true;
		if(_.every(peer.players, function(item){ return item.isLoaded; })) {
			peer.state = 'start';
			io.to('speed.stage_' + peer.id).emit('speed.player.start');
			socket.emit('speed.stage.start');
		}
	});

	socket.on('speed.stage.speedy', function(){
		peerLog(peer, 'speed.stage.speedy');
		if(Date.now() - peer.game.timeLastCard > peer.game.timeToSpeedy) {
			return;
		}
		_.each(peer.game.boards, function(board) {
			board.old.push(board.current);
			board.current = _.random(0, 9);
		});
		peer.game.state = 'speedy';
		socket.emit('speed.stage.speedy', { boards: peer.game.boards, timeToSpeedy: peer.timeToSpeedy });
	});

	socket.on('speed.stage.play', function(){
		peerLog(peer, 'speed.stage.play');
		peer.game.state = 'play';
	});

	// speed player
	socket.on('speed.player.join', function(data){
		peerLog(peer, 'speed.player.join to ' + data.id)
		if(!stages[data.id]){
			socket.emit('speed.player.leave', { reason: 'No such stage' })
			return;
		}
		if(stages[data.id].state != 'lobby'){
			socket.emit('speed.player.leave', { reason: 'Stage is in play' })
			return;
		}
		stages[data.id].players[peer.id] = peer;
		peer = _.extend(peer, {
			stageId: data.id,
			isReady: false,
		});
		socket.join('speed.stage_' + peer.stageId);
		emitToPeer(stages[data.id], 'speed.stage.join', { player: _.pick(peer, ['id', 'name']) });
		socket.emit('speed.player.join', { stage: { id: _.pick(stages[data.id], ['id', 'name']) } });
	});
	
	socket.on('speed.player.leave', function(data){
		peerLog(peer, 'speed.player.leave');
		socket.leave('speed.stage_' + peer.stageId)
		socket.emit('speed.player.leave', { reason: 'User\'s choise' });
		if(!stages[peer.stageId]){
			return;
		}
		emitToPeer(stages[peer.stageId], 'speed.stage.leave', { id: peer.id });		
	});

	socket.on('speed.player.ready', function(data){
		peerLog(peer, 'speed.player.ready is ready - ' + data.isReady);
		if(!stages[peer.stageId]){
			return;
		}
		peer.isReady = data.isReady;
		emitToPeer(stages[peer.stageId], 'speed.stage.ready', { id: peer.id, isReady: data.isReady });
	});

	socket.on('speed.player.loaded', function(){
		peerLog(peer, 'speed.player.loaded');
		if(!stages[peer.stageId]){
			return;
		}
		peer.isLoaded = true;
		if(stages[peer.stageId].isLoaded && _.every(stages[peer.stageId].players, function(item){ return item.isLoaded; })) {
			stages[peer.stageId].state = 'start';
			// stages[peer.stageId].timeLastCard = 0;
			// stages[peer.stageId].timeToSpeedy = 4000;
			io.to('speed.stage_' + peer.stageId).emit('speed.player.start');
			emitToPeer(stages[peer.stageId], 'speed.stage.start');
		}
	});

	socket.on('speed.player.card', function(data){
		peerLog(peer, 'speed.player.card -> ', 'board=', data.boardId, ', handId=', data.handId, ', hand=' + peer.game.hand);
		if(!stages[peer.stageId]){
			return;
		}
		if(stages[peer.stageId].game.state != 'play'){
			socket.emit('speed.player.card', { confirm: false });
			return;
		}
		var board = stages[peer.stageId].game.boards[data.boardId];
		var card = peer.game.hand[data.handId];
		var confirm = (board.current + 1 + 10) % 10 == card || (board.current - 1 + 10) % 10 == card;
		if(confirm){
			peer.game.hand[data.handId] = peer.game.library.pop();
			peer.game.timeLastCard = Date.now();
			board.old.push(board.current); 
			board.current = card;
			emitToPeer(stages[peer.stageId], 'speed.stage.card', { boardId: data.boardId, card: card, playerId: peer.id });
		}
		socket.emit('speed.player.card', { confirm: confirm, handId: data.handId });
	});
});

function peerLog(peer, text){
	var args = ['peer ' + peer.id + '(' + peer.type + ') ->'].concat(Array.prototype.slice.call(arguments, 1));
	console.log(args.join(' '));
}

function emitToPeer(peer, func, data) {
	if(sockets.connected[peer.socketId]){
		sockets.connected[peer.socketId].emit(func, data);
	}
}

function pickPeerData(peer, exclude){
	return _.pick(peer, function(value, key, object){
		if(exclude !== undefined){
			return !_.some(exclude, function(item){
				return key == item;
			})
		}
		return key != 'socketId';
	});
}










