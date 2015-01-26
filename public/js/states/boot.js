// boot.js

var bootState = (function(){

	var resizeTimeout = 0;

	function setSocket(){
		//// Local
		console.log('Trying to connect to ' + config.address)

		network = new Network();
	}

	function setScale(){
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVeritcally = true;
        game.scale.refresh();
        // game.scale.trackParentInterval = 500;
        game.scale.setResizeCallback(resizeWorld);

        layout = new com.Layout({
        	game: game,
        	width: originalWidth,
        	height: originalHeight,
        });
    	resizeWorld(game.scale, game.world.getBounds(), true);
	}

	function resizeWorld(scaleManager, rect, isOverwriteMobile, isRepeat) {
		if(Layout.instance){
	  		Layout.instance.resize(scaleManager.width, scaleManager.height);

	  		if(isRepeat){
	  			return;
	  		}
  			clearTimeout(resizeTimeout);
  			setTimeout(function(){
				resizeWorld(scaleManager, rect, isOverwriteMobile, true);
  			}, 500);
	  	}
	}

	return {
		preload: function(){
			game.load.image('bblogo', 'images/bros_logo.png');
			game.load.image('logo', 'images/speez_logo.png');
			game.load.image('logoGray', 'images/speez_logo_gray.png');
			game.load.image('logoO', 'images/speez_logo_o.png');
			game.load.image('beta', 'images/beta.png');

			// creatures
			var number = common.addZeroes(_.random(1, avatarNames.length), 2);
			game.load.image('preloadAvatar', 'images/avatar_' + number + '_head.png');
		},

		create: function(){
    		game.stage.disableVisibilityChange = true;
			setSocket();

			setScale();

  			game.state.start('preload');
		},

		render: function(){
			
		}
	}

})();