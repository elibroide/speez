// stage.js

var stageState;

(function(){

	// gui
	var stageArea;
	var container;
	var boards;
	var timerBall;

	function drawStart(){
	}

	function drawGui(){

		// Boards
		boards = [];
		switch(stage.game.boards.length) {
			case 2:
				boards[0] = new com.speez.components.Board(0, 0, originalWidthCenter, originalHeight, 0xff0000);
				boards[1] = new com.speez.components.Board(originalWidthCenter, 0, originalWidthCenter, originalHeight, 0x00ff00);
				break;
			case 3:
				boards[0] = new com.speez.components.Board(0, 0, originalWidthCenter, originalHeightCenter, 0xff0000);
				boards[1] = new com.speez.components.Board(originalWidthCenter, 0, originalWidthCenter, originalHeight, 0x00ff00);
				boards[2] = new com.speez.components.Board(0, originalHeightCenter, originalWidthCenter, originalHeightCenter, 0xffff00)
				break;
			case 4:
				boards[0] = new com.speez.components.Board(0, 0, originalWidthCenter, originalHeightCenter, 0xff0000);
				boards[1] = new com.speez.components.Board(originalWidthCenter, 0, originalWidthCenter, originalHeightCenter, 0x00ff00);
				boards[2] = new com.speez.components.Board(0, originalHeightCenter, originalWidthCenter, originalHeightCenter, 0xffff00)
				boards[3] = new com.speez.components.Board(originalWidthCenter, originalHeightCenter, originalWidthCenter, originalHeightCenter, 0x0000ff)
				break;
		}

		// Content
		stageArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		stageArea.attach(container, { width: originalWidth, height: originalHeight });

		timerBall = new com.speez.components.TimerBall(originalWidthCenter, originalHeightCenter, 120, { 
			counting: {
				complete: doSpeedy
			},
			expand: {
				breakCallback: handleTimerBallExpandBreak,
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
		socket.emit('speed.stage.play');
	}

	// handling socket

	function handleStart(){
		incoming.show([ 'Get', 'Ready', '5', '4', '3', '2', '1', 'SPEEZ' ], {
			isTexts: true,
			complete: handleIncomingComplete,
			completeTime: 1,
		});
	}

	function handleSpeedy(data){
		stage.game.boards = data.boards;
		timerBall.expand();
	}

	function handleCard(data){
		debugger;
		boards[data.boardId].setCard(data.card, stage.players[data.playerId].name);
		timerBall.setCard(boards[data.boardId].options.color);
	}

	// other

	function doSpeedy(){
		if(config.isTest){
			handleSpeedy({ boards: generateBoards() });
			return;
		}
		socket.emit('speed.stage.speedy');
	}

	function setBoards(){
		for(var i = 0; i < stage.game.boards.length; i++) {
			boards[i].setCard(stage.game.boards[i].current);
		}
	}

	function generateBoards(){
		var boards = [];
		for(var i = 0; i < stage.game.boardCount; i++){
			boards[i] = { current: _.random(0, 9) };
		}
		return boards;
	}

	function setTest(){
		stage.game.boardCount = 2;
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

			drawGui();
			
			if(config.isTest){
				setTest();
				handleStart({ boards: generateBoards() });
				return;
			}
			socket.on('speed.stage.start', handleStart);
			socket.on('speed.stage.speedy', handleSpeedy);
			socket.on('speed.stage.card', handleCard);
			socket.emit('speed.stage.loaded');
		},

		update: function(){

		},

		render: function(){

		},

	}

})();