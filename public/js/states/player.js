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

	var overlapCard;
	var heldCard;
	var heldCardBoardId;
	var heldCardOverlapId;

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
			var card = drawCard(player.game.hand[i], i, true);
		}

		// animation start
		var timeline = new TimelineLite({ delay: 1 });
		timeline.add(_.invoke(boards, 'appear', 0x333333), 0, null, 0);
		timeline.add(_.invoke(hand, 'startCard'), 0, null, 0);
		timeline.add(_.invoke(hand, 'appearCard'), null, null, 0.2);
		if(config.isTest){
			timeline.timeScale(9);
		}

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

	function handleCardPickedUp(card){
		_.each(hand, function(cardInHand){
			if(!cardInHand || cardInHand === card || !cardInHand.faceup){
				return;
			}
			if(compareCards(cardInHand.card, card.card)){
				// card.setOverlapSighted();
				cardInHand.setOverlapSighted();
			}
		});
	}

	function handleCardPutDown(card){
		overlapCard = null;
		if(card.thresholdHit !== Card.THRESHOLD_NONE){
			holdCard(card);
			placeCardBoard(card, card.thresholdHit)
		} else if(card.overlap !== null && hand[card.overlap] && compareCards(card.card, hand[card.overlap].card) && hand[card.overlap].faceup){
			holdCard(card);
			placeCardOverlap(card, card.overlap);
		} else {
			card.returnCard();
		}
	}

	function holdCard(card){
		heldCard = card;
		_.invoke(hand, 'enable', false);
	}

	function placeCardBoard(card, thresholdId){
		card.placeCardBoard();
		heldCardBoardId = getBoard(thresholdId);
		if(config.isTest){
			testCardPutBoard({ boardId: heldCardBoardId, handId: card.index });
			return;
		}
		socket.emit('speed:player:cardBoard', { boardId: heldCardBoardId, handId: card.index }, handleCardBoard);
	}

	function placeCardOverlap(card, overlap){
		card.placeCardOverlap();
		if(config.isTest){
			testCardPutOverlap(card, overlap);
			return;
		}
		socket.emit('speed:player:cardOverlap', { overlapId: overlap, handId: card.index }, handleCardOverlap);
	}

	function handleCardOverlapped(card, overlap){
		if(overlapCard){
			_.invoke(boards, 'cancelProximity')
			overlapCard.cancelOverlapped();
			card.cancelOverlapping();
		}
		overlapCard = null;
		if(overlap === undefined){
			return;
		}
		var targetCard = hand[overlap];
		if(!targetCard || !targetCard.faceup || !compareCards(targetCard.card, card.card)){
			return;
		}
		overlapCard = targetCard;
		overlapCard.setOverlapped();
		card.setOverlapping();
		_.invoke(boards, 'setProximity', false)
	}

	function handleCardProximity(card, threshold){
		if(threshold === undefined){
			_.invoke(boards, 'cancelProximity');
			card.cancelProximity();
		} else {
			_.invoke(boards, 'setProximity', false);
			var board = boards[getBoard(threshold)];
			board.setProximity(true);
			card.setProximity(board.options.color);
		}
	}

	// handling socket

	function handleStart(data){
		console.log('handleStart:', data);
		drawGui();
	}

	function handleWinner(data){
		console.log('handleWinner:', data);
		var timeline = new TimelineLite();
		var dissipateTime = 1;
		player.game.winner = data.winner;
		if(data.winner){
			// play winner animation
			_.invoke(hand, 'unattach');
			_.invoke(hand, 'reject');
			var distance = 100;
			var speezTime = 1;
			var getHeight = hand[0].options.height * Layout.instance.scaleY;
			timeline.to(hand[0], speezTime, { x: 150 - distance * 2, y: '+=' + getHeight * 2, ease: Back.easeOut }, 0);
			timeline.to(hand[1], speezTime, { x: 150 - distance, y: '+=' + getHeight * 1, ease: Back.easeOut  }, 0);
			timeline.to(hand[3], speezTime, { x: 150 + distance, y: '-=' + getHeight * 1, ease: Back.easeOut  }, 0);
			timeline.to(hand[4], speezTime, { x: 150 + distance * 2, y: '-=' + getHeight * 2, ease: Back.easeOut  }, 0);
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

	function handleCardOverlap(data) {
		console.log('handleCardOverlap:', data);
		_.invoke(hand, 'enable', true);
		_.invoke(boards, 'cancelProximity');
		if(!data.confirm){
			_.invoke(hand, 'reject')
			return;
		}
		hand[data.handId].enable(false);
		hand[data.overlapId].reject();

		var newCard = drawCard(data.newCard, data.handId, false, false);
		newCard.startCard();
		// var timeline = new TimelineLite();
		// timeline.add(newCard.startCard());
		// timeline.add(newCard.appearCard());
		// timeline.timeScale(2);
	}

	function handleCardBoard(data){
		console.log('handleCardBoard:', data);
		_.invoke(hand, 'enable', true);
		_.invoke(boards, 'cancelProximity');
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
		var isEmpty = player.game.cardCount < 5;
		var newCard = drawCard(data.newCard, data.handId, false, isEmpty);
		newCard.startCard();
		if(isEmpty){
			newCard.enable(false);
		}
		header.setText(getHeaderText());
	}

	// other

	function setNewCard(card, index, isEmpty) {
		
	}

	function compareCards(card1, card2){
		return card1 === card2;
	}

	function drawCard(card, index, isNew, isEmpty){
		var card = new com.speez.components.Card(index, 
			boardWidth, headerHeight + cardHeight * index, 
			boardWidthRight - boardWidth, cardHeight, {
				colors: colors,
				waitCard: isEmpty ? 'speez'[index] : '+',
				isNew: isNew,
				card: card,
				dragStartCallback: handleCardPickedUp,
				dragStopCallback: handleCardPutDown,
				heightOffset: headerHeight,
			}
		);
		card.overlapped.add(handleCardOverlapped);
		card.proximity.add(handleCardProximity);
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

	function testCardPutOverlap(card, overlapId){
		handleCardOverlap({ confirm: true, newCard: _.random(0, 9), handId: card.index, overlapId: overlapId, newOverlapCard: card.card });
	}

	function testCardPutBoard(data){
		var boardId = data.boardId;
		if(boardId % 2 === 0){
			var newCard = _.random(0, 9);
			if(boardId === 0){
				handleCardBoard({ confirm: true, handId: data.handId, newCard: newCard });
				if(player.game.cardCount === 0){
					setTimeout(function(){
						handleWinner({winner: true});
					}, 1000);
				}
			} else {
				setTimeout(function(){ 
					handleCardBoard({ confirm: true, handId: data.handId, newCard: newCard });
					if(player.game.cardCount === 0){
						setTimeout(function(){
							handleWinner({winner: false});
						}, 1000);
					}
				}, 1000);
			}
			return;
		}
		if(boardId === 3){
			setTimeout(function(){
				handleCardBoard({ confirm: false });
			}, 1000);
		} else {
			handleCardBoard({ confirm: false });
		}
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
