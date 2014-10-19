// stage.js
// WHEN Speez goes up, the colors change
var lobbyState;

(function(){

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
		var headerHeight = originalHeight * 0.1;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			text: 'Lobby',
		});

		// Content
		lobbyArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		lobbyArea.attach(container, { width: originalWidth, height: originalHeight });

		// Lobby data
		lobbyGroup = game.add.group();

		// text
		numberText = game.add.text(0, -150, "Waiting for players", {
	        font: "24px Arial",
	        fill: "#000000",
	        align: "center"
	    });
	    numberText.anchor.set(0.5);
	    lobbyGroup.add(numberText);

	    // box
		numberBox = new com.speez.components.ColorBox(0, -100, 150, 60, 0x000000, {
			text: stage.id,
			anchorX: 0.5,
			anchorY: 0.5,
		});
		lobbyGroup.add(numberBox);

	    // players
	    playersIcons = [];
	    var distance = 250;
	    var colors = [ 0xFF0000, 0x336699, 0xFFCC00, 0x00ff00 ]
	    for(var i=0;i<4;i++){
	    	var player = new PlayerLobby(-distance * 1.5 + i * distance, 50, {
	    		readyColor: colors[i],
	    	});
	    	playersIcons.push(player);
			lobbyGroup.add(player);
	    }

    	lobbyGroup.x = originalWidthCenter;
    	lobbyGroup.y = originalHeightCenter;
		container.addChild(lobbyGroup);

		container.alpha = 0;
		header.alpha = 0;
		game.add.tween(container).to({alpha: 1}, 1000, null, true);
		game.add.tween(header).to({alpha: 1}, 1000, null, true);

		try{
			var graphics = new Phaser.Graphics(game);
			// graphics.beginFill(0xff000000);
			graphics.drawRect(0, 0, 100, 100);
			var spr = game.add.sprite(0, 0, graphics.generateTexture());
			graphics.beginFill(0x000000);
			spr.addChild(graphics);
			spr.anchor.set(0.5);
			setTimeout(function(){
				game.add.tween(spr.scale)
					.to({ x: 2, y: 2 }, 1000, Phaser.Easing.Elastic.Out, true)
					.to({ x: 10, y: 10 }, 500, Phaser.Easing.Sinusoidal.InOut, true);
			}.bind(this), 1000)
			lobbyGroup.add(spr);
		}
		catch(err){console.log(err);}
	}

	// Various

	function getAvailableIcon(){
		for(var i=0;i<playersIcons.length; i++){
			if(!playersIcons[i].player){
				return playersIcons[i];
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

	function handleStartGameClick(){
        game.state.start('stage');
	}

	// socket handlers

	function handleIdentify(data){
		stage = data.stage;
		drawGui();
	}

	function handleJoin(data){
		console.log('speed.stage.join ' + JSON.stringify(data))

		stage.players[data.player.id] = data.player;
		data.player.icon = getAvailableIcon();
		data.player.icon.setPlayer(data.player.name);
	}

	function handleLeave(data){
		console.log('speed.stage.leave ' + JSON.stringify(data))

		stage.players[data.id].icon.removePlayer();
		delete stage.players[data.id];
	}

	function handleReady(data) {
		console.log('speed.stage.ready ' + JSON.stringify(data))
		var player = stage.players[data.id];
		if(!player){
			return;
		}
		player.isReady = data.isReady;
		player.icon.setReady(data.isReady);
		if(!data.isReady){
			return;
		}
		if(isAbleToPlay()){
			socket.emit('speed.stage.load');
		}
	}

	function handleLoad(data) {
		stage.game = data.game;
		game.state.start('stage');
	}

	lobbyState = {

		preload: function(){
		},

		create: function(){
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);

			// network
			socket.on('speed.stage.identify', handleIdentify);
			socket.on('speed.stage.join', handleJoin);
			socket.on('speed.stage.leave', handleLeave);
			socket.on('speed.stage.ready', handleReady);
			socket.on('speed.stage.load', handleLoad);
			socket.emit('speed.stage.identify')
		},

		update: function(){

		},

		render: function(){

		},

		shutdown: function(){
			socket.off('speed.stage.join');
			socket.off('speed.stage.leave');
			socket.off('speed.stage.ready');
			socket.off('speed.stage.load');
		},

	}

})();