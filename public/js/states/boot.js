// boot.js

var bootState = (function(){

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
    	resizeWorld(game.world.width, game.world.height);
	}

	function resizeWorld(width, height) {
		if(Layout.instance){
	  		Layout.instance.resize(width, height);
	  	}
	}

	return {
		preload: function(){
			
		},

		create: function(){
			setSocket();

			setScale();

            game.state.start('preload');
		},

		render: function(){
			
		}
	}

})();