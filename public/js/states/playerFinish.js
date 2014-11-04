// playerFinish.js
var playerFinishState = (function(){
	// gui
	var header;
	var container;
	var finishArea;
	var textWin;
	var nextGameContainer;
	var textNextGame;
	var btnReady;

	// data
	var headerHeight;

	function drawGui(){		
		headerHeight = originalHeight * 0.125;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			text: player.name,
			color: 0xffffff,
		});

		finishArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, {isDebug:false});
		container = game.add.sprite();
		finishArea.attach(container, {width: originalWidth, height: originalHeight });

		textWin = game.add.text(originalWidthCenter, originalHeightCenter - 30, player.game.winner ? 'YOU\nWIN' : 'YOU\nLOSE', {
			font: "200px Arial",
	        fill: "#ffffff",
	        align: "center"
		});
		textWin.anchor.set(0.5, 0.5);
		textWin.alpha = 0;
		container.addChild(textWin);

		nextGameContainer = game.add.sprite(originalWidthCenter, originalHeightCenter + 250);
		nextGameContainer.alpha = 0;
		container.addChild(nextGameContainer);

		textNextGame = game.add.text(0, 0, 'Next Game:', {
			font: "25px Arial",
	        fill: "#ffffff",
	        align: "center"
		});
		textNextGame.anchor.set(0.5, 0.5);
		nextGameContainer.addChild(textNextGame);

		player.isReady = false;
		btnReady = new MenuButton(0, 50, 300, 60, 'Ready', handleReadyClicked, { anchorX: 0.5, anchorY: 0.5 })
		nextGameContainer.addChild(btnReady);
	}

	// gui handlers

	function handleReadyClicked(){
		player.isReady = !player.isReady;
		btnReady.setText(player.isReady ? 'Not Ready' : 'Ready');
		socket.emit('speed:player:ready', { isReady: player.isReady });
	}

	// socket handlers

	function handleNext(){
		var timeline = new TimelineLite();
		timeline.to(textWin, 0.1, { alpha: 1 });
	}

	function handleNextLobby(){
		var timeline = new TimelineLite();
		timeline.to(nextGameContainer, 1, { alpha: 1, delay: 2 });
	}

	function handleLoad(data){
		player.game = data;

		var timeline = new TimelineLite();
		timeline.add(common.tweenStageColor(0xffffff, function(){
			setTimeout(function(){ game.state.start('player'); }, 500);
		}));
		timeline.to(btnReady, 1, { alpha: 0 }, 0);
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
			drawGui();

			if(config.isTest){
				handleNext();
				return;
			}
			socket.on('speed:player:load', handleLoad);
			socket.on('speed:player:next', handleNext);
			socket.on('speed:player:nextLobby', handleNextLobby);
			socket.emit('speed:player:next');
		},

		shutdown: function(){
			socket.off('speed:player:load', handleLoad);
			socket.off('speed:player:next', handleNext);
			socket.off('speed:player:nextLobby', handleNextLobby);
		}
	}

})();