// preload.js

var preloadState = (function(){

	return {
		preload: function(){
			// Sounds
			game.load.audio('button/down', ['audio/fx/button/down.mp3']);
			game.load.audio('button/up', ['audio/fx/button/up.mp3']);

			// Countdown
			game.load.audio('countdown/1', ['audio/fx/countdown/One.wav']);
			game.load.audio('countdown/2', ['audio/fx/countdown/Two.wav']);
			game.load.audio('countdown/3', ['audio/fx/countdown/Three.wav']);
			game.load.audio('countdown/4', ['audio/fx/countdown/Four.wav']);
			game.load.audio('countdown/5', ['audio/fx/countdown/Five.wav']);
			game.load.audio('countdown/speed', ['audio/fx/countdown/Speed.wav']);

			// *** Card ***
			// pickup
			game.load.audio('card/pickup', ['audio/fx/card/pickup.wav']);
			// draw
			game.load.audio('card/draw', ['audio/fx/card/draw.wav']);
			// return
			game.load.audio('card/return', ['audio/fx/card/return.wav']);
			// place board
			game.load.audio('card/placeBoard', ['audio/fx/card/placeBoard.wav']);
			// place overlap
			game.load.audio('card/placeOverlap', ['audio/fx/card/placeOverlap.wav']);
			// board success
			game.load.audio('card/boardSuccess', ['audio/fx/card/boardSuccess.wav']);
			// board failed
			game.load.audio('card/boardFailed', ['audio/fx/card/boardFailed.wav']);
			// overlap success
			game.load.audio('card/overlapSuccess', ['audio/fx/card/overlapSuccess.wav']);
			// win
			game.load.audio('win/win', ['audio/fx/win/win.mp3']);
			// lose
			game.load.audio('lose/lose', ['audio/fx/lose/lose.wav']);

			// *** achievement ***
			// last
			game.load.audio('achievement/last1', ['audio/fx/achievement/last1.wav']);
			game.load.audio('achievement/last5', ['audio/fx/achievement/last5.wav']);
			// screw
			game.load.audio('achievement/screw', ['audio/fx/achievement/screw.wav']);
			game.load.audio('achievement/screwed', ['audio/fx/achievement/screwed.wav']);

		},

		create: function(){
            game.state.start('main');
		},

		render: function(){
			
		}
	}

})();