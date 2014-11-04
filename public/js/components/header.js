// header.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Header = (function(){

	Object.defineProperty(Header, "CENTER", { value: 'center' });
	Object.defineProperty(Header, "RIGHT", { value: 'right' });
	Object.defineProperty(Header, "LEFT", { value: 'left' });

	function Header(width, height, options){

		options = _.extend({
			width: width,
			height: height,
			text: '',
			format: {
		        font: "50px Arial",
		        fill: "#000000",
		        align: "center"
		    },
		    color: 0xffffff,
		}, options);
		this.options = options;

	    Phaser.Sprite.call(this, game, 0, 0);

	    game.add.existing(this);

	    this.background = new ColorBox(0, 0, width, height, options.color);
	    this.addChild(this.background);

		this.headerArea = new com.LayoutArea(0, 0, width, height, {
			isDebug: false,
		});
		this.headerArea.attach(this.background, { 
			width: width, 
			height: height,
			mode: Layout.STRETCH,
		});

		// setting center
		this.center = game.add.sprite(); 
		this.headerArea.attach(this.center, { 
			width: 10,
			height: height,
			mode: Layout.PROPORTIONAL_INSIDE,
			alignHorizontal: Layout.ALIGN_CENTER,
		});
		this.title = game.add.text(0, height * 0.5, options.text, options.format);
		this.title.anchor.set(0.5);
		this.center.addChild(this.title);

		// setting left/right buttons
		this.left = game.add.sprite();
		this.headerArea.attach(this.left, { 
			mode: Layout.PROPORTIONAL_INSIDE,
			alignHorizontal: Layout.ALIGN_LEFT,
		});

		this.right = game.add.sprite();
		this.headerArea.attach(this.right, { 
			mode: Layout.PROPORTIONAL_INSIDE,
			alignHorizontal: Layout.ALIGN_RIGHT,
		});

		this.addChild(this.center);
		this.addChild(this.left);
		this.addChild(this.right);
	}

	Header.prototype = Object.create(Phaser.Sprite.prototype);
	Header.prototype.constructor = Header;

	Header.prototype.setText = function(text) {
		this.options.text = text;
		if(this.timeline && this.timeline.isActive()){
			return;
		}
		this.title.text = text;
	};

	Header.prototype.add = function(items, location, options) {
		
	};

	Header.prototype.tweenTitle = function(text, color, time) {
		var textTimeline = new TimelineLite();
		textTimeline.to(this.title, time, { alpha: 0 });
		textTimeline.add(this.background.tweenColor(color, time * 2), 0);
		textTimeline.add(function(){
			if(text === null){
				this.title.text = this.options.text;
				return;
			}
			this.title.text = text;
		}.bind(this));
		textTimeline.to(this.title, time, { alpha: 1 });
		return textTimeline;
	};

	Header.prototype.tweenTitleDelay = function(text, color, time, delayTime) {
		if(this.timeline){
			this.timeline.kill();
			this.timeline = null;
		}
		var timeline = new TimelineLite();
		timeline.add(this.tweenTitle(text, color, time));
		timeline.add(this.tweenTitle(null, this.options.color, time), '+=' + delayTime);
		this.timeline = timeline;
	};

	return Header;
})();







