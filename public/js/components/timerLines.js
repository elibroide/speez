// TimerLines.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.TimerLines = (function(){

	function TimerLines(options){
		options = _.extend({
			time: 10,
			width: 40,
			height: 100,
			color: 0xc5c5e5,
			isLeft: false,
			startDelay: 2,
			noMovesTime: 1,
			disappearTime: 1,
		}, options);
		this.options = options;
	    
	    Phaser.Sprite.call(this, game, 0, 0);

	    this.state = '';

		this.leftLine = new Phaser.Graphics(game, 0, 0);
		this.leftLine.changeColor = common.graphicsColorChange(0);
		this.leftLine.beginFill(this.options.color);
		this.leftLine.drawRect(0, 0, this.options.width, this.options.height);
		this.addChild(this.leftLine);

		this.rightLine = new Phaser.Graphics(game, 0, 0);
		this.rightLine.changeColor = common.graphicsColorChange(0);
		this.rightLine.beginFill(this.options.color);
		this.rightLine.drawRect(0, 0, this.options.width, this.options.height);
		this.addChild(this.rightLine);

		this.area = new com.LayoutArea(0, 0, originalWidth, originalHeight, {
			isDebug: false,
		});

		this.area.attach(this.leftLine, {
			width: options.width,
			height: options.height,
			alignHorizontal: Layout.ALIGN_LEFT,
		});

		this.area.attach(this.rightLine, {
			width: options.width,
			height: options.height,
			alignHorizontal: Layout.ALIGN_RIGHT,
		});

		this.state = TimerLines.STATE_INIT;

		this.countTimeline = createCounting.call(this);
		this.countTimeline.pause();
		this.countTimeline.progress(1);

		this.events.onDestroy.add(onDestroy, this);
	}

	// Constructors
	TimerLines.prototype = Object.create(Phaser.Sprite.prototype);
	TimerLines.prototype.constructor = TimerLines;

	// constants

	Object.defineProperty(TimerLines, "STATE_INIT", { value: 'init' });
	Object.defineProperty(TimerLines, "STATE_PLAY", { value: 'play' });
	Object.defineProperty(TimerLines, "STATE_FINISH", { value: 'finish' });


	// private methods

	function onDestroy(){
		this.countTimeline.kill();
	}

	function appearComplete(){
		this.state = TimerLines.STATE_PLAY;
		this.count();
	}

	function countComplete(bypass){
		if(this.state !== TimerLines.STATE_PLAY && !bypass){
			return;
		}

		if(this.options.countComplete){
			this.options.countComplete();
		}
	}

	function setCardComplete(){
		this.setCardTimeline.kill();
		this.setCardTimeline = null;
	}

	function createCounting(){
		var timeline = new TimelineMax({ onComplete: countComplete, onCompleteScope: this });
		timeline.to(this.leftLine.graphicsData[0].shape, this.options.time, { height: this.options.height, ease: Linear.easeNone }, 0);
		timeline.to(this.rightLine.graphicsData[0].shape, this.options.time, { height: this.options.height, ease: Linear.easeNone }, 0);
		return timeline;
	}

	// public methods

	TimerLines.prototype.appear = function() {
		this.countTimeline.pause();
		var timeline = new TimelineMax();
		timeline.to(this.countTimeline, 1, { progress: 0 }, 0);
		timeline.add(appearComplete.bind(this), '+=' + this.options.startDelay)

		return timeline;
	};

	TimerLines.prototype.disappear = function() {
		this.countTimeline.pause();
		this.state = TimerLines.STATE_FINISH;
		var timeline = new TimelineMax({ });
		timeline.to(this.countTimeline, this.options.disappearTime, { progress: 1 });
		return timeline;
	};

	TimerLines.prototype.count = function(options) {
		this.countTimeline.play();
		return this.countTimeline;
	};

	TimerLines.prototype.setCard = function(color, time) {
		this.countTimeline.pause();
		if(this.setCardTimeline){
			this.setCardTimeline.kill();
		}
		var timeline = new TimelineMax({ onComplete: setCardComplete, onCompleteScope: this });
		// rewind
		timeline.to(this.countTimeline, 1, { progress: Math.max(0, this.countTimeline.progress() - 0.5) }, 0);
		// color
		timeline.to([ this.leftLine, this.rightLine ], 1, { colorProps: { changeColor: color } }, 0);
		timeline.to([ this.leftLine, this.rightLine ], 1, { colorProps: { changeColor: this.options.color } }, 1);
		// return
		timeline.add(this.count.bind(this), 2);
		this.setCardTimeline = timeline;
		return timeline;
	};

	TimerLines.prototype.noMoves = function() {
		this.countTimeline.pause();
		this.state = TimerLines.STATE_FINISH;
		var timeline = new TimelineMax({ onComplete: countComplete, onCompleteScope: this, onCompleteParams: [true] });
		timeline.to(this.countTimeline, this.options.noMovesTime, { progress: 1 });
		return timeline;
	};

	return TimerLines;
})();






