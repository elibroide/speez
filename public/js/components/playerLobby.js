// playerLobby.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerLobby = (function(){

	PlayerLobby = function (x, y, width, height, options) {
		options = $.extend({
			nameFormat: {
		        font: "bold 25px Montserrat",
		        fill: "#000000",
		        align: "center"
		    },
		    pointsFormat: {
				font: "20px Montserrat",
		        fill: "#000000",
		        align: "center",
		    },

		    changeNameTime: 1,
		    setPlayerFadeOutTime: 0.75,
		    setPlayerFadeInTime: 0.75,
		    playerColor: 0xffffff,
		    joinColor: 0x7f7f7f,
		    joinFormat: {
		   		font: "35px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
		    radius: 10,
		    achievementsFormat: {
		    	font: "35px Montserrat",
		        fill: "#000000",
		        align: "center"
		    },
		    symbolFormat: {
		    	font: "40px FontAwesome",
		        fill: "#000000",
		        align: "center"
		    },

		}, options);
		this.options = options;

	    Phaser.Sprite.call(this, game, x, y);
	    game.add.existing(this);

	    this.background = new Phaser.Graphics(game);
	    this.background.beginFill(this.options.joinColor);
	    this.background.changeColor = common.graphicsColorChange(0);
	    this.background.drawRoundedRect(-width / 2, -height / 2, width, height, this.options.radius);
	    this.addChild(this.background);

	    this.join = game.add.text(0, 0, 'Join', options.joinFormat);
	    this.join.anchor.set(0.5);
	    this.addChild(this.join);

	    this.name = game.add.text(0, -18, '', options.nameFormat);
	    this.name.alpha = 0;
	    this.name.anchor.set(0.5);
	    this.addChild(this.name);

	    this.points = game.add.text(0, 8, '0', options.pointsFormat);
	    this.points.alpha = 0;
	    this.points.anchor.set(0.5);
	    this.addChild(this.points);

	    var begin = 90;
	    var distance = 60;
	    var symbolX = -30;
	    var scoreX = 30;

	    this.victoriesSymbol = game.add.text(symbolX, begin, '\uf091', options.symbolFormat);
	    this.victoriesSymbol.alpha = 0;
	    this.victoriesSymbol.anchor.set(0.5);
	    this.addChild(this.victoriesSymbol);

	    this.victories = game.add.text(scoreX, begin, '0', options.achievementsFormat);
	    this.victories.alpha = 0;
	    this.victories.anchor.set(0.5);
	    this.addChild(this.victories);

	    this.blocksSymbol = game.add.text(symbolX, begin + distance, '\uf05e', options.symbolFormat);
	    this.blocksSymbol.alpha = 0;
	    this.blocksSymbol.anchor.set(0.5);
	    this.addChild(this.blocksSymbol);

	    this.blocks = game.add.text(scoreX, begin + distance, '0', options.achievementsFormat);
	    this.blocks.alpha = 0;
	    this.blocks.anchor.set(0.5);
	    this.addChild(this.blocks);

	    this.faztSymbol = game.add.text(symbolX, begin + distance * 2, '\uf0e7', options.symbolFormat);
	    this.faztSymbol.alpha = 0;
	    this.faztSymbol.anchor.set(0.5);
	    this.addChild(this.faztSymbol);

	    this.fazt = game.add.text(scoreX, begin + distance * 2, '0', options.achievementsFormat);
	    this.fazt.alpha = 0;
	    this.fazt.anchor.set(0.5);
	    this.addChild(this.fazt);
	}

	// Constructors
	PlayerLobby.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerLobby.prototype.constructor = PlayerLobby;

	// Methods
	PlayerLobby.prototype.removePlayer = function() {
		this.player = null;
		// player disappear
		this.player = name;
		
	}

	PlayerLobby.prototype.setPlayer = function(player) {
		// player appear
		this.player = player;
		this.name.text = player.name;
		this.points.text = player.points;
		
		var timeline = new TimelineMax();
		timeline.to(this.background, this.options.setPlayerFadeOutTime, { colorProps: { changeColor: this.options.playerColor } });
		timeline.to(this.join, this.options.setPlayerFadeOutTime, { alpha: 0 }, 0);
		timeline.addLabel('fade');
		timeline.to([this.name, this.points, this.victories, this.blocks, this.fazt, this.victoriesSymbol, this.blocksSymbol, this.faztSymbol], this.options.setPlayerFadeInTime, { alpha: 1 });
		return timeline;
	};

	PlayerLobby.prototype.setReady = function(isReady) {

	};

	PlayerLobby.prototype.popup = function(options) {
		options = _.extend({
			color: 0xff0000,
			text: 'ready',
			time: -1,
			
		}, options);

		this.readyBox = new Phaser.Graphics(game);
	    this.readyBox.beginFill(color);
	    this.readyBox.drawRoundedRect(-width / 2, -112, 130, 30);
	};
	
	PlayerLobby.prototype.changeName = function(name) {
		var timeline = new TimelineLite();
		timeline.to(this.name, this.options.changeNameTime * 0.5, { alpha: 0 });
		timeline.addLabel('half');
		timeline.to(this.name, this.options.changeNameTime * 0.5, { alpha: 1 }, 'half');
		timeline.add(function(){
			this.name.text = name;
		}.bind(this), 'half')
	}
})()




