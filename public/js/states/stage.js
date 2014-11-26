// stage.js

var stageState;

(function(){

	// gui
	var stageArea;
	var container;
	var boards;
	var boardsContainer;
	var timerBall;
	var achievementBoard;
	var playersContainer;
	var playersIcons;
	var rain;

	// groups
	var playersIconsGroup;

	// timeline
	var timelineEnd;

	function drawGui(){
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

		// players icons
		playersContainer = game.add.sprite();
		stageArea.attach(playersContainer, { 
			width: originalWidth, 
			height: originalHeight,
			alignVertical: Layout.ALIGN_BOTTOM,
		});
		playersIcons = [];
	    var distance = 250;
		for (var i = 0; i < 4; i++) {
			var icon = new StagePlayer(originalWidthCenter + -distance * 1.5 + i * distance, originalHeight - 150, { 
				disappearY: originalWidth + 100,
	 		});
			playersIcons[i] = icon;
			playersContainer.addChild(icon);
		};
	    playersIcons.push(playersIcons.shift());

	    // setting players
		var keys = _.keys(stage.players);
		for (var i = 0; i < keys.length; i++) {
			var player = stage.players[keys[i]];
			playersIcons[player.icon].setPlayer(player.name, player.points);
		};

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

		achievementBoard = new com.speez.components.AchievementBoard(originalWidthCenter, -originalHeightCenter + 100, 0, 0);
		container.addChild(achievementBoard);
	}

	function drawBoards(){
		destroyBoards();

		// Boards
		boards = [];
		boardsContainer = game.add.group();
		var minRadius = 100;
		var maxRadius = 175;
		var minY = -150;
		var maxY = 0;
		var rotateSpeed = 0.2;
		var options = {
			diffuseColor: 0x1e1e1e,
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
			handlePlay();
			return;
		}
		socket.emit('speed:stage:play', handlePlay);
	}

	function handleWinnerTimerBallExpand(){
		var texts = [ 
			{ text: 'SPEEZ', sound: 'countdown/sound' }, 
			{ text: 'Complete', sound: '' }, 
			{ text: '', sound: '' }, 
			{ text: 'Winner', sound: '' }, 
			{ text: 'Is', sound: '' }, 
		];
		if(config.isTest){
			// texts = [ { text: 'test' }];
		}
		incoming.show(texts, {
			isTexts: true,
			complete: function(){
				timelineEnd = _.delay(function(){ game.state.start('stageFinish') }, 1);
			},
			completeTime: 1,
		});
	}

	function handleTimerBallExpandLeave(){
		common.tweenStageColor(0xffffff, function(){
			_.delay(function(){ 
				game.state.start('lobby');
			}, 1000);
		});
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
			handlePlayIncomingComplete();
			return;
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
			complete: function(){
				incoming.show(speezTexts, speezOptions);
			},
			timeScale: 1.7,
		};
		var incomingTimeline = incoming.show(texts, textsOptions);

		var timeline = new TimelineMax({ delay: 3 });
		timeline.add(incomingTimeline);
	}

	function handleSpeedy(data){
		console.log('handleSpeedy:', data);
		stage.game.boards = data.boards;
		achievementBoard.hide();

		timer.disappear();
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
			complete: function(){
				incoming.show(speezTexts, speezOptions);
			},
			timeScale: 1.7,
		};
		var incomingTimeline = incoming.show(texts, textsOptions);

		var timeline = new TimelineMax();
		timeline.add(function(){
			rain.active = false;
		});
		_.each(boards, function(board){
			timeline.add(board.disappear(), 0);
		});
		_.each(playersIcons, function(icon){
			timeline.add(icon.disappear(), 0);
		});
		timeline.add(drawBoards);
		timeline.add(incomingTimeline, '+=' + 1);

	}

	function handlePlay(){
		achievementBoard.show();

		var timeline = new TimelineMax({  });
		timeline.add(function(){
			rain.active = true;
		});
		timeline.add(setBoards(), 0);
		timeline.add(timer.appear(), 0);
		_.each(playersIcons, function(icon){
			timeline.add(icon.appear(), 0);
		});
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
		icon.setColor(board.options.color);
		icon.addPoints(data.points, player.points)
		player.cardCount = data.cardCount;
		setPlayerCards(icon, player);

		timer.setCard(board.options.color);
	}

	function handleCardOverlap(data){
		console.log('handleCardOverlap:', data);

		var player = stage.players[data.playerId];
		player.points += data.points;
		var icon = playersIcons[player.icon];
		icon.addPoints(data.points, player.points)
		player.cardCount = data.cardCount;
		setPlayerCards(icon, player);
	}

	function setPlayerCards(icon, player){
		if(player.cardCount === 5){
			icon.flash(0.5, 0x00ee00);
			icon.setCards(player.cardCount / stage.game.cardCount);
		} else if(player.cardCount === 1){
			icon.flash(0.2, 0xee0000);
			icon.setCards(1);
		} else {
			icon.setCards(player.cardCount / stage.game.cardCount);
		}
	}

	function handleWinner(data){
		console.log('handleWinner:', data);
		stage.game.winner = data.winner;
		stage.players[data.winner].victories++;
		timerBall.expand(handleWinnerTimerBallExpand);
		achievementBoard.hide();
	}

	function handleAchieve(data){
		console.log('handleAchieve:', data);
		var player = stage.players[data.player];
		if(data.points){
			player.points += data.points;
			playersIcons[player.icon].addPoints(data.points, player.points);
		}
		var achievement = getAchievement(data.achievement, player, data.data);
		if(!achievement.text){
			return;
		}
		achievementBoard.add(achievement.text);
	}

	function handleLeave(data){
		if(timelineEnd){
			cancelTimeout(timelineEnd);
		}
		delete stage.players[data.id];
		if(_.keys(stage.players).length !== 0){
			return;
		}
		// stop the game if there are no players
		incoming.stop();
		timerBall.expand(handleTimerBallExpandLeave);
		Audio.instance.stop('fx');
	}

	// other

	function getAchievement(achieve, player, data){
		switch(achieve){
			case 'screw':
				return { text: data.name + ' blocked ' + player.name };
			case 'firstOfGame':
				return { text: player.name + ' played the first card' };
			case 'streak':
				return { text: player.name + ' is ' + getStreakName(data.level) };
			case 'last':
				return { text: player.name + ' has ' + data.count + ' card' + (data.count === 1 ? '' : 's') };
		}
	}

	function getStreakName(level){
		switch(level){
			case 1:
				return 'Great';
			case 2:
				return 'Amazing';
			case 3:
				return 'AWESOME';
		}
	} 

	function doSpeedy(){
		if(config.isTest){
			// handleWinner({ winner: 0 });
			handleSpeedy({ boards: generateBoards() });
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
		stage.players = [];
		stage.players[0] = {
			id: 0,
			name: 'Monkey',
			points: 0,
			icon: 0,
		}
		stage.players[1] = {
			id: 1,
			name: 'Cow',
			points: 0,
			icon: 1,
		}

		var boardId = 0;
		var playerId = 0;
		game.input.keyboard.onPressCallback = function(key, event){
			switch(event.charCode){
				case 113:
					handleAchieve({ achievement: 'firstOfGame', player: 0, points: 10 });
					break;
				default:
					if(event.charCode >= 48 && event.charCode <= 57){
						var number = event.charCode - 48;
						handleCardBoard({ card: number.toString(), boardId: _.random(0, stage.game.boardCount - 1), playerId: _.random(0, 0), points: 100 });
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

			game.stage.backgroundColor = 0x1e1e1e;
			drawGui();
			
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
			socket.off('speed:stage:leave', handleLeave);
			socket.off('speed:stage:achieve', handleAchieve);
			socket.off('speed:stage:start', handleStart);
			socket.off('speed:stage:cardBoard', handleCardBoard);
			socket.off('speed:stage:cardOverlap', handleCardOverlap);
			socket.off('speed:stage:winner', handleWinner);
		},

	}

})();