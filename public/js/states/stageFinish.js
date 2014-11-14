// stageFinish.js
var stageFinishState = (function(){

	// gui
	var header;
	var container;
	var finishArea;
	var textWin;

	// data

	function drawGui(){
		finishArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, {isDebug:false});
		container = game.add.sprite();
		finishArea.attach(container, {width: originalWidth, height: originalHeight });

		console.log(stage.game.winner);
		console.log(stage.players);
		var winner = stage.players[stage.game.winner];
		textWin = game.add.text(originalWidthCenter, originalHeightCenter, winner.name, {
			font: "200px Arial",
	        fill: "#ffffff",
	        align: "center"
		});
		textWin.alpha = 0;
		textWin.anchor.set(0.5, 0.5);
		container.addChild(textWin);

		var timeline = new TimelineLite({ onComplete: handleWinComplete });
		timeline.to(textWin, 0.25, { alpha: 1 });
		timeline.add(common.tweenStageColor(0xffffff), '+=5');
	}

	// gui handlers

	function handleWinComplete(){
		game.state.start('lobby');
	}

	// socket handle

	function handleNext(){
		drawGui();
	}

	function handleLeave(data){
		delete stage.players[data.id];
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
			game.stage.backgroundColor = 0x000000;

			if(config.isTest){
				handleNext();
				return;
			}

			socket.on('speed:stage:next', handleNext);
			socket.on('speed:stage:leave', handleLeave);
			socket.emit('speed:stage:next');
		},

		shutdown: function(){
			socket.off('speed:stage:leave', handleLeave);
			socket.off('speed:stage:next', handleNext);
		}
	}

})();





