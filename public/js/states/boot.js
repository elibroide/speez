// boot.js

var bootState = (function(){

	function setSocket(){
		//// Local
		console.log('Trying to connect to ' + config.address)

		socket = io.connect(config.address);
		socket.off = socket.removeListener;
		socket.on('common.ping', function(){
			console.log('pong');
		});
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

            game.state.start('main');
		},

		render: function(){
			
		}
	}

})();