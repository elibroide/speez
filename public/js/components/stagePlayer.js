// stagePlayer.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerLobby = (function(){

	PlayerLobby = function (x, y, options) {
		options = $.extend({
			format: {
		        font: "47px Arial",
		        fill: "#000000",
		        align: "center"
		    },
		}, options);
		this.options = options;

	    Phaser.Sprite.call(this, game, x, y);

	    
	}

	// Constructors
	PlayerLobby.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerLobby.prototype.constructor = PlayerLobby;

	// Methods
	PlayerLobby.prototype.removePlayer = function() {
	}

	PlayerLobby.prototype.setPlayer = function(player) {
	};

	PlayerLobby.prototype.setReady = function(isReady) {
	};
	
	PlayerLobby.prototype.changeName = function(name) {
	}
})()






