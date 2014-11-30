// stage.js

var stageState;

(function(){

	// gui
	var stageArea;
	var container;
	var boards;
	var boardsContainer;
	var timerBall;
	var iconsGroup;
	var playersIcons;
	var rain;

	// groups
	var playersIconsGroup;

	// timeline
	var timelineEnd;

	function drawGui(){
		game.stage.backgroundColor = 0x1e1e1e;

		// Content
		stageArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		stageArea.attach(container, { width: originalWidth, height: originalHeight });

		// rain
    	rain = new com.speez.components.Rain({
    		y: originalHeight + 100,
    		targetY: -100,
    		maxX: originalWidth,
    	});
    	rain.alpha = 0.3;
    	game.add.existing(rain);
    	game.world.sendToBack(rain);

    	stageArea.attach(rain, {
    		width: originalWidth,
    		height: originalHeight,
    		mode: Layout.PROPORTIONAL_OUTSIDE,
    	});

	    // setting players
	    playersIcons = [];
	    iconsGroup = game.add.group();
	    iconsGroup.x = originalWidthCenter;
	    iconsGroup.y = originalHeight - 60;
	    container.addChild(iconsGroup);
		var keys = _.keys(stage.players);
		for (var i = 0; i < keys.length; i++) {
			var player = stage.players[keys[i]];
			var icon = new PlayerIcon(0, 0, 155, 80, { 
				isShowStats: false,
	 		});
			playersIcons[player.icon] = icon;
			iconsGroup.add(icon);
			icon.setPlayer(player, false);
		};
	    rearrangeIcons(false);

		timer = new com.speez.components.TimerLines({ 
			time: 10,
			width: 20,
			height: originalHeight,
			color: 0xc5c5c5,
			countComplete: handleTimerComplete,
		});
		game.add.existing(timer);
		
		incoming = new com.speez.components.Incoming(originalWidthCenter, originalHeightCenter);
		container.addChild(incoming);

		// common
		// common.addLogo('logo', stageArea);
		common.addLogo('beta', stageArea);
	}

	function drawBoards(){
		destroyBoards();

		// Boards
		boards = [];
		boardsContainer = game.add.group();
		var minRadius = 100;
		var maxRadius = 140;
		var minY = -150;
		var maxY = 0;
		var rotateSpeed = 0.2;
		var options = {
			diffuseColor: game.stage.backgroundColor,
		};
		switch(stage.game.boards.length) {
			case 2:
				boards[0] = new com.speez.components.StageBoard(originalWidthCenter * 0.5, originalHeightCenter + _.random(minY, maxY), 
					_.extend(options, { color: stage.game.boards[0].color, radius: _.random(minRadius, maxRadius), rotateSpeed: 100, isLeft: true }));
				boards[1] = new com.speez.components.StageBoard(originalWidthCenter * 1.5, originalHeightCenter + _.random(minY, maxY), 
					_.extend(options, { color: stage.game.boards[1].color, radius: _.random(minRadius, maxRadius), rotateSpeed: -100, isLeft: false }));
				break;
			case 3:
				boards[0] = new com.speez.components.StageBoard(0, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[0].color);
				boards[1] = new com.speez.components.StageBoard(originalWidthCenter, 0, originalWidthCenter, originalHeight, stage.game.boards[1].color);
				boards[2] = new com.speez.components.StageBoard(0, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[2].color)
				break;
			case 4:
				boards[0] = new com.speez.components.StageBoard(0, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[0].color);
				boards[1] = new com.speez.components.StageBoard(originalWidthCenter, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[1].color);
				boards[2] = new com.speez.components.StageBoard(0, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[2].color)
				boards[3] = new com.speez.components.StageBoard(originalWidthCenter, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[3].color)
				break;
		}
		_.each(boards, function(board){
			// boardsContainer.add(board);
			container.addChild(board);
			board.options.appearTime = 0;
		});
	}

	function destroyBoards(){
		if(!boards){
			return;
		}
		_.each(boards, function(board){
			board.destroy();
		});
	}

	function handleTimerComplete(){
		doSpeedy();
	}

	function handlePlayIncomingComplete(){
		if(config.isTest){
			handlePlay(generateBoards());
			return;
		}
		socket.emit('speed:stage:play', handlePlay);
	}

	// handling socket

	function handleStart(){
		var texts = [
			{ text: '5', sound: 'countdown/5' },
			{ text: '4', sound: 'countdown/4' },
			{ text: '3', sound: 'countdown/3' },
			{ text: '2', sound: 'countdown/2' },
			{ text: '1', sound: 'countdown/1' },
		];
		var speezTexts = [ { text: 'SPEEZ', sound: 'countdown/speed', angle: 30 } ];

		if(config.isTest){
			texts = [
				{ text: '5', sound: 'countdown/5' }
			]
		}

		var speezOptions = {
			isTexts: true,
			delay: 1,
			size: 300,
			delayBetween: 1,
			effectOptions: {
				name: 'speezIncoming',
				backRadius: 650,
			},
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			complete: handlePlayIncomingComplete,
			timeScale: 0.9,
		}
		var textsOptions = {
			isTexts: true,
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			delay: 1,
			size: 150,
			delayBetween: 0.2,
			effectOptions: {
				name: 'numericIncoming',
				backRadius: 400,
			},
			timeScale: 1.7,
		};

		var timeline = new TimelineMax({ delay: 1 });
		timeline.add(incoming.show(texts, textsOptions), 0);
		timeline.add(incoming.show(speezTexts, speezOptions), '+=' + 1);
	}

	function handleSpeedy(data){
		console.log('handleSpeedy:', data);

		var texts = [
			{ text: '3', sound: 'countdown/3' },
			{ text: '2', sound: 'countdown/2' },
			{ text: '1', sound: 'countdown/1' },
		];
		var speezTexts = [ { text: 'SPEEZ', sound: 'countdown/speed', angle: 30 } ];

		var speezOptions = {
			isTexts: true,
			delay: 1,
			size: 300,
			delayBetween: 1,
			effectOptions: {
				name: 'speezIncoming',
				backRadius: 650,
			},
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			complete: handlePlayIncomingComplete,
			timeScale: 0.9,
		}
		var textsOptions = {
			isTexts: true,
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			delay: 1,
			size: 150,
			delayBetween: 0.2,
			effectOptions: {
				name: 'numericIncoming',
				backRadius: 400,
			},
			timeScale: 1.7,
		};

		var timeline = new TimelineMax();
		timeline.add(function(){
			rain.active = false;
		});
		timeline.add(timer.disappear(), 0);
		timeline.add(_.invoke(boards, 'disappear'), 0);
		// timeline.add(_.invoke(playersIcons, 'disappear', true), 0);
		timeline.add(incoming.show(texts, textsOptions), '+=' + 1);
		timeline.add(incoming.show(speezTexts, speezOptions), '+=' + 1);
	}

	function handlePlay(data){
		console.log('handlePlay:', data);
		stage.game.boards = data;
		
		drawBoards();
		var timeline = new TimelineMax({  });
		timeline.add(function(){
			rain.active = true;
		});
		timeline.add(setBoards(), 0);
		timeline.add(timer.appear(), 0);
		// timeline.add(_.invoke(playersIcons, 'appear', true), 0);
	}

	function handleCardBoard(data){
		console.log('handleCardBoard:', data);
		var player = stage.players[data.playerId];
		var board = boards[data.boardId];
		board.setCard(data.card, player.name, true);
		container.removeChild(board);
		container.addChild(board);

		// set icon
		player.points += data.points;
		var icon = playersIcons[player.icon];
		icon.tweenColor({ color: board.options.color, isReturn: true, returnTime: 3});
		icon.setPoints(player.points);
		player.cardCount = data.cardCount;
		setPlayerCards(icon, player);
		var symbol = '\uf067';
		if(data.fazt){
			symbol = '\uf0e7';
			icon.showIcon({
				symbol: symbol,
				symbolFormat: {
			    	font: "125px FontAwesome",
			        fill: "#ffd646",
			        align: "center"
			    },
			});
		}
		icon.popup({
			color: board.options.color,
			text: data.points.toString(),
			symbol: symbol,
			isStay: false,
			stayTime: -0.5,
		});
		timer.setCard(board.options.color);
	}

	function handleCardOverlap(data){
		console.log('handleCardOverlap:', data);

		var player = stage.players[data.playerId];
		player.points += data.points;
		var icon = playersIcons[player.icon];
		icon.setPoints(player.points);
		icon.popup({
			color: 0xffffff,
			text: data.points.toString(),
			symbol: '\uf067',
			isStay: false,
			stayTime: -0.5,
		});
		player.cardCount = data.cardCount;
		setPlayerCards(icon, player);
	}

	function setPlayerCards(icon, player){
		if(player.cardCount === 5){
			icon.flash(0.5, 0x00ee00);
		} else if(player.cardCount === 1){
			icon.flash(0.2, 0xee0000);
		} else if(player.cardCount === 0){
			icon.flash(0, 0x1e1e1e);
		}
		icon.setCards(1 - player.cardCount / stage.game.cardCount);
	}

	function handleWinner(data){
		console.log('handleWinner:', data);
		stage.game.winner = data.winner;

		var player = stage.players[data.winner];
		player.points += data.points;
		player.victories++;

		var icon = playersIcons[player.icon];
		icon.tweenColor({color: 0x009bff, isReturn: true, returnTime: 10});
		icon.setPoints(player.points);
		icon.popup({
			color: 0x009bff,
			text: data.points.toString(),
			symbol: '\uf091',
			isStay: false,
			stayTime: 1,
		});

		var texts = [ 
			{ text: 'WINNER', sound: '' }, 
		];
		var winnerOptions = {
			isTexts: true,
			delay: 1,
			size: 300,
			delayBetween: 1,
			effectOptions: {
				name: 'speezIncoming',
				backRadius: 650,
			},
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			timeScale: 0.9,
		}
		var incomingTimeline = incoming.show(texts, winnerOptions);

		var timeline = new TimelineMax();
		timeline.add(function(){ rain.active = false; });
		timeline.add(timer.disappear());
		timeline.add(_.invoke(boards, 'disappear'), 0);
		// timeline.add(_.invoke(playersIcons, 'disappear', true));
		timeline.add(incomingTimeline, '+=' + 1);
		timeline.add(function(){ 
			game.state.start('stageFinish');
		}, '+=' + 1);
		timelineEnd = timeline;
	}

	function handleAchieve(data){
		console.log('handleAchieve:', data);
		var player = stage.players[data.player];
		if(data.points){
			player.points += data.points;
		}
		if(data.achievement === 'screw'){
			handleScrew(player, data);
		}
	}

	function handleScrew(player, data){
		var screwPlayer = stage.players[data.screwPlayerId];
		var icon = playersIcons[screwPlayer.icon];
		icon.showIcon({
			symbol: '\uf05e',
			symbolFormat: {
		    	font: "125px FontAwesome",
		        fill: "#cb1800",
		        align: "center"
		    },
		});
		player.points += data.points;
		
		var icon = playersIcons[player.icon];
		icon.setPoints(player.points);
		icon.tweenColor({color: 0xcb1800, isReturn: true });
		icon.popup({
			color: 0xcb1800,
			text: data.points.toString(),
			symbol: '\uf05e',
			isStay: false,
			stayTime: -0.5,
		});
	}

	function handleLeave(data){
		console.log('handleLeave:', data);
		if(timelineEnd){
			timelineEnd.kill();
		}
		delete stage.players[data.id];
		if(_.keys(stage.players).length !== 0){
			return;
		}
		// stop the game if there are no players
		var timeline = new TimelineMax();
		timeline.add(incoming.stop());
		timeline.add(timer.disappear());
		timeline.add(function(){ rain.active = false; });
		timeline.add(_.invoke(boards, 'disappear'), 0);
		// timeline.add(_.invoke(playersIcons, 'disappear', true));
		timeline.add(
			common.tweenStageColor(0xffffff, function(){
				_.delay(function(){ 
					game.state.start('lobby');
				}, 1000);
			}), 
		'+=' + 1);
		
		Audio.instance.stop('fx');
	}

	function handleNoMoves(data){
		console.log('handleNoMoves:', data);
		timer.noMoves();
	}

	function rearrangeIcons(isAnimate){
	    var distance = 200;
		var timeline = new TimelineMax();
		for (var i = 0; i < playersIcons.length; i++) {
			var icon = playersIcons[i];
			var targetX = -distance * (0.5 * (playersIcons.length - 1)) + i * distance;
			timeline.to(icon, 1, { x: targetX }, 0);
		};
		if(!isAnimate){
			timeline.progress(1);
		}
		return timeline;
	}

	// other

	function doSpeedy(){
		if(config.isTest){
			// handleWinner({ winner: 0 });
			handleSpeedy();
			return;
		}
		socket.emit('speed:stage:speedy', null, handleSpeedy);
	}

	function setBoards(){
		var timeline = new TimelineMax();
		drawBoards();
		for(var i = 0; i < stage.game.boards.length; i++) {
			boards[i].setCard(stage.game.boards[i].current);
			var prevColor = boards[i].options.color;
			boards[i].options.color = stage.game.boards[i].color;
			timeline.add(boards[i].appear(prevColor), 0);
		}
		return timeline;
	}

	// test

	function generateBoards(){
		var boards = [];
		var colors = _.shuffle([
			0xbf00d8,
			0xd84100,
			0xdbaf00,
			0xa1ff00,
			0x00c8cc,
			0x0065bf
		]);
		for(var i = 0; i < stage.game.boardCount; i++){
			boards[i] = { current: _.random(0, 9), color: colors[i] };
		}
		return boards;
	}

	function setTest(){
		stage.game.boardCount = 2;
		stage.game.boards = generateBoards();
		stage.game.cardCount = 20;
		stage.players = [];
		stage.players[0] = {
			id: 0,
			name: 'Monkey',
			points: 0,
			icon: 0,
			cardCount: 20,
			block: 0,
			fazt: 0,
		}
		stage.players[1] = {
			id: 1,
			name: 'Cow',
			points: 0,
			icon: 1,
			cardCount: 20,
			block: 0,
			fazt: 0,
		}

		var boardId = 0;
		var playerId = 0;
		game.input.keyboard.onPressCallback = function(key, event){
			switch(event.charCode){
				case 113:
					handleAchieve({ achievement: 'firstOfGame', player: 0, points: 10 });
					break;
				case 119:
					handleAchieve({ achievement: 'screw', player: 0, screwPlayerId: 1, points: 100 });
					break;
				default:
					if(event.charCode >= 48 && event.charCode <= 57){
						var number = event.charCode - 48;
						var playerId = _.random(0, 0);
						var player = stage.players[playerId];
						player.cardCount--;
						handleCardBoard({ card: number.toString(), fazt: _.random(0,1), boardId: _.random(0, stage.game.boardCount - 1), playerId: playerId, cardCount: player.cardCount, points: 100 });
					}
					return;
			}
		}
	}

	stageState = {

		preload: function(){
			common.flipOrientation('landscape');
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);
		},

		create: function(){

			if(config.isTest){
				setTest();
				drawGui();
				handleStart();
				return;
			}

			drawGui();
			
			socket.on('speed:stage:noMoves', handleNoMoves);
			socket.on('speed:stage:start', handleStart);
			socket.on('speed:stage:cardBoard', handleCardBoard);
			socket.on('speed:stage:cardOverlap', handleCardOverlap);
			socket.on('speed:stage:winner', handleWinner);
			socket.on('speed:stage:achieve', handleAchieve);
			socket.on('speed:stage:leave', handleLeave);
			socket.emit('speed:stage:loaded');
		},

		update: function(){

		},

		shutdown: function(){
			socket.off('speed:stage:noMoves', handleNoMoves);
			socket.off('speed:stage:leave', handleLeave);
			socket.off('speed:stage:achieve', handleAchieve);
			socket.off('speed:stage:start', handleStart);
			socket.off('speed:stage:cardBoard', handleCardBoard);
			socket.off('speed:stage:cardOverlap', handleCardOverlap);
			socket.off('speed:stage:winner', handleWinner);
		},

	}

})();








