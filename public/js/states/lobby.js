// stage.js
var lobbyState = (function(){

	// gui
	var header;	
	var lobbyArea;
	var iconsGroup;
	var container;
	var downContainer;
	var numberText;
	var numberBox;
	var playersIcons;
	var descriptionContainer;

	var textStatus;
	var textData;
	var textPlayers;
	var btnBoardsCount;

	var timeline;

	function drawGui(){
		game.stage.backgroundColor = 0xe2e2e2;

		// header
		var headerHeight = 70;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			alpha: 0,
		});
		if(config.isPlayer){
			var headerButton = game.add.text(30, headerHeight * 0.5, '\uf04c', {
				font: "20px FontAwesome",
		        fill: "#000000",
		        align: "center"
			});
			headerButton.anchor.set(0.5);
		    headerButton.inputEnabled = true;
		    headerButton.events.onInputDown.add(handleStagePauseClicked);
			header.addLeft(headerButton);
		}

		// Content
		lobbyArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		downContainer = game.add.sprite();
		container = game.add.sprite();
		lobbyArea.attach(container, { width: originalWidth, height: originalHeight });
		lobbyArea.attach(downContainer, { width: originalWidth, height: originalHeight, alignVertical: Layout.ALIGN_BOTTOM });

		// Players Icons
		iconsGroup = game.add.group();
	    playersIcons = [];
    	iconsGroup.x = originalWidthCenter;
    	iconsGroup.y = 210;
		container.addChild(iconsGroup);

		var keys = _.keys(stage.players);
		if(keys.length === 0){
    		playersIcons.push(createNewIcon());
			rearrangeIcons();	    
		} else {
			keys = _.sortBy(keys, function(key){ return stage.players[key].icon });
			for (var i = 0; i < keys.length; i++) {
				var player = stage.players[keys[i]];
				var icon = createNewIcon();
				icon.setPlayer(player, false);
				playersIcons.push(icon);
				player.icon = playersIcons.indexOf(icon);
			};
			rearrangeIcons().progress(1);	    
			if(playersIcons.length < 4){
				playersIcons.push(createNewIcon())
				rearrangeIcons();	    
			}
		}

		var numberTextFormat = {
			font: "22px Montserrat",
	        fill: "#000000",
	        align: "center"
		}
		numberText = game.add.text(originalWidthCenter, originalHeight - 30, 'GAME NUMBER', numberTextFormat);
		numberText.anchor.set(0.5);
		downContainer.addChild(numberText);

		blockNumber = new com.speez.components.BlockNumber(originalWidthCenter - 260 / 2, originalHeight - 126, 260, 70, stage.id, {
			format: {
				font: "52px Montserrat",
		        fill: "#ffffff",
		        align: "center"
			},
			margin: 10,
		});
		downContainer.addChild(blockNumber);

		drawDescription();

		toggleDescription(playersIcons.length === 1).progress(1);

		// common
		common.addLogo('logo', lobbyArea);
		common.addLogo('beta', lobbyArea);
	}

	function drawDescription(){
		// lobby description
		descriptionContainer = game.add.sprite(originalWidthCenter, originalHeightCenter);
		container.addChild(descriptionContainer);

		var description = game.add.sprite(-150, 0,'lobbyDescription');
		description.anchor.set(0.5);
		description.scale.set(0.9);
		descriptionContainer.addChild(description);

		var textY = -100;
		var descriptionText = game.add.text(120, textY, 'JOIN THE GAME\nON YOUR SMARTPHONE', {
			font: '20px Montserrat',
			fill: 0x000000,
			align: 'center',
		});
		var descriptionTextBold = game.add.text(120, textY + descriptionText.height, 'AND ENTER THIS NUMBER', {
			font: 'bold 20px Montserrat',
			fill: 0x000000,
			align: 'center',
		});
		descriptionText.anchor.set(0.5, 0);
		descriptionTextBold.anchor.set(0.5, 0);
		descriptionContainer.addChild(descriptionText);
		descriptionContainer.addChild(descriptionTextBold);
		// block number
		var descriptionBlockNumber = new com.speez.components.BlockNumber(descriptionText.x - 210 / 2, 0, 210, 60, stage.id, {
			format: {
				font: "52px Montserrat",
		        fill: "#ffffff",
		        align: "center"
			},
			margin: 10,
		});
		descriptionContainer.addChild(descriptionBlockNumber);

		var descriptionNumberText = game.add.text(descriptionText.x, 80, 'GAME NUMBER', {
			font: '20px Montserrat',
			fill: 0x000000,
			align: 'center',
		});
		descriptionNumberText.anchor.set(0.5);
		descriptionContainer.addChild(descriptionNumberText);
	}

	function drawPause(){
		var text = game.add.text(originalWidthCenter, 143, 'PAUZE', {
			font: "bold 50px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
	    text.anchor.set(0.5);

		btnContinue = new MenuButton(originalWidthCenter, 313, 324, 96, {
	    	color: 0x009bff,
	    	textColor: 0x1e1e1e,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'CONTINUE',
			callback: handleContinueClicked,
	    });

	    btnExit = new MenuButton(originalWidthCenter, 453, 324, 85, {
	    	color: 0x1e1e1e,
	    	textColor: 0xffffff,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'END GAME',
			callback: handleExitClicked,
	    });

		pause = new com.speez.components.PauseScreen(originalWidth, originalHeight);
		game.add.existing(pause);
	    pause.container.addChild(text);
		pause.container.addChild(btnExit);
		pause.container.addChild(btnContinue);
	}

	function toggleDescription(on){
		var timeline = new TimelineMax();
		var alpha = on ? 0 : 1;
		timeline.to(descriptionContainer, 1, { alpha: on ? 1 : 0 });
		timeline.to([iconsGroup, blockNumber, numberText], 1, { alpha: on ? 0 : 1 }, 0);
		return timeline;
	}

	// Various

	function rearrangeIcons(){
	    var distance = 200;
		var timeline = new TimelineMax();
		for (var i = 0; i < playersIcons.length; i++) {
			var icon = playersIcons[i];
			var targetX = -distance * (0.5 * (playersIcons.length - 1)) + i * distance;
			timeline.to(icon, 1, { x: targetX }, 0);
		};
		return timeline;
	}

	function createNewIcon(){
		var icon = new PlayerIcon(0, 0, 155, 80, {
    		readyColor: 0x36de4a,
    	});
    	var lastIcon = playersIcons[getAvailableIcon()];
		if(lastIcon){
			icon.x = lastIcon.x;
			icon.y = lastIcon.y;
		}
		iconsGroup.addAt(icon, 0);
		return icon;
	}

	function getAvailableIcon(){
		return playersIcons.length-1;
		// for(var i=0;i<playersIcons.length; i++){
		// 	if(!playersIcons[i].player){
		// 		return i;
		// 	}
		// }
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

	function handleStagePauseClicked() {
		drawPause();
	}

	function handleContinueClicked(){
		pause.destroy();
	}

	function handleExitClicked(){
	 	if(!confirm("Are you sure?")){
	        return;
	    };
		_.each(pause.container.children, function(item){
			if(item.setEnable){
				item.setEnable(false);
			}
		});
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
	}

	function handleJoin(data){
		console.log('handleJoin:', data)

		var player = data;
		stage.players[data.id] = player;
		player.victories = 0;
		player.icon = getAvailableIcon();

		timeline = playersIcons[player.icon].setPlayer(player, true);
		if(playersIcons.length === 1) {
			toggleDescription(false);
		}  
		if(playersIcons.length < 4) {
			playersIcons.push(createNewIcon());
			timeline.add(rearrangeIcons());
		}
	}

	function handleLeave(data){
		console.log('handleLeave:', data)

		var player = stage.players[data.id];
		var icon = playersIcons[player.icon];
		for (var i = player.icon + 1; i < playersIcons.length; i++) {
			var nextIcon = playersIcons[i];
			if(nextIcon.player){
				nextIcon.player.icon--;
			}
		};
		playersIcons.splice(player.icon, 1);

		var timeline = icon.removePlayer();
		timeline.add(icon.removePopup(), 0);

		if(playersIcons.length === 1){
			timeline.add(toggleDescription(true));
		} else if(playersIcons[playersIcons.length - 1].player){
			playersIcons.push(createNewIcon());
		}
		timeline.add(rearrangeIcons());
		delete stage.players[data.id];
	}

	function handleReady(data) {
		console.log('handleReady:', data);
		var player = stage.players[data.id];
		if(!player){
			return;
		}
		player.isReady = data.isReady;
		var icon = playersIcons[player.icon];
		if(player.isReady){
			icon.popup({
				color: 0x36de4a,
				text: 'Ready',
				symbol: '\uf00c',
				moveTime: 1,
				isStay: true,
			});
			icon.tweenColor({ color: 0x36de4a });
		} else {
			icon.removePopup();
			icon.tweenColor();
		}
	}

	function handleLoad(data) {
		console.log('handleLoad:', data);
		stage.game = data;

		if(timeline){
			timeline.kill();
		}

		var timeline = new TimelineMax({ onComplete: function(){
			game.state.start('stage');
		} });
		var lastIcon = playersIcons[playersIcons.length-1];
		if(!lastIcon.player){
			playersIcons.splice(playersIcons.length-1, 1);
			timeline.to(lastIcon, 1, { alpha: 0 });
		}
		timeline.add(function() { 
			_.invoke(playersIcons, 'setAvatarAnimation', false);
		});
		timeline.add(rearrangeIcons(), 0);
		timeline.add(_.invoke(playersIcons, 'removePopup'), 0);
		timeline.add(_.invoke(playersIcons, 'removeStats'), 0);
		timeline.addLabel('start');
		timeline.add(_.invoke(playersIcons, 'tweenColor', { color: 0xffffff }), 'start');
		timeline.to(iconsGroup, 2, { y: originalHeight - 60, ease: Sine.easeInOut }, 'start');
		timeline.to([blockNumber, numberText], 2, { y: '+=250', alpha: 0, ease: Sine.easeIn}, 'start');
		timeline.add(common.tweenStageColor(0x1e1e1e, null, 1));
	}

	function handleName(data){
		var player = stage.players[data.playerId];
		player.name = data.name;
		var icon = playersIcons[player.icon];
		icon.changeName(data.name);
	}

	function handleAvatar(data){
		console.log('handleAvatar:', data);

		var player = stage.players[data.playerId];
		var icon = playersIcons[player.icon];

		player.avatar = data.avatar;
		icon.changeAvatar(player.avatar);
	}

	function handleStageLeave(data){
		console.log('handleStageLeave:', data);

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
			socket.on('speed:stage:avatar', handleAvatar);
			
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
			socket.off('speed:stage:avatar', handleAvatar);
		},

	}

})();