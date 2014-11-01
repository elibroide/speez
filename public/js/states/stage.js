// stage.js

var stageState;

(function(){

	// gui
	var stageArea;
	var container;
	var boards;
	var timerBall;

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
	}

	function handleTimerBallExpandBreak(){
		incoming.show(['3', '2', '1', 'SPEEZ'], { 
			isTexts: true,
			complete: handleIncomingComplete,
			completeTime: 1,
		});
	}


	function handleIncomingComplete(){
		setBoards();
		timerBall.deflate();
		if(config.isTest){
			return;
		}
		socket.emit('speed:stage:play');
	}

	function handleWinnerTimerBallExpand(){
		var texts = [ 'SPEEZ', 'Complete', '', 'The', 'Winner', 'Is' ];
		if(config.isTest){
			texts = ['test'];
		}
		incoming.show(texts, {
			isTexts: true,
			complete: function(){
				_.delay(function(){ game.state.start('stageFinish') }, 1);
			},
			completeTime: 1,
		});
	}

	// handling socket

	function handleStart(){
		var texts = [ 'Get', 'Ready', '5', '4', '3', '2', '1', 'SPEEZ' ];
		if(config.isTest){
			texts = ['test'];
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
	}

	function handleCard(data){
		console.log('handleCard:', data);
		boards[data.boardId].setCard(data.card, stage.players[data.playerId].name);
		timerBall.setCard(boards[data.boardId].options.color);
	}

	function handleWinner(data){
		console.log('handleWinner:', data);
		stage.game.winner = data.winner;
		timerBall.expand(handleWinnerTimerBallExpand);
	}

	// other

	function doSpeedy(){
		if(config.isTest){
			handleWinner({ winner: 0 });
			// handleSpeedy({ boards: generateBoards() });
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
			socket.emit('speed:stage:loaded');
		},

		update: function(){

		},

		shutdown: function(){
			socket.off('speed:stage:start', handleStart);
			socket.off('speed:stage:card', handleCard);
			socket.off('speed:stage:winner', handleWinner);
		},

	}

})();