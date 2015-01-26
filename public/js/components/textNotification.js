// TextNotification.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.TextNotification = (function(){

	TextNotification = function (x, y, width, height, options) {
		options = $.extend({
			width: width,
			height: height,
		}, options);
		this.options = options;
		
	    Phaser.Sprite.call(this, game, x, y);
	}

	// Constructors
	TextNotification.prototype = Object.create(Phaser.Sprite.prototype);
	TextNotification.prototype.constructor = TextNotification;

	// private methods


	// public methods

	TextNotification.prototype.show = function(items, symbol, count, options) {
		options = _.extend({ 
			inTime: 0.75,
			outTime: 0.75,
			delayTime: 7.5,
			margin: 0,
			textFormat: {
		        font: "bold 79px Montserrat"
		    },
		    symbolFormat: {
		    	font: "235px FontAwesome",
		    },
		    symbolColor: 0xffffff,
		    countFormat: {
		    	font: "bold 40px Montserrat"
		    },
		    countCircleFormat: {
		    	font: "70px FontAwesome"
		    },
		    countColor: 0xffffff,
		    distanceY: 400,
		    circleGapY: 5,
		    countGapY: -50,
		    countGapX: 0,
		    isCircle: false,
		}, options);
		var timeline = new TimelineMax();
		timeline.addLabel('fade', options.delayTime);

		// texts
		var textDistance = options.distanceY;
		var text;
		for (var i = items.length-1; i >= 0; i--) {
			var item = items[i];
			var format = _.extend({
				fill: '#' + common.toRgbHex(item.color),
		        align: "left",
			}, options.textFormat);
			text = new Phaser.Text(game, 0, -textDistance, item.text, format);
			if(i !== 0){
				textDistance += text.height + options.margin;
			}
			text.alpha = 0;
			this.addChild(text);
			timeline.to(text, options.inTime, { y: '+=' + options.distanceY, alpha: 1, ease: Power3.easeOut }, 0);
			timeline.to(text, options.outTime, { y: '+=' + options.distanceY, alpha: 0, ease: Power3.easeIn }, 'fade');
		};
		// symbol
		var symbolFormat = _.extend({
			fill: '#' + common.toRgbHex(options.symbolColor),
	        align: "right",
		}, options.symbolFormat);
		var symbolText = new Phaser.Text(game, this.options.width, options.distanceY + text.height, symbol, symbolFormat);
		symbolText.anchor.set(1, 1);
		symbolText.alpha = 0;
		this.addChild(symbolText);
		timeline.to(symbolText, options.inTime, { y: '-=' + options.distanceY, alpha: 1, ease: Power3.easeOut }, 0);
		timeline.to(symbolText, options.outTime, { y: '-=' + options.distanceY, alpha: 0, ease: Power3.easeIn }, 'fade');

		if(count) {
			var countSprite = new Phaser.Sprite(game, symbolText.x - symbolText.width + options.countGapX, symbolText.y + options.countGapY );
			this.addChild(countSprite);

			// count circle
			if(options.isCircle){
				var countCircleFormat = _.extend({
					fill: '#' + common.toRgbHex(options.countColor),
			        align: "center",
				}, options.countCircleFormat);
				var countTextCircle = new Phaser.Text(game, 0, options.circleGapY, '\uf10c', countCircleFormat);
				countTextCircle.anchor.set(0.5);
				countSprite.addChild(countTextCircle);
			}
			
			// count 
			var countFormat = _.extend({
				fill: '#' + common.toRgbHex(options.countColor),
		        align: "center",
			}, options.countFormat);
			var countText = new Phaser.Text(game, 0, 0, count, countFormat);
			countText.anchor.set(0.5);
			countSprite.addChild(countText);

			timeline.to(countSprite, options.inTime, { y: '-=' + options.distanceY, alpha: 1, ease: Power3.easeOut }, 0);
			timeline.to(countSprite, options.outTime, { y: '-=' + options.distanceY, alpha: 0, ease: Power3.easeIn }, 'fade');
		}

		return timeline;
	};

	return TextNotification;

})();
















