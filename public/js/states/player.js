// player.js

var playerState = (function(){

	// data
	var state;
	var isReady;
	var winnerColor;

	// gui
	var footer;
	var header;
	var boards;
	var hand;
	var colors;
	var playerArea;
	var container;

	// timeline
	var screenTimeline;

	var headerHeight;
	var gameHeight;
	var barHeight;
	var boardMiddle;
	var boardWidth;
	var boardWidthCenter;
	var boardWidthRight;
	var cardHeight;

	var achieveText;
	var achieveSymbol;

	var nextCard;
	var overlapCard;
	var sightedCards;
	var heldCards = [];

	var winnerText;
	var btnReady;

	var btnContinue;
	var btnExit;
	var pause;

	function drawGui(){
		// sizes
		headerHeight = originalHeight * 0.125;
		barHeight = 25;
		gameHeight = originalHeight - headerHeight - barHeight;
		gameHeightCenter = gameHeight / 2;
		boardMiddle = gameHeightCenter + headerHeight;
		boardWidth = 150;
		boardWidthCenter = boardWidth * 0.5;
		boardWidthRight = originalWidth - boardWidth;
		cardHeight = gameHeight / 5;
		cardWidth = originalWidth - boardWidth * 2;

		// Content
		playerArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		playerArea.attach(container, { width: originalWidth, height: originalHeight });

		hand = [];
		for(var i = 0; i < 5; i++){
			var index = i % 5;
			var card = drawCard(player.game.hand[index], index, true, i > player.game.cardCount);
			hand[index] = card;
		}

		// header
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			text: getHeaderText(),
			alpha: 0,
		});
		var headerButton = game.add.text(50, headerHeight * 0.5, '\uf04c', {
			font: "65px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
		headerButton.anchor.set(0.5);
	    headerButton.inputEnabled = true;
	    headerButton.events.onInputDown.add(handlePauseClicked);
		header.addLeft(headerButton);
		var avatar = game.add.sprite(-50, headerHeight * 0.5, player.avatar + '_head');
		avatar.scale.set(0.4);
		avatar.anchor.set(0.5);
		header.addRight(avatar);

		// footer
		var barHeightGap = 10;
		footer = new com.speez.components.PlayerCardBar(0, originalHeight - (barHeight - barHeightGap), originalWidth, barHeight - barHeightGap);
		setFooter();
	}

	function drawBoards(){
		destroyBoards();
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
	}

	function destroyBoards(){
		if(!boards){
			return;
		}
		_.each(boards, function(board){
			board.destroy();
		});
	}

	function drawPause(){
		var text = game.add.text(originalWidthCenter, 215, 'PAUZE', {
			font: "bold 50px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
	    text.anchor.set(0.5);

		btnContinue = new MenuButton(originalWidthCenter, 470, 486, 144, {
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

	    btnExit = new MenuButton(originalWidthCenter, 680, 486, 128, {
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

	function drawAchieveText(text){
		if(achieveText){
			achieveText.destroy();
		}
		achieveText = new Phaser.Text(game, 0, headerHeight - 25, text, {
			font: "40px Montserrat",
	        fill: "#f2cb42",
	        align: "center"
		});
		achieveText.anchor.set(0.5);
		header.addCenter(achieveText);
		return achieveText;
	}

	function drawSymbol(text){
		if(achieveSymbol){
			achieveSymbol.destroy();
		}
		achieveSymbol = new Phaser.Text(game, -50, headerHeight * 0.5, text, {
			font: "80px FontAwesome",
	        fill: "#f2cb42",
	        align: "center"
		});
		achieveSymbol.anchor.set(0.5);
		header.addRight(achieveSymbol);
		return achieveSymbol;
	}

	function onScrew(data){
		player.block++;
		player.points += data.points;
		drawAchieveText('YOU BLOCKED ' + data.data.screw);
		achieveText.alpha = 0;
		var timeline = new TimelineMax();
		timeline.to(achieveText, 0.75, { alpha: 1 }, 0);
		timeline.to(achieveText, 0.75, { alpha: 0 }, 3);
	}

	// handle gui

	function handlePauseClicked(){
		drawPause();
		_.invoke(hand, 'enable', false);
		// TweenMax.pauseAll();
		// socket.emit('speed:player:pause');
	}

	function handleStageReady(){
		if(config.isTest){
			setTest();
			return;
		}

		socket.emit('speed:player:loaded');
	}

	function handleCardPickedUp(card){
		heldCards[card.index] = card;
		Audio.instance.play('fx', 'card/pickup');
		if(state === 'play'){
			_.invoke(boards, 'setArrow');
		}
		sightedCards = [];
		_.each(hand, function(cardInHand){
			if(!cardInHand || cardInHand === card || !cardInHand.faceup){
				return;
			}
			cardInHand.reject();
			if(compareCards(cardInHand.card, card.card)){
				// card.setOverlapSighted();
				cardInHand.setOverlapSighted();
				sightedCards.push(cardInHand);
			}
		});
		// create a beneath card
		destroyNext();
		nextCard = drawCard(null, card.index, false, player.game.cardCount <= 5);
	}

	function handleCardPutDown(card){
		delete heldCards[card.index];
		_.invoke(boards, 'cancelArrow');
		overlapCard = null;
		_.each(sightedCards, function(sightedCard){
			sightedCard.cancelOverlapSighted();
		});
		if(card.thresholdHit !== undefined && state === 'play'){
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
		board = boards[boardId];
		board.setCard();
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
			if(state === 'play'){
				_.invoke(boards, 'setArrow');
			}
			return;
		}
		overlapCard = targetCard;
		overlapCard.setOverlapped();
		card.setOverlapping();
		_.invoke(boards, 'cancelArrow');
		_.invoke(boards, 'setProximity', false)
	}

	function handleCardProximity(card, threshold){
		if(state !== 'play'){
			return;
		}
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

	function setPlay(){
		state = 'play';
		var keys = _.keys(heldCards);
		if(keys.length === 0){
			return;
		}
		if(overlapCard){
			return;
		}
		_.each(keys, function(key){
			var card = heldCards[key];
			handleCardProximity(card, card.thresholdHit);
		});
	}

	function setSpeedy(){
		state = 'speedy';
		var keys = _.keys(heldCards);
		if(keys.length === 0){
			return;
		}
		_.invoke(boards, 'cancelProximity');
		_.invoke(boards, 'cancelArrow');
		_.each(keys, function(key){
			var card = heldCards[key];
			card.cancelProximity();
		});
	}

	function onWinnerComplete(){
		if(config.isTest){
			handleNext();
			return;
		}
		socket.emit('speed:player:next');
	}

	function handleReadyClicked() {
		isReady = !isReady;

		if(isReady){
			btnReady.setText('\uf058');
			btnReady.options.color = 0x36de4a;
			btnReady.options.colorOver = winnerColor;
		} else {
			btnReady.setText("I'M READY");
			btnReady.options.color = winnerColor;
			btnReady.options.colorOver = 0x36de4a;
		}

		var timeline = new TimelineMax();
		timeline.add(common.tweenStageColor(isReady ? 0x36de4a : winnerColor, function(){
			socket.emit('speed:player:ready', { isReady: isReady });
		}, 0.75), 0);
		timeline.add(btnReady.tweenColor(isReady ? 0x36de4a : winnerColor, 0xffffff), 0);

		if(config.isTest){
		}
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
		socket.emit('speed:player:leave', handleLeave);
	}

	// handling socket

	function handleStart(data){
		console.log('handleStart:', data);
		drawGui();

		// animation start
		var timeline = new TimelineLite({ delay: 1 });
		timeline.add(_.invoke(hand, 'startCard'), 0, null, 0);
		timeline.add(_.invoke(hand, 'appearCard', false), null, null, 0.2);
		if(config.isTest){
			timeline.timeScale(9);
		}

		if(config.isTest){
			var colors = _.shuffle([0xbf00d8, 0xd84100, 0xdbaf00, 0xa1ff00, 0x00c8cc, 0x0065bf]);
			var testBoards = [];
			testBoards[0] = { color: colors.pop()};
			testBoards[1] = { color: colors.pop()};
			testBoards[2] = { color: colors.pop()};
			testBoards[3] = { color: colors.pop()};
			timeline.vars.onComplete = handlePlay;
			timeline.vars.onCompleteParams = [testBoards];
		}
	}

	function handlePlay(data){
		console.log('handlePlay:', data);

		player.game.boards = data;
		drawBoards();
		var timeline = new TimelineMax();
		timeline.add(_.invoke(boards, 'appear', 0x333333));
		timeline.add(setPlay, timeline.totalDuration() / 2);

		if(config.isTest){
			// timeline.add(handleSpeedy, 15);
		}
	}

	function handleSpeedy(data){
		console.log('handleSpeedy:', data);
		if(state === 'finish'){
			return;
		}
		setSpeedy();
		var timeline = new TimelineMax();
		timeline.add(_.invoke(boards, 'disappear'));

		if(config.isTest){
			var colors = _.shuffle([0xbf00d8, 0xd84100, 0xdbaf00, 0xa1ff00, 0x00c8cc, 0x0065bf]);
			var testBoards = [];
			testBoards[0] = { color: colors.pop()};
			testBoards[1] = { color: colors.pop()};
			testBoards[2] = { color: colors.pop()};
			testBoards[3] = { color: colors.pop()};
			timeline.vars.onComplete = handlePlay;
			timeline.vars.onCompleteParams = [testBoards];
		}
	}

	function handleCardOverlap(data) {
		console.log('handleCardOverlap:', data);
		if(state === 'finish'){
			return;
		}
		_.invoke(hand, 'enable', true);
		_.invoke(boards, 'cancelProximity');
		if(!data.confirm){
			destroyNext();
			_.invoke(hand, 'reject')
			Audio.instance.play('fx', 'card/reject');
			return;
		}
		player.points += data.points;
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
		timeline.add(setFooter(), 0);
		Audio.instance.play('fx', 'card/overlapSuccess');
	}

	function handleCardBoard(data){
		console.log('handleCardBoard:', data);
		if(state === 'finish'){
			return;
		}
		_.invoke(boards, 'cancelCard');
		_.invoke(boards, 'cancelProximity');
		if(!data.confirm){
			if(navigator.vibrate){
				navigator.vibrate(2500);
			}
			// reject
			destroyNext();
			_.invoke(hand, 'reject')
			var timeline = new TimelineLite();
			var color = boards[data.boardId].options.color;
			var isLeft = data.boardId % 2 === 0;
			timeline.add(hand[data.handId].shake(isLeft, color));
			timeline.add(hand[data.handId].shake(isLeft, color), '-=' + hand[data.handId].options.shakeTime * 0.75);
			timeline.add(hand[data.handId].shake(isLeft, color), '-=' + hand[data.handId].options.shakeTime * 0.75);
			timeline.add(function(){
				_.invoke(hand, 'enable', true);
			});
			// timeline.add(_.invoke(hand, 'shake', isLeft, color), null, null, 0.05);
			// timeline.add(_.invoke(hand, 'shake'), '-=0.75', null, 0.05);
			Audio.instance.play('fx', 'card/boardFailed');

			// add screw
			if(data.screw){
				drawAchieveText(data.screw + ' BLOCKED YOU');
				drawSymbol('\uf05e');
				achieveText.alpha = 0;
				achieveSymbol.alpha = 0;
				if(screenTimeline){
					screenTimeline.kill();
				}
				screenTimeline = new TimelineMax();
				screenTimeline.to([achieveText, achieveSymbol], 0.75, { alpha: 1 });
				screenTimeline.add(common.tweenStageColor(0x730d01, null, 0.75), 0);
				screenTimeline.addLabel('screwOver', 4);
				screenTimeline.to([achieveText, achieveSymbol], 0.75, { alpha: 0 }, 'screwOver');
				screenTimeline.add(common.tweenStageColor(0x1E1E1E, 0.75), 'screwOver-=1');
				timeline.add(screenTimeline, 0);
			}
			return;
		}
		player.points += data.points;
		// create new card
		var board = boards[data.boardId];
		board.setCardSuccess();
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
		timeline.add(setFooter(), 0);

		if(data.fazt){
			player.fazt++;
			drawAchieveText('FAZT ONE');
			drawSymbol('\uf0e7');
			achieveText.alpha = 0;
			achieveSymbol.alpha = 0;
			achieveSymbol.x -= 30;
			if(screenTimeline){
				screenTimeline.kill();
			}
			screenTimeline = new TimelineMax();
			screenTimeline.to([achieveText, achieveSymbol], 0.75, { alpha: 1 });
			screenTimeline.add(common.tweenStageColor(0x710072, null, 0.75), 0);
			screenTimeline.addLabel('faztOver', 4);
			screenTimeline.to([achieveText, achieveSymbol], 0.75, { alpha: 0 }, 'faztOver');
			screenTimeline.add(common.tweenStageColor(0x1E1E1E, 0.75), 'faztOver-=1');
			timeline.add(screenTimeline, 0);
		}

		Audio.instance.play('fx', 'card/boardSuccess');
	}

	function handleAchievement(data){
		console.log('handleAchievement:', data);
		var achievement = data.achievement;
		switch(achievement){
			case 'screw':
				onScrew(data);
				break;
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

	function handleWinner(data){
		console.log('handleWinner:', data);
		state = 'finish';
		var timeline = new TimelineLite({ delay: 1, onComplete: onWinnerComplete });
		var dissipateTime = 1;
		player.game.winner = data.winner;
		player.points += data.points;

		destroyNext();
		
		footer.flash(0);	
		_.invoke(hand, 'reject');
		_.invoke(hand, 'enable', false);
		timeline.add(_.invoke(boards, 'disappear'));
		timeline.to(hand, dissipateTime, { alpha: 0 }, 'dissipate');

		_gaq.push(['_trackEvent', 'speez', 'player', 'end' + gameCount]);
	}

	function handleNext(data){
		console.log('handleNext:', data);

		winnerText = game.add.text(originalWidthCenter, originalHeightCenter, 'TEST', {
			font: "100px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
		winnerText.alpha = 1;
		winnerText.anchor.set(0.5);
		container.addChild(winnerText);

		var sound;
		var timeline = new TimelineMax();
		if(player.game.winner){
			winnerText.text = 'YOU WIN';
			winnerColor = 0x009bff;
			sound = 'win/win';
		} else {
			winnerText.text = 'YOU LOSE';
			winnerColor = 0xcc1801;
			sound = 'lose/lose';
		}
		Audio.instance.play('fx', sound);

		var distance = 70;
		var pointsText = game.add.text(originalWidthCenter, 320, player.points.toString(), {
			font: "70px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
		pointsText.anchor.set(0.5);

		var line = game.add.graphics();
		line.beginFill(0xffffff);
		line.drawRoundedRect(originalWidthCenter - 270 / 2, 380, 270, 15, 25);

		var blockText = game.add.text(originalWidthCenter + distance, 480, player.block.toString(), {
			font: "55px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
		blockText.anchor.set(0.5);
		var blockSymbol = game.add.text(originalWidthCenter - distance, 480, '\uf05e', {
			font: "100px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
		blockSymbol.anchor.set(0.5);

		var faztText = game.add.text(originalWidthCenter + distance, 610, player.fazt.toString(), {
			font: "55px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
		faztText.anchor.set(0.5);
		var faztSymbol = game.add.text(originalWidthCenter - distance, 610, '\uf0e7', {
			font: "100px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
		faztSymbol.anchor.set(0.5);

		var all = [pointsText, line, blockText, blockSymbol, faztText, faztSymbol ];
		_.each(all, function(item){
			item.alpha = 0;
			container.addChild(item);
		})

		timeline.add(common.tweenStageColor(winnerColor, null, 0.75), 0);
		timeline.to(winnerText, 0.75, { alpha: 1 }, 0);
		timeline.addLabel('delay', '+=3');
		timeline.to(all, 2, { alpha: 1 });

		if(config.isTest){
			timeline.add(function(){
				handleNextLobby();
			}, 2);
		}
	}

	function handleNextLobby(data){
		console.log('handleNextLobby:', data);

		var buttonOptions = {
	    	color: winnerColor,
	    	textColor: 0xffffff,
	    	colorOver: 0x269e34,
	    	textColorOver: 0xffffff,
	    	colorDown: 0x36de4a,
			format: {
		        font: "bold 44px Montserrat, FontAwesome",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0x000000,
			radius: 10,
	    }
		btnReady = new MenuButton(originalWidthCenter, 820, 476, 154, _.extend({ callback: handleReadyClicked, text: "I'M READY" }, buttonOptions));
		btnReady.alpha = 0;
		container.addChild(btnReady);

		var timeline = new TimelineMax();
		timeline.to(btnReady, 2, { alpha: 1 });
	}

	function handleLoad(data){
		console.log('handleLoad:', data);

		player.game = data;
		player.game.cardTotal = player.game.cardCount;
		
		game.state.start('player');
	}

	// other

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
		if(state === 'finish'){
			return;
		}
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
		var timeline = new TimelineMax();
		footer.setProgress(1 - player.game.cardCount / player.game.cardTotal);
		if(player.game.cardCount !== 5 && player.game.cardCount !== 1){
			return timeline;
		}
		var text = player.game.cardCount === 1 ? 'LAST CARD' : 'LAST 5 CARDS';
		drawAchieveText(text);
		achieveText.alpha = 0;
		timeline.to(achieveText, 0.75, {alpha: 1});
		timeline.to(achieveText, 0.75, {alpha: 0}, 4);
		footer.flash(player.game.cardCount);
		Audio.instance.play('fx', 'achievement/last' + player.game.cardCount);
		return timeline;
	}

	// test

	function setTest(){
		handleStart();
		game.input.keyboard.onPressCallback = function(key, event){
			switch(event.charCode){
				case 113:
					handleAchievement({ achievement: 'screw', data: { screw: 'ZoZo' } });
					break;
				case 50: 
					handleAchievement({ achievement: 'test', data: { isGood: true } });
					break;
			}
		}
	}

	function testCardPutOverlap(card, overlapId){
		handleCardOverlap({ confirm: true, newCard: _.random(0, 9), handId: card.index, overlapId: overlapId, newOverlapCard: card.card, points: 50 });
	}

	function testCardPutBoard(data){
		var boardId = data.boardId;
		var returnData = _.pick(data, ['boardId', 'handId']);
		if(boardId % 2 === 0){
			var newCard = _.random(0, 9);
			if(player.game.cardCount === 6){
				// handleAchievement({ achievement: 'last', data: { count: 5 } });
			} else if(player.game.cardCount === 2){
				// handleAchievement({ achievement: 'last', data: { count: 1 } });
			}
			if(boardId === 0){
				handleCardBoard(_.extend({ confirm: true, newCard: newCard, fazt: _.random(0,1) > 0.5 ? true : false, points: 100 }, returnData));
				if(player.game.cardCount === 0){
					setTimeout(function(){
						handleWinner({winner: true, points: 1000});
					}, 10);
				}
			} else {
				setTimeout(function(){ 
					handleCardBoard(_.extend({ confirm: true, newCard: newCard, points: 100 }, returnData));
					if(true || player.game.cardCount === 0){
						setTimeout(function(){
							handleWinner({winner: false, points: 0});
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
			handleCardBoard(_.extend({ confirm: false, screw: 'ZoZo' }, returnData));
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
			common.tweenStageColor(0x1E1E1E, handleStageReady);

			state = 'start';
			isReady = false;
			player.points = 0;
			player.block = 0;
			player.fazt = 0;

			gameCount++;
			_gaq.push(['_trackEvent', 'speez', 'player', 'start' + gameCount]);

			socket.on('speed:player:leave', handleLeave);
			socket.on('speed:player:speedy', handleSpeedy);
			socket.on('speed:player:play', handlePlay);
			socket.on('speed:player:start', handleStart);
			socket.on('speed:player:winner', handleWinner);
			socket.on('speed:player:achieve', handleAchievement);
			socket.on('speed:player:next', handleNext);
			socket.on('speed:player:nextLobby', handleNextLobby);
			socket.on('speed:player:load', handleLoad);
		},

		update: function(){
		},

		render: function(){
			if(config.isTest){
				game.debug.cameraInfo(game.camera, 32, 32);
			}
		},

		shutdown: function(){
			socket.off('speed:player:speedy', handleSpeedy);
			socket.off('speed:player:leave', handleLeave);
			socket.off('speed:player:play', handlePlay);
			socket.off('speed:player:start', handleStart);
			socket.off('speed:player:achieve', handleAchievement);
			socket.off('speed:player:winner', handleWinner);
			socket.off('speed:player:next', handleNext);
			socket.off('speed:player:nextLobby', handleNextLobby);
			socket.off('speed:player:load', handleLoad);
		},
	}
})();
