// Logo.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Logo = (function(){

	Logo = function (x, y, width, height, options) {
		options = $.extend({
			logo: 'bblogo',
			scale: 0.6,
		}, options);
		this.options = options;
		
	    Phaser.Sprite.call(this, game, 0, 0);

	    this.logo = game.add.sprite(x, y, this.options.logo);
	    this.logo.scale.set(this.options.scale);
	    this.addChild(this.logo);
	}

	// Constructors
	Logo.prototype = Object.create(Phaser.Sprite.prototype);
	Logo.prototype.constructor = Logo;

	// private methods


	// public methods

	return Logo;

})();
















