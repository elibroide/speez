// PauseScreen.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PauseScreen = (function(){

	function PauseScreen(width, height, options){
		options = _.extend({
			color: 0x1e1e1e,
		}, options);
		this.options = options;
	    
	    Phaser.Sprite.call(this, game, 0, 0);

	    // this.inputEnabled = true;
	    // this.events.onInputDown.add(function(){}, this);

	    this.area = new com.LayoutArea(0, 0, width, height, { isDebug: false });

	    this.background = game.add.graphics();
	    this.background.beginFill(this.options.color);
	    this.background.drawRect(0, 0, width, height);
	    this.addChild(this.background);
	    this.area.attach(this.background, { mode: Layout.STRETCH, width: width, height: height });

	    this.container = game.add.sprite();
	    this.addChild(this.container);
	    this.area.attach(this.container, { width: width, height: height });

	    this.events.onDestroy.add(onDestroy, this);
	}

	// Constructors
	PauseScreen.prototype = Object.create(Phaser.Sprite.prototype);
	PauseScreen.prototype.constructor = PauseScreen;

	// private methods

	function onDestroy(){
		this.area.destroy();
	}

	// public methods

	PauseScreen.prototype.postUpdate = function() {
		game.world.bringToTop(this);
	};


	return PauseScreen;
})();






