// preload.js

var preloadState = (function(){

	// data
	var finished = 0;

	// gui
	var container;
	var preloaderArea;
	var textProgress;
	var data;

	function drawGui(){
        preloaderArea = new com.LayoutArea(0, 0, originalWidth, originalHeight);
		container = game.add.sprite();
		preloaderArea.attach(container, { width: originalWidth, height: originalHeight });
		// game.stage.backgroundColor = 0x1e1e1e;

		var logo = game.add.sprite(originalWidthCenter, originalHeightCenter * 0.5, 'logoGray');
		logo.anchor.set(0.5);
		container.addChild(logo);

		var logoO = game.add.sprite(originalWidthCenter, originalHeightCenter + 50, 'logoO');
		logoO.anchor.set(0.5);
		container.addChild(logoO);

		var avatar = game.add.sprite(originalWidthCenter, originalHeightCenter, 'preloadAvatar');
		avatar.anchor.set(0.5);
		container.addChild(avatar); 

        textProgress = game.add.text(originalWidthCenter, originalHeightCenter * 1.5, 'Preloading', { font: "bold 50px Montserrat", fill: "#58585a", align: "center" });
        textProgress.anchor.set(0.5);
		container.addChild(textProgress);

		data = { progress: 0 };

	}

	function updateProgress(){
		textProgress.text = Math.ceil(data.progress) + "%";
	}

	function setFinished(){
		if(++finished === 2){
			console.error('VERSION ' + config.version);
			console.error(config);
			if(config.isPlayer){
				game.state.start('main');
			} else {
				game.state.start('lobby');
			}
		}
	}

	return {
		preload: function(){

			// fonts
			var fontUrl;
			if(config.isPackage){
				fontUrl = [ 'style/font-awesome.min.css', 'style/fonts-package.css' ];
			} else {
				fontUrl = [ 'style/font-awesome.min.css', 'style/fonts.css' ];
				fontUrl = [ 'style/font-awesome-package.min.css', 'style/fonts-package.css' ];
			}
			WebFont.load({
				custom: {
					families: ['FontAwesome', 'Montserrat'],
	            	urls: fontUrl,
				}, 
				active: function(){
					setFinished();
				},
				inactive: function(){
  					console.log('Could not load font');
  					setFinished();
				}
			});

			// layout
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});

			// gui
			drawGui();

			Layout.instance.resize(game.width, game.height);

			// images
			game.load.image('lobbyDescription', 'images/lobby_description.png'); 

			// avatars
			for (var i = 0; i < avatarNames.length; i++) {
				var number = common.addZeroes(i+1, 2);
				game.load.image(avatarNames[i], 'images/avatar_' + number + '.png');
				game.load.image(avatarNames[i] + '_head', 'images/avatar_' + number + '_head.png');
			};

			// *** Card ***
			// // pickup
			// game.load.audio('card/pickup', ['audio/fx/card/pickup.wav']);
			// // draw
			// game.load.audio('card/draw', ['audio/fx/card/draw.wav']);
			// // return
			// game.load.audio('card/return', ['audio/fx/card/return.wav']);
			// // place board
			// game.load.audio('card/placeBoard', ['audio/fx/card/placeBoard.wav']);
			// // place overlap
			// game.load.audio('card/placeOverlap', ['audio/fx/card/placeOverlap.wav']);
			// // board success
			// game.load.audio('card/boardSuccess', ['audio/fx/card/boardSuccess.wav']);
			// // board failed
			// game.load.audio('card/boardFailed', ['audio/fx/card/boardFailed.wav']);
			// // overlap success
			// game.load.audio('card/overlapSuccess', ['audio/fx/card/overlapSuccess.wav']);
			// // win
			// game.load.audio('win/win', ['audio/fx/win/win.mp3']);
			// // lose
			// game.load.audio('lose/lose', ['audio/fx/lose/lose.wav']);

			// // *** achievement ***
			// // last
			// game.load.audio('achievement/last1', ['audio/fx/achievement/last1.wav']);
			// game.load.audio('achievement/last5', ['audio/fx/achievement/last5.wav']);
			// // screw
			// game.load.audio('achievement/screw', ['audio/fx/achievement/screw.wav']);
			// game.load.audio('achievement/screwed', ['audio/fx/achievement/screwed.wav']);

		},

		loadUpdate: function(){
			TweenMax.to(data, 1, { progress: game.load.progress, onUpdate: updateProgress })
		},

		create: function(){
			textProgress.text = 'Loading Fonts';
            
            game.add.text(-1000, 0, '', { font: '30px FontAwesome'});

			setFinished();
		},

		shutdown: function(){
			TweenMax.killTweensOf(data);
		}
	}

})();