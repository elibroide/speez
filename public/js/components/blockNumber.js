// BlockNumber.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.BlockNumber = (function(){

	BlockNumber = function (x, y, width, height, number, options) {
		options = $.extend({
			margin: 20,
			color: 0x000000,
			format: {
		        font: "100px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
		    radius: 10,
		}, options);
		this.options = options;
		
	    Phaser.Sprite.call(this, game, x, y);

	    var digits = [];
	    var currentNumber = number;
	    for (var i = 0; currentNumber > 0; i++) {
	    	digits[i] = currentNumber % 10;
	    	currentNumber = parseInt(currentNumber * 0.1);
	    };
	    digits = digits.reverse();

	    var blockWidth = (width - this.options.margin * (digits.length - 1)) / digits.length;
	    this.blocks = [];
	    this.blocksLetters = [];
	    for (var i = 0; i < digits.length; i++) {
	    	var block = new Phaser.Graphics(game, i * this.options.margin + i * blockWidth);
	    	block.beginFill(this.options.color);
	    	block.drawRoundedRect(0, 0, blockWidth, height, this.options.radius);

	    	var blockLetter = new Phaser.Text(game, block.x + blockWidth / 2, height / 2, digits[i].toString(), this.options.format);
	    	blockLetter.anchor.set(0.5);
	    	this.blocksLetters.push(blockLetter);
	    	this.blocks.push(block);
	    	this.addChild(block);
	    	this.addChild(blockLetter);
	    };
	}

	// Constructors
	BlockNumber.prototype = Object.create(Phaser.Sprite.prototype);
	BlockNumber.prototype.constructor = BlockNumber;

	// private methods


	// public methods

	return BlockNumber;

})();
















