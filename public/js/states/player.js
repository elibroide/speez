// player.js

var playerState = (function(){

	// data
	var lastCards;

	// gui
	var header;
	var boards;
	var hand;
	var colors;
	var playerArea;
	var hand;
	var container;

	var headerHeight;
	var gameHeight;
	var boardMiddle;
	var boardWidth;
	var boardWidthCenter;
	var boardWidthRight;
	var cardHeight;

	var heldCard;
	var heldCardBoardId;

	function drawGui(){
		// sizes
		headerHeight = originalHeight * 0.125;
		gameHeight = originalHeight - headerHeight;
		gameHeightCenter = gameHeight / 2;
		boardMiddle = gameHeightCenter + headerHeight;
		boardWidth = 150;
		boardWidthCenter = boardWidth * 0.5;
		boardWidthRight = originalWidth - boardWidth;
		cardHeight = gameHeight / 5;

		boards = [];
		colors = [];
		for (var i = 0; i < player.game.boards.length; i++) {
			colors.push(parseInt(player.game.boards[i].color));
		};
		switch(player.game.boards.length) {
			case 2:
				boards[0] = new com.speez.components.Board(0, headerHeight, boardWidth, gameHeight, colors[0]);
				boards[1] = new com.speez.components.Board(boardWidthRight, headerHeight, boardWidth, gameHeight, colors[1]);
				// colors
				colors[2] = colors[0];
				colors[3] = colors[1];
				break;
			case 3:
				boards[0] = new com.speez.components.Board(0, headerHeight, boardWidth, gameHeightCenter, colors[0]);
				boards[1] = new com.speez.components.Board(boardWidthRight, headerHeight, boardWidth, gameHeight, colors[1]);
				boards[2] = new com.speez.components.Board(0, boardMiddle, boardWidth, gameHeightCenter, colors[2])
				// colors
				colors[3] = colors[1];
				break;
			case 4:
				boards[0] = new com.speez.components.Board(0, headerHeight, boardWidth, gameHeightCenter, colors[0]);
				boards[1] = new com.speez.components.Board(boardWidthRight, headerHeight, boardWidth, gameHeightCenter, colors[1]);
				boards[2] = new com.speez.components.Board(0, boardMiddle, boardWidth, gameHeightCenter, colors[2])
				boards[3] = new com.speez.components.Board(boardWidthRight, boardMiddle, boardWidth, gameHeightCenter, colors[3])
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
		playerArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		playerArea.attach(container, { width: originalWidth, height: originalHeight });

		// header
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			text: getHeaderText(),
			color: 0xffffff,
		});
		header.alpha = 0;
		TweenLite.to(header, 1, {alpha: 1})
	}

	// handle gui

	function handleStageReady(){
		if(config.isTest){
			setTest();
			return;
		}

		socket.on('speed:player:start', handleStart);
		socket.on('speed:player:winner', handleWinner);
		socket.emit('speed:player:loaded');
	}

	function handleCardPutDown(card, thresholdId){
		heldCard = card;
		card.placeCard();
		_.invoke(hand, 'enable', false);
		heldCardBoardId = getBoard(thresholdId);
		if(config.isTest){
			testCardPut(card, heldCardBoardId);
			return;
		}
		socket.emit('speed:player:card', { boardId: heldCardBoardId, handId: card.index }, handleCard);
	}

	// handling socket

	function handleStart(data){
		library = player.game.library;
		
		drawGui();
	}

	function handleWinner(data){
		var timeline = new TimelineLite();
		var dissipateTime = 1;
		player.game.winner = data.winner;
		if(data.winner){
			// play winner animation
			_.invoke(hand, 'unattach');
			var distance = 150;
			var speezTime = 1;
			timeline.to(hand[0], speezTime, { x: 150 - distance * 2, y: hand[2].y }, 0);
			timeline.to(hand[1], speezTime, { x: 150 - distance, y: hand[2].y }, 0);
			timeline.to(hand[3], speezTime, { x: 150 + distance, y: hand[2].y }, 0);
			timeline.to(hand[4], speezTime, { x: 150 + distance * 2, y: hand[2].y }, 0);
			timeline.to(boards, speezTime, { alpha: 0 }, 0);
			var texts = _.pluck(hand, 'text');
			timeline.to(_.pluck(texts, 'scale'), speezTime, { x: 1, y: 1 }, 0);
			// blank
			timeline.to(hand, speezTime, { delay: 1 });
			timeline.addLabel('dissipate');
		} else {
			// play looser animation
			_.invoke(hand, 'reject')
			_.invoke(hand, 'enable', false)
			timeline.to(boards, dissipateTime, { alpha: 0 }, 0);
			timeline.addLabel('dissipate');
		}
		timeline.to(container, dissipateTime, { alpha: 0 }, 'dissipate');
		timeline.to(hand, dissipateTime, { alpha: 0 }, 'dissipate');
		timeline.add(function() {
			common.tweenStageColor(0x000000, function(){
				setTimeout(function(){ 
					game.state.start('playerFinish'); 
				}, 500);
			});
		}, 'dissipate');
	}

	function handleCard(data){
		_.invoke(hand, 'enable', true);
		if(!data.confirm){
			// reject
			_.invoke(hand, 'reject')
			var timeline = new TimelineLite();
			var color = boards[heldCardBoardId].options.color;
			var isLeft = heldCardBoardId % 2 === 0;
			timeline.add(_.invoke(hand, 'shake', isLeft, color), null, null, 0.05);
			// timeline.add(_.invoke(hand, 'shake'), '-=0.75', null, 0.05);
			return;
		}
		player.game.cardCount--;
		var isEmpty = library.length === 0;
		var newCard = drawCard(heldCard.index, false);
		newCard.startCard();
		if(isEmpty){
			lastCards--;
			newCard.enable(false);
		}
		header.setText(getHeaderText());
	}

	// other

	function drawCard(index, isNew){
		var card = new com.speez.components.Card(index, 
			boardWidth, headerHeight + cardHeight * index, 
			boardWidthRight - boardWidth, cardHeight, {
				colors: colors,
				waitCard: library.length === 0 ? 'speez'[index] : '+',
				isNew: isNew,
				card: library.pop(),
				putDownCallback: handleCardPutDown,
			}
		);
		if(!isNew){
			card.options.startTime = 0.5;
			card.options.spinTime = 0.5;
		}
		hand[index] = card;
		return card;
	}

	function getBoard(boardId){
		if(player.game.boards.length === 2 && boardId === 2){
			return 0;
		} 
		if(player.game.boards.length === 2 && boardId === 3){
			return 1;
		}
		if(player.game.boards.length === 3 && boardId === 3){
			return 1;
		} 
		return boardId;
	}

	function getHeaderText(){
		return player.name + ' - ' + player.game.cardCount;
	}

	// test

	function setTest(){
		handleStart();
	}

	function testCardPut(card, boardId){
		if(boardId === 0 || boardId === 2){
			// reject
			handleCard({ confirm: true });
			if(lastCards === 0){
				setTimeout(function(){
					handleWinner({winner: false});
				}, 1000);
			}
			return;
		}
		handleCard({ confirm: false });
	}

	return {

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
			lastCards = 5;
			common.tweenStageColor(0x333333, handleStageReady);
		},

		update: function(){
		},

		shutdown: function(){
			socket.off('speed:player:start', handleStart);
			socket.off('speed:player:winner', handleWinner);
		},
	}
})();
