// player.js

var playerState;

(function(){

	// data
	var library;
	var hand;

	// gui
	var lastCards;
	var boards;
	var hand;
	var colors;
	var playerArea;
	var container;

	var boardWidth;
	var boardWidthCenter;
	var boardWidthRight;
	var cardHeight;

	var heldCard;

	function drawGui(){
		// sizes
		boardWidth = 150;
		boardWidthCenter = boardWidth * 0.5;
		boardWidthRight = originalHeight - boardWidth;
		cardHeight = originalWidth / 5;

		boards = [];
		
		colors = [0xff0000, 0x00ff00, 0xffff00, 0x0000ff];
		switch(player.game.boardCount) {
			case 2:
				boards[0] = new com.speez.components.Board(0, 0, boardWidth, originalWidth, colors[0]);
				boards[1] = new com.speez.components.Board(boardWidthRight, 0, boardWidth, originalWidth, colors[1]);
				// colors
				colors[2] = colors[0];
				colors[3] = colors[1];
				break;
			case 3:
				boards[0] = new com.speez.components.Board(0, 0, boardWidth, originalWidthCenter, colors[0]);
				boards[1] = new com.speez.components.Board(boardWidthRight, 0, boardWidth, originalWidth, colors[1]);
				boards[2] = new com.speez.components.Board(0, originalWidthCenter, boardWidth, originalWidthCenter, colors[2])
				// colors
				colors[3] = colors[1];
				break;
			case 4:
				boards[0] = new com.speez.components.Board(0, 0, boardWidth, originalWidthCenter, colors[0]);
				boards[1] = new com.speez.components.Board(boardWidthRight, 0, boardWidth, originalWidthCenter, colors[1]);
				boards[2] = new com.speez.components.Board(0, originalWidthCenter, boardWidth, originalWidthCenter, colors[2])
				boards[3] = new com.speez.components.Board(boardWidthRight, originalWidthCenter, boardWidth, originalWidthCenter, colors[3])
				break;
		}

		hand = [];
		for(var i = 0; i < 5; i++){
			var card = drawCard(i, true);
		}

		// animation start
		var timeline = new TimelineLite({ delay: 1 });
		timeline.add(_.invoke(boards, 'appear', 0x333333), 0, null, 0);
		timeline.add(_.invoke(hand, 'startCard'), 0, null, 0);
		timeline.add(_.invoke(hand, 'appearCard'), null, null, 0.2);

		// Content
		playerArea = new com.LayoutArea(0, 0, originalHeight, originalWidth, { isDebug: false });
		container = game.add.sprite();
		playerArea.attach(container, { width: originalHeight, height: originalWidth });
	}

	// handle gui

	function handleStageReady(){
		if(config.isTest){
			setTest();
			return;
		}

		socket.on('speed.player.start', handleStart);
		socket.on('speed.player.card', handleCard);
		socket.emit('speed.player.loaded');
	}

	function handleCardPutDown(card, thresholdId){
		heldCard = card;
		card.placeCard();
		_.invoke(hand, 'enable', false);
		var boardId = getBoard(thresholdId);
		if(config.isTest){
			testCardPut(card, boardId);
			return;
		}
		socket.emit('speed.player.card', { boardId: boardId, handId: card.index });
	}

	// handling socket

	function handleStart(data){
		library = player.game.library;
		
		drawGui();
	}

	function handleCard(data){
		_.invoke(hand, 'enable', true);
		if(!data.confirm){
			// reject
			_.invoke(hand, 'reject')
			var timeline = new TimelineLite();
			timeline.add(_.invoke(hand, 'shake'), null, null, 0.05);
			timeline.add(_.invoke(hand, 'shake'), '-=0.75', null, 0.05);
			return;
		}

		var isEmpty = library.length === 0;
		var newCard = drawCard(heldCard.index, false);
		newCard.startCard();
		if(isEmpty){
			lastCards--;
			newCard.enable(false);
		}
	}

	// other

	function drawCard(index, isNew){
		var card = new com.speez.components.Card(index, boardWidth, cardHeight * index, boardWidthRight - boardWidth, cardHeight, {
			colors: colors,
			waitCard: library.length === 0 ? '-' : '+',
			isNew: isNew,
			card: library.pop(),
			putDownCallback: handleCardPutDown,
		});
		if(!isNew){
			card.options.startTime = 0.5;
			card.options.spinTime = 0.5;
		}
		hand[index] = card;
		return card;
	}

	function getBoard(boardId){
		if(player.game.boardCount === 2 && boardId === 2){
			return 0;
		} 
		if(player.game.boardCount === 2 && boardId === 3){
			return 1;
		}
		if(player.game.boardCount === 3 && boardId === 3){
			return 1;
		} 
		return boardId;
	}

	// test

	function setTest(){
		var library = [];
		for (var i = 0; i < 6; i++) {
			library.push(_.random(0, 9));
		};
		console.log(library);
		game.player.library = library;

		handleStart();
	}

	function testCardPut(card, boardId){
		if(boardId === 0){
			// reject
			handleCard({ confirm: false });
			return;
		}
		handleCard({ confirm: true });
	}

	playerState = {

		preload: function(){

			layout = new Layout({
				game: game,
	        	width: originalHeight,
	        	height: originalWidth,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);
		},

		create: function(){
			lastCards = 5;
			common.tweenStageColor(0x333333, handleStageReady);
		},

		update: function(){
		},

		render: function(){
		},
	}
})();
