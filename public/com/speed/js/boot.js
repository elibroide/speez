// boot.js

var bootState;
(function(){

	function setSocket(){
		//// Local
		config.isLocalHost = document.URL.indexOf('http://localhost') == 0;
		if(config.isLocalHost){
			config.address = "http://localhost:5000";
		}
		console.log('Trying to connect to ' + config.address)

		socket = io(config.address);

		socket.on('common.pong', function(){
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

	bootState = {
		preload: function(){
			if(config.isLocal){
				game.load.json('config', 'config.json');
			}
			else{
				game.load.json('config', 'configremote.json');
			}
			game.load.image('blank', 'assets/sprites/blank.png')
			game.load.spritesheet('colors', 'assets/sprites/colors.jpg', 1, 1)
			game.load.atlasJSONHash('button', 'assets/sprites/buttons.png', 'assets/sprites/buttons.json');
		},

		create: function(){
			var receivedConfig = game.cache.getJSON('config'); 
			config = _.extend(config, receivedConfig);

			console.log('Config: ' + JSON.stringify(config));

			setSocket();

			setScale();
			
            game.state.start('main');
		},

		render: function(){
			
		}
	}

})();