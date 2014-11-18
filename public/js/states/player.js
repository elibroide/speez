// player.js

var playerState = (function(){

	// data
	var lastCards;

	// gui
	var footer;
	var fullScreen;
	var header;
	var boards;
	var hand;
	var colors;
	var playerArea;
	var container;

	var headerHeight;
	var gameHeight;
	var barHeight;
	var boardMiddle;
	var boardWidth;
	var boardWidthCenter;
	var boardWidthRight;
	var cardHeight;

	var nextCard;
	var overlapCard;
	var sightedCards;

	function drawGui(){
		// sizes
		headerHeight = originalHeight * 0.125;
		barHeight = 50;
		gameHeight = originalHeight - headerHeight - barHeight;
		gameHeightCenter = gameHeight / 2;
		boardMiddle = gameHeightCenter + headerHeight;
		boardWidth = 150;
		boardWidthCenter = boardWidth * 0.5;
		boardWidthRight = originalWidth - boardWidth;
		cardHeight = gameHeight / 5;
		cardWidth = originalWidth - boardWidth * 2;

		boards = [];
		colors = [];
		for (var i = 0; i < player.game.boards.length; i++) {
			colors.push(player.game.boards[i].color);
		};
		switch(player.game.boards.length) {
			case 2:
				boards[0] = new com.speez.components.PlayerBoard(0, headerHeight, boardWidth, gameHeight, colors[0]);
				boards[1] = new com.speez.components.PlayerBoard(boardWidthRight, headerHeight, boardWidth, gameHeight, colors[1]);
				// colors
				colors[2] = colors[0];
				colors[3] = colors[1];
				break;
			case 3:
				boards[0] = new com.speez.components.PlayerBoard(0, headerHeight, boardWidth, gameHeightCenter, colors[0]);
				boards[1] = new com.speez.components.PlayerBoard(boardWidthRight, headerHeight, boardWidth, gameHeight, colors[1]);
				boards[2] = new com.speez.components.PlayerBoard(0, boardMiddle, boardWidth, gameHeightCenter, colors[2])
				// colors
				colors[3] = colors[1];
				break;
			case 4:
				boards[0] = new com.speez.components.PlayerBoard(0, headerHeight, boardWidth, gameHeightCenter, colors[0]);
				boards[1] = new com.speez.components.PlayerBoard(boardWidthRight, headerHeight, boardWidth, gameHeightCenter, colors[1]);
				boards[2] = new com.speez.components.PlayerBoard(0, boardMiddle, boardWidth, gameHeightCenter, colors[2]);
				boards[3] = new com.speez.components.PlayerBoard(boardWidthRight, boardMiddle, boardWidth, gameHeightCenter, colors[3]);
				break;
		}

		// Content
		playerArea = new com.LayoutArea(boardWidth, headerHeight, cardWidth, gameHeight, { isDebug: false });
		container = game.add.sprite();
		playerArea.attach(container, { width: cardWidth, height: gameHeight });

		hand = [];
		for(var i = 0; i < 5; i++){
			var index = i % 5;
			var card = drawCard(player.game.hand[index], index, true, i > player.game.cardCount);
			hand[index] = card;
		}

		// animation start
		var timeline = new TimelineLite({ delay: 1 });
		timeline.add(_.invoke(boards, 'appear', 0x333333), 0, null, 0);
		timeline.add(_.invoke(hand, 'startCard'), 0, null, 0);
		timeline.add(_.invoke(hand, 'appearCard'), null, null, 0.2);
		if(config.isTest){
			timeline.timeScale(9);
		}

		// header
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			text: getHeaderText(),
			color: 0x1E1E1E,
		});
		header.alpha = 0;
		TweenLite.to(header, 1, {alpha: 1});

		// footer
		var barHeightGap = 10;
		footer = new com.speez.components.PlayerCardBar(0, originalHeight - (barHeight - barHeightGap), originalWidth, barHeight - barHeightGap);

	 	fullScreen = new com.speez.components.PlayerFullScreen(0, 0, originalWidth, originalHeight);
	}

	// handle gui

	function handleStageReady(){
		if(config.isTest){
			setTest();
			return;
		}

		socket.emit('speed:player:loaded');
	}

	function handleCardPickedUp(card){
		Audio.instance.play('fx', 'card/pickup');
		_.invoke(boards, 'setArrow');
		sightedCards = [];
		_.each(hand, function(cardInHand){
			if(!cardInHand || cardInHand === card || !cardInHand.faceup){
				return;
			}
			if(compareCards(cardInHand.card, card.card)){
				// card.setOverlapSighted();
				cardInHand.setOverlapSighted();
				sightedCards.push(cardInHand);
			}
		});
		// create a beneath card
		nextCard = drawCard(null, card.index, false, player.game.cardCount <= 5);
	}

	function handleCardPutDown(card){
		_.invoke(boards, 'cancelArrow');
		overlapCard = null;
		_.each(sightedCards, function(sightedCard){
			sightedCard.cancelOverlapSighted();
		});
		if(card.thresholdHit !== Card.THRESHOLD_NONE){
			_.invoke(hand, 'enable', false);
			placeCardBoard(card, card.thresholdHit)
			Audio.instance.play('fx', 'card/placeBoard');
		} else if(card.overlap !== null && hand[card.overlap] && compareCards(card.card, hand[card.overlap].card) && hand[card.overlap].faceup){
			_.invoke(hand, 'enable', false);
			placeCardOverlap(card, card.overlap);
			Audio.instance.play('fx', 'card/placeOverlap');
		} else {
			card.returnCard();
			destroyNext();
			Audio.instance.play('fx', 'card/return');
		}
	}

	function placeCardBoard(card, thresholdId){
		card.placeCardBoard();
		var boardId = getBoard(thresholdId);
		if(config.isTest){
			testCardPutBoard({ boardId: boardId, handId: card.index });
			return;
		}
		socket.emit('speed:player:cardBoard', { boardId: boardId, handId: card.index }, handleCardBoard);
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
			_.invoke(boards, 'setArrow');
			return;
		}
		overlapCard = targetCard;
		overlapCard.setOverlapped();
		card.setOverlapping();
		_.invoke(boards, 'cancelArrow');
		_.invoke(boards, 'setProximity', false)
	}

	function handleCardProximity(card, threshold){
		_.invoke(boards, 'cancelProximity');
		if(threshold === undefined){
			_.invoke(boards, 'setArrow');
			card.cancelProximity();
		} else {
			_.invoke(boards, 'cancelArrow');
			_.invoke(boards, 'setProximity', false);
			var board = boards[getBoard(threshold)];
			board.setProximity(true);
			board.setArrow();
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
		var timeline = new TimelineLite({ delay: 1 });
		var dissipateTime = 1;
		player.game.winner = data.winner;
		if(data.winner){
			// play winner animation
			_.invoke(hand, 'reject');
			var distance = 100;
			var speezTime = 1;
			var getHeight = hand[0].options.height * Layout.instance.scaleY;
			timeline.add(_.invoke(hand, 'playWinnerStart'), null, null, 0.05);
			timeline.addLabel('start');
			timeline.to(hand[0], speezTime, { x: -distance * 2, y: '+=' + getHeight * 2, ease: Back.easeOut }, 'start');
			timeline.to(hand[1], speezTime, { x: -distance, y: '+=' + getHeight * 1, ease: Back.easeOut  }, 'start');
			timeline.to(hand[3], speezTime, { x: distance, y: '-=' + getHeight * 1, ease: Back.easeOut  }, 'start');
			timeline.to(hand[4], speezTime, { x: distance * 2, y: '-=' + getHeight * 2, ease: Back.easeOut  }, 'start');
			timeline.add(_.invoke(hand, 'playWinner'), null, null, 0.05);
			timeline.add(_.invoke(hand, 'playWinner').reverse(), '-=' + 0.01, null, 0.05);
			timeline.to(boards, speezTime, { alpha: 0 }, 0);
			var texts = _.pluck(hand, 'text');
			timeline.to(_.pluck(texts, 'scale'), speezTime, { x: 1, y: 1 }, 0);
			// blank
			timeline.to(hand, speezTime, { delay: 1 });
			timeline.addLabel('dissipate');
		} else {
			// play looser animation
			_.invoke(hand, 'reject');
			_.invoke(hand, 'enable', false);
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
			destroyNext();
			_.invoke(hand, 'reject')
			Audio.instance.play('fx', 'card/reject');
			return;
		}
		// create new card
		destroyCard(hand[data.handId]);
		hand[data.overlapId].overlapComplete();
		player.game.cardCount--;
		hand[data.handId] = nextCard;
		nextCard.card = data.newCard;
		var timeline = nextCard.startCard();
		if(player.game.cardCount < 5){
			nextCard.enable(false);
		} else {
			timeline.add(nextCard.appearCard())
		}
		nextCard = null;
		setFooter();
		Audio.instance.play('fx', 'card/overlapSuccess');
	}

	function handleCardBoard(data){
		console.log('handleCardBoard:', data);
		_.invoke(boards, 'cancelProximity');
		if(!data.confirm){
			// reject
			destroyNext();
			_.invoke(hand, 'reject')
			var timeline = new TimelineLite();
			var color = boards[data.boardId].options.color;
			var isLeft = data.boardId % 2 === 0;
			timeline.add(hand[data.handId].shake(isLeft, color));
			timeline.add(hand[data.handId].shake(isLeft, color), '-=' + hand[data.handId].options.shakeTime * 0.75);
			timeline.add(hand[data.handId].shake(isLeft, color), '-=' + hand[data.handId].options.shakeTime * 0.75);
			if(data.name){
				var fullScreenShowTimeline = fullScreen.show([
					{ text: 'Snake', color: 0xffffff },
					{ text: 'Blocked', color: 0xF5CE2C },
					{ text: 'You', color: 0xF5CE2C },
				], { text: '\uf05e', color: 0xF5CE2C },
				{ delayTime: 0.75});
				timeline.add(fullScreenShowTimeline, 0);
			}
			timeline.add(function(){
				_.invoke(hand, 'enable', true);
			});
			// timeline.add(_.invoke(hand, 'shake', isLeft, color), null, null, 0.05);
			// timeline.add(_.invoke(hand, 'shake'), '-=0.75', null, 0.05);
			Audio.instance.play('fx', 'card/boardFailed');
			return;
		}
		// create new card
		_.invoke(hand, 'enable', true);
		destroyCard(hand[data.handId]);
		player.game.cardCount--;
		hand[data.handId] = nextCard;
		nextCard.card = data.newCard;
		var timeline = nextCard.startCard();
		if(player.game.cardCount < 5){
			nextCard.enable(false);
		} else {
			timeline.add(nextCard.appearCard())
		}
		nextCard = null;
		setFooter();
		Audio.instance.play('fx', 'card/boardSuccess');
	}

	function handleAchievement(data){
		console.log('handleAchievement:', data);
		var achievement = data.achievement;
		data = data.data;
		switch(achievement){
			case 'screwed':
				onScrewed(data.name);
				return { text: 'Blocked by ' + data.name, isGood: false };
			case 'screw':
				return { text: 'You blocked ' + data.name, isGood: true, sound: 'achievement/screw' };
			case 'firstOfGame':
				return { text: 'First card', isGood: true };
			case 'streak':
				return { text: 'You are ' + getStreakName(data.level), isGood: true, sound: 'achievement/streak' + data.level };
			// case 'streakBroke':
			// 	return { text: data.name + ' stopped your streak', isGood: false };
			// case 'streakBreak':
			// 	return { text: 'You stopped ' + data.name + '\'s streak', isGood: true };
			case 'last':
				footer.flash(data.count);
				Audio.instance.play('fx', 'achievement/last' + data.count);
				return ;
			case 'test':
				return { text: 'I am testing this thing', isGood: data.isGood };
		}
	}

	function handleLeave(data){
		console.log('handleLeave:', data);
		delete player;
		Audio.instance.stop('fx');
		TweenMax.killAll();
		var timeline = new TimelineLite();
		timeline.to(_.flatten([hand, boards, container, header]), 1, {alpha: 0});
		timeline.add(common.tweenStageColor(0x000000, function(){
			setTimeout(function(){ 
				game.state.start('main'); 
			}, 500);
		}));
	}

	// other

	function getAchievementData(achieve, data){
		
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

	function compareCards(card1, card2){
		return card1 === card2;
	}

	function destroyNext(){
		if(!nextCard){
			return;
		}
		nextCard.destroy();
	}

	function destroyCard(card){
		card.enable(false);
		_.delay(function(){
			card.destroy();
		}, card.options.placeCardTime * 1000);
	}

	function drawCard(card, index, isNew, isEmpty){
		var card = new com.speez.components.Card(index, 
			boardWidth, cardHeight * index + headerHeight, 
			cardWidth, cardHeight, {
				colors: colors,
				waitCard: isEmpty ? 'speez'[index] : '+',
				textColor: isEmpty ? 0x222222 : 0xeeeeee,
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
		// container.addChild(card);
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
		return player.name;
	}

	function setFooter(){
		footer.setProgress(player.game.cardCount / player.game.cardTotal);
	}

	// test

	function setTest(){
		handleStart();
		game.input.keyboard.onPressCallback = function(key, event){
			switch(event.charCode){
				case 49:
					handleAchievement({ achievement: 'test', data: { isGood: false } });
					break;
				case 50: 
					handleAchievement({ achievement: 'test', data: { isGood: true } });
					break;
			}
		}
	}

	function testCardPutOverlap(card, overlapId){
		handleCardOverlap({ confirm: true, newCard: _.random(0, 9), handId: card.index, overlapId: overlapId, newOverlapCard: card.card });
	}

	function testCardPutBoard(data){
		var boardId = data.boardId;
		var returnData = _.pick(data, ['boardId', 'handId']);
		if(boardId % 2 === 0){
			var newCard = _.random(0, 9);
			if(player.game.cardCount === 6){
				handleAchievement({ achievement: 'last', data: { count: 5 } });
			} else if(player.game.cardCount === 2){
				handleAchievement({ achievement: 'last', data: { count: 1 } });
			}
			if(boardId === 0){
				handleCardBoard(_.extend({ confirm: true, newCard: newCard }, returnData));
				if(player.game.cardCount === 0){
					setTimeout(function(){
						handleWinner({winner: true});
					}, 10);
				}
			} else {
				setTimeout(function(){ 
					handleCardBoard(_.extend({ confirm: true, newCard: newCard }, returnData));
					if(player.game.cardCount === 0){
						setTimeout(function(){
							handleWinner({winner: false});
						}, 10);
					}
				}, 1000);
			}
			return;
		}
		if(boardId === 3){
			setTimeout(function(){
				handleCardBoard(_.extend({ confirm: false }, returnData));
			}, 1000);
		} else {
			handleCardBoard(_.extend({ confirm: false, name: 'Slug' }, returnData));
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
			common.tweenStageColor(0x1E1E1E, handleStageReady);

			socket.on('speed:player:leave', handleLeave);
			socket.on('speed:player:start', handleStart);
			socket.on('speed:player:winner', handleWinner);
			socket.on('speed:player:achieve', handleAchievement);
		},

		update: function(){
		},

		render: function(){
			if(config.isTest){
				game.debug.cameraInfo(game.camera, 32, 32);
			}
		},

		shutdown: function(){
			socket.off('speed:player:leave', handleLeave);
			socket.off('speed:player:start', handleStart);
			socket.off('speed:player:achieve', handleAchievement);
			socket.off('speed:player:winner', handleWinner);
		},
	}
})();
