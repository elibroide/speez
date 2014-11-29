// stage.js
var lobbyState = (function(){

	// gui
	var header;	
	var lobbyArea;
	var lobbyGroup;
	var container;
	var numberText;
	var numberBox;
	var playersIcons;

	var textStatus;
	var textData;
	var textPlayers;
	var btnBoardsCount;

	function drawGui(){
		// header
		var headerHeight = 100;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			alpha: 0,
		});
		var headerButton = game.add.text(50, headerHeight * 0.5, '\uf04c', {
			font: "40px FontAwesome",
	        fill: "#000000",
	        align: "center"
		});
		headerButton.anchor.set(0.5);
	    headerButton.inputEnabled = true;
	    headerButton.events.onInputDown.add(handleStageLeaveClicked);
		header.addLeft(headerButton);

		// Content
		lobbyArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		lobbyArea.attach(container, { width: originalWidth, height: originalHeight });

		// Lobby data
		lobbyGroup = game.add.group();

	    // players
	    playersIcons = [];
	    var distance = 200;
	    var colors = [ 0xFF0000, 0x336699, 0xFFCC00, 0x00ff00 ]
	    for(var i=0;i<4;i++){
	    	var player = new PlayerLobby(-distance * 1.5 + i * distance, 0, 155, 80, {
	    		readyColor: colors[i],
	    	});
	    	playersIcons.push(player);
			lobbyGroup.add(player);
	    }
	    playersIcons.push(playersIcons.shift());

    	lobbyGroup.x = originalWidthCenter;
    	lobbyGroup.y = 210;
		container.addChild(lobbyGroup);

		var numberTextFormat = {
			font: "22px Montserrat",
	        fill: "#000000",
	        align: "center"
		}
		numberText = game.add.text(originalWidthCenter, originalHeight - 30, 'GAME NUMBER', numberTextFormat);
		numberText.anchor.set(0.5);
		container.addChild(numberText);

		blockNumber = new com.speez.components.BlockNumber(originalWidthCenter - 260 / 2, originalHeight - 126, 260, 70, stage.id, {
			format: {
				font: "52px Montserrat",
		        fill: "#ffffff",
		        align: "center"
			},
			margin: 10,
		});
		container.addChild(blockNumber);

		// common
		common.addLogo('logo', lobbyArea);
		common.addLogo('beta', lobbyArea);
	}

	// Various

	function getAvailableIcon(){
		for(var i=0;i<playersIcons.length; i++){
			if(!playersIcons[i].player){
				return i;
			}
		}
	}

	function isAbleToPlay(){
		return _.size(stage.players) > 0 && _.every(stage.players, function(item){ return item.isReady; });
	}

	// buttons handlers

	function handleBoardsCountClick(){
		stage.game.boardCount += 1;
		if(stage.game.boardCount > 4){
			stage.game.boardCount = 2;
		}
		btnBoardsCount.text.setText( 'Boards Count: ' + stage.game.boardCount);
	}

	function handleStageLeaveClicked() {
		socket.emit('speed:stage:stageLeave', handleStageLeave);
	}

	// socket handlers

	function handleIdentify(data){
		stage = {
			id: data.id,
			players: [],
		};
		drawGui();
		
	}

	function handleNextLobby(data) {
		drawGui();

		_.each(_.keys(stage.players), function(key){
			var player = stage.players[key];
			player.icon = getAvailableIcon();
			playersIcons[player.icon].setPlayer(player);
		});
	}

	function handleJoin(data){
		console.log('handleJoin:', data)

		var player = data;
		stage.players[data.id] = player;
		player.victories = 0;
		player.icon = getAvailableIcon();
		playersIcons[player.icon].setPlayer(player);
	}

	function handleLeave(data){
		console.log('handleLeave:', data)

		var player = stage.players[data.id];
		playersIcons[player.icon].removePlayer();
		delete stage.players[data.id];
	}

	function handleReady(data) {
		console.log('handleReady:', data)
		var player = stage.players[data.id];
		if(!player){
			return;
		}
		player.isReady = data.isReady;
		playersIcons[player.icon].setReady(data.isReady);
		if(!data.isReady){
			return;
		}
		if(isAbleToPlay()){
			socket.emit('speed:stage:load');
		}
	}

	function handleLoad(data) {
		stage.game = data;
		game.state.start('stage');
	}

	function handleName(data){
		var player = stage.players[data.playerId];
		player.name = data.name;
		var icon = playersIcons[player.icon];
		icon.changeName(data.name);
	}

	function handleStageLeave(data){
		stage = null;
		game.state.start('main');
	}

	return {

		preload: function(){
		},

		create: function(){
			common.flipOrientation('landscape');
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);

			// network
			socket.on('speed:stage:join', handleJoin);
			socket.on('speed:stage:leave', handleLeave);
			socket.on('speed:stage:ready', handleReady);
			socket.on('speed:stage:load', handleLoad);
			socket.on('speed:stage:name', handleName);
			
			if(stage){
				socket.emit('speed:stage:nextLobby', null, handleNextLobby);
			} else {
				socket.emit('speed:create', null, handleIdentify)
			}
		},

		update: function(){

		},

		shutdown: function(){
			socket.off('speed:stage:join', handleJoin);
			socket.off('speed:stage:leave', handleLeave);
			socket.off('speed:stage:ready', handleReady);
			socket.off('speed:stage:load', handleLoad);
			socket.off('speed:stage:name', handleName);
		},

	}

})();