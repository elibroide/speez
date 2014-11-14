// stage.js

var stageState;

(function(){

	// gui
	var stageArea;
	var container;
	var boards;
	var timerBall;
	var achievementBoard;

	// timeline
	var timelineEnd;

	function drawGui(){

		// Boards
		boards = [];
		switch(stage.game.boards.length) {
			case 2:
				boards[0] = new com.speez.components.Board(0, 0, originalWidthCenter, originalHeight, 0x0);
				boards[1] = new com.speez.components.Board(originalWidthCenter, 0, originalWidthCenter, originalHeight, 0x0);
				break;
			case 3:
				boards[0] = new com.speez.components.Board(0, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[0].color);
				boards[1] = new com.speez.components.Board(originalWidthCenter, 0, originalWidthCenter, originalHeight, stage.game.boards[1].color);
				boards[2] = new com.speez.components.Board(0, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[2].color)
				break;
			case 4:
				boards[0] = new com.speez.components.Board(0, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[0].color);
				boards[1] = new com.speez.components.Board(originalWidthCenter, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[1].color);
				boards[2] = new com.speez.components.Board(0, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[2].color)
				boards[3] = new com.speez.components.Board(originalWidthCenter, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[3].color)
				break;
		}
		_.each(boards, function(board){
			board.options.appearTime = 0;
		})

		// Content
		stageArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		stageArea.attach(container, { width: originalWidth, height: originalHeight });

		timerBall = new com.speez.components.TimerBall(originalWidthCenter, originalHeightCenter, 120, { 
			counting: {
				complete: doSpeedy
			},
			expand: {
				complete: null,
			},
		});
		timerBall.scale.set(timerBall.options.expand.scale);
		container.addChild(timerBall);
		
		incoming = new com.speez.components.Incoming(originalWidthCenter, originalHeightCenter);
		container.addChild(incoming);

		achievementBoard = new com.speez.components.AchievementBoard(originalWidthCenter, -100, 0, 0);
		container.addChild(achievementBoard);
	}

	function handleTimerBallExpandBreak(){
		var texts = [
			{ text: '3', sound: 'countdown/3' },
			{ text: '2', sound: 'countdown/2' },
			{ text: '1', sound: 'countdown/1' },
			{ text: 'SPEEZ', sound: 'countdown/speed' },
		]
		incoming.show(texts, { 
			isTexts: true,
			complete: handleIncomingComplete,
			completeTime: 1,
		});
	}


	function handleIncomingComplete(){
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
			{ text: 'Get' }, 
			{ text: 'Ready' }, 
			{ text: '5', sound: 'countdown/5' }, 
			{ text: '4', sound: 'countdown/4' }, 
			{ text: '3', sound: 'countdown/3' }, 
			{ text: '2', sound: 'countdown/2' }, 
			{ text: '1', sound: 'countdown/1' }, 
			{ text: 'SPEEZ', sound: 'countdown/speed' } ];
		if(config.isTest){
			// texts = ['test'];
		}
		incoming.show(texts, {
			isTexts: true,
			complete: handleIncomingComplete,
			completeTime: 1,
		});
	}

	function handleSpeedy(data){
		console.log('handleSpeedy:', data);
		stage.game.boards = data.boards;
		timerBall.expand(null, handleTimerBallExpandBreak);
		achievementBoard.hide();
	}

	function handlePlay(){
		setBoards();
		timerBall.deflate();
		achievementBoard.show();
	}

	function handleCard(data){
		console.log('handleCard:', data);
		boards[data.boardId].setCard(data.card, stage.players[data.playerId].name);
		timerBall.setCard(boards[data.boardId].options.color);
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
		var achievement = getAchievement(data.achievement, stage.players[data.player], data.data);
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
			// case 'screwed':
			// 	return { text: data.name + ' blocked ' + player.name };
			case 'firstOfGame':
				return { text: player.name + ' played the first card' };
			case 'streak':
				return { text: player.name + ' is ' + getStreakName(data.level) };
			// case 'streakBroke':
			// 	return { text: player.name + ' stopped ' + data.name + '\'s streak' };
			case 'last':
				return { text: player.name + ' has ' + data.count + ' card' + (data.count === 1 ? '' : 's') };
			case 'test':
				return { text: 'I am testing this thing' };
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
		for(var i = 0; i < stage.game.boards.length; i++) {
			boards[i].setCard(stage.game.boards[i].current);
			var prevColor = boards[i].options.color;
			boards[i].options.color = stage.game.boards[i].color;
			boards[i].appear(prevColor);
		}
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
		}
		stage.players[1] = {
			id: 1,
			name: 'Cow',
		}

		var boardId = 0;
		var playerId = 0;
		game.input.keyboard.onPressCallback = function(key, event){
			switch(event.charCode){
				case 113:
					handleAchieve({ achievement: 'firstOfGame', player: 0 });
					break;
				default:
					if(event.charCode >= 48 && event.charCode <= 57){
						var number = event.charCode - 48;
						handleCard({ card: number.toString(), boardId: _.random(0, stage.game.boardCount - 1), playerId: _.random(0, stage.players.length - 1) });
					}
					return;
			}
		}
	}

	stageState = {

		preload: function(){
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
			
			socket.on('speed:stage:start', handleStart);
			socket.on('speed:stage:card', handleCard);
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
			socket.off('speed:stage:card', handleCard);
			socket.off('speed:stage:winner', handleWinner);
		},

	}

})();