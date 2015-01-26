// playerIcon.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerIcon = (function(){

	PlayerIcon = function (x, y, width, height, options) {
		options = $.extend({
			width: width,
			height: height,
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
		    isShowStats: true,
		    colorTime: 0.5,
		    avatarStartY: 100,
		    avatarTargetY: -10,
		    avatarAngle: 10,
		    avatarJumpY: -5,
		    avatarSpeed: 0.6,

		    appearTime: 1,
		    disappearTime: 1,
		    pointsTime: 1,

		    cardCountBarProgress: 0,
		    cardCountBarHeight: 10,
		    cardCountBarMargin: 1,
		    cardCountBarColor: 0x000000,
		    cardCountBarAlpha: 0.6,
		    cardCountBarRadius: 5,
		}, options);
		this.options = options;

	    Phaser.Sprite.call(this, game, x, y);
	    game.add.existing(this);

	    this.avatarMask = new Phaser.Graphics(game);
	    this.avatarMask.beginFill(0x000000);
	    this.avatarMask.drawRect(-width, -height * 2, this.options.width * 2, this.options.height * 2);

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

	    this.cardCountBar = new Phaser.Graphics(game, -this.options.width / 2, this.options.height / 2 - (this.options.cardCountBarMargin + this.options.cardCountBarHeight));
	    this.cardCountBar.alpha = this.options.cardCountBarAlpha;
	    this.cardCountBar.beginFill(this.options.cardCountBarColor);
	    this.cardCountBar.drawRoundedRect(0, -this.options.cardCountBarMargin, this.options.width, this.options.cardCountBarHeight, this.options.cardCountBarRadius);
	    this.cardCountBar.colorChange = common.graphicsColorChange(0);
	    this.cardCountBar.graphicsData[0].shape.width = this.options.width * this.options.cardCountBarProgress;
	    this.addChild(this.cardCountBar);

	    // Emitter 
	    this.emitter = game.add.emitter(0, 0, 100);
	    var speed = 300;
	    this.emitter.setXSpeed(-speed, speed);
	    this.emitter.setYSpeed(-speed, speed);
	    // this.emitter.minParticleSpeed.set(-100, 100);
	    // this.emitter.setAlpha(0.1, 1, 3000);
	    this.emitter.gravity = 200;
	    this.addChild(this.emitter);

	    if(this.options.isShowStats){
	    	addStats.call(this);
	    }
	}

	// Constructors
	PlayerIcon.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerIcon.prototype.constructor = PlayerIcon;

	// private methods

	function addStats(){

		var begin = 90;
	    var distance = 60;
	    var symbolX = -30;
	    var scoreX = 30;

		this.victoriesSymbol = game.add.text(symbolX, begin, '\uf091', this.options.symbolFormat);
	    this.victoriesSymbol.alpha = 0;
	    this.victoriesSymbol.anchor.set(0.5);
	    this.addChild(this.victoriesSymbol);

	    this.victories = game.add.text(scoreX, begin, '0', this.options.achievementsFormat);
	    this.victories.alpha = 0;
	    this.victories.anchor.set(0.5);
	    this.addChild(this.victories);

	    this.blocksSymbol = game.add.text(symbolX, begin + distance, '\uf05e', this.options.symbolFormat);
	    this.blocksSymbol.alpha = 0;
	    this.blocksSymbol.anchor.set(0.5);
	    this.addChild(this.blocksSymbol);

	    this.blocks = game.add.text(scoreX, begin + distance, '0', this.options.achievementsFormat);
	    this.blocks.alpha = 0;
	    this.blocks.anchor.set(0.5);
	    this.addChild(this.blocks);

	    this.faztSymbol = game.add.text(symbolX, begin + distance * 2, '\uf0e7', this.options.symbolFormat);
	    this.faztSymbol.alpha = 0;
	    this.faztSymbol.anchor.set(0.5);
	    this.addChild(this.faztSymbol);

	    this.fazt = game.add.text(scoreX, begin + distance * 2, '0', this.options.achievementsFormat);
	    this.fazt.alpha = 0;
	    this.fazt.anchor.set(0.5);
	    this.addChild(this.fazt);
	}

	function onPopupComplete(container){
		container.destroy();
	}

	function onAvatarStart(){
		if(this.stopAvatarAnimation){
			this.avatar.timeline.pause();
		}
	}

	function createAvatar(){
		this.avatar = game.add.sprite(0, 100, this.player.avatar);
	    this.avatar.anchor.set(0.5, 0.75);
	    this.avatar.events.onDestroy.add(onAvatarDestroy, this);
	    this.addChildAt(this.avatar, this.children.indexOf(this.background));
	    this.addChild(this.avatarMask);
	    this.avatar.mask = this.avatarMask;
	}

	function removeAvatar(){
		if(this.avatar.timeline){
			this.avatar.timeline.kill();
		}
		this.avatar.destroy();
	    this.removeChild(this.avatarMask);
	}

	function animateAvatar(){
		this.avatar.timeline = new TimelineMax({ yoyo: true, repeat: -1 });
		this.avatar.timeline.add(onAvatarStart.bind(this));
	    this.avatar.timeline.to(this.avatar, this.options.avatarSpeed,
	    	{ y: '+=' + this.options.avatarJumpY, ease: Sine.easeInOut });
		// this.avatar.timeline.to(this.avatar, this.options.avatarSpeed, { angle: this.options.avatarAngle, ease: Sine.easeOut });
		// this.avatar.timeline.to(this.avatar, this.options.avatarSpeed, { angle: 0, ease: Sine.easeIn });
		// this.avatar.timeline.to(this.avatar, this.options.avatarSpeed, { angle: -this.options.avatarAngle, ease: Sine.easeOut });
		// this.avatar.timeline.to(this.avatar, this.options.avatarSpeed, { angle: 0, ease: Sine.easeIn });
	}

	function onSetPlayerComplete(){
		animateAvatar.call(this);
	}

	function onRemoveComplete(){
		removeAvatar.call(this);
	}

	function onAvatarDestroy(){
		if(this.avatar.timeline){
			this.avatar.timeline.kill();
		}
	}

	function onPointsUpdate(){
		this.points.text = Math.ceil(this.currentPoints).toString();
	}

	function onTweenColorStart(timeline){
		if(this.colorTimeline){
			this.colorTimeline.kill();
		}
		this.colorTimeline = timeline;
	}

	// public methods

	PlayerIcon.prototype.setToJoin = function() {
		this.player = null;
		
		var timeline = new TimelineMax();
		timeline.to([this.name, this.points], this.options.setPlayerFadeInTime, { alpha: 0 }, 0);
		if(this.options.isShowStats){
			timeline.to([this.victories, this.blocks, this.fazt, this.victoriesSymbol, this.blocksSymbol, this.faztSymbol], 
				this.options.setPlayerFadeInTime, { alpha: 0 }, 0);
		}
		timeline.to(this.avatar, this.options.setPlayerFadeInTime, { y: this.options.avatarStartY });
		timeline.add(onRemoveComplete.bind(this));
		timeline.addLabel('fade');
		timeline.to(this.background, this.options.setPlayerFadeOutTime, { colorProps: { changeColor: this.options.joinColor } });
		timeline.to(this.join, this.options.setPlayerFadeOutTime, { alpha: 1 }, 0);
		return timeline;
	}

	PlayerIcon.prototype.removePlayer = function() {
		this.player = null;

		var timeline = new TimelineMax({ onComplete: onRemoveComplete, onCompleteScope: this });
		timeline.to([this.name, this.points], this.options.setPlayerFadeInTime, { alpha: 0 }, 0);
		if(this.options.isShowStats){
			timeline.to([this.victories, this.blocks, this.fazt, this.victoriesSymbol, this.blocksSymbol, this.faztSymbol], 
				this.options.setPlayerFadeInTime, { alpha: 0 }, 0);
		}
		timeline.to(this.avatar, this.options.setPlayerFadeInTime, { y: this.options.avatarStartY });
		timeline.to(this, this.options.setPlayerFadeOutTime, { alpha: 0 });
		return timeline;
	};

	PlayerIcon.prototype.appear = function(isAnimate) {
		this.avatar.timeline.play();
		var timeline = new TimelineMax();
		timeline.to(this, this.options.appearTime, { alpha: 1 });
		if(!isAnimate){
			timeline.progress(1);
		}
		return timeline;
	};

	PlayerIcon.prototype.disappear = function(isAnimate) {
		this.avatar.timeline.pause();
		var timeline = new TimelineMax();
		timeline.to(this, this.options.appearTime, { alpha: 0 });
		if(!isAnimate){
			timeline.progress(1);
		}
		return timeline;
	};

	PlayerIcon.prototype.setPlayer = function(player, isAnimate) {
		// player appear
		this.player = player;
		this.name.text = player.name;
		this.points.text = player.points.toString();
		this.currentPoints = player.points;

		// setting stats
		if(this.options.isShowStats){
			this.blocks.text = player.block.toString();
			this.fazt.text = player.fazt.toString();
			this.victories.text = player.victories.toString();
		}

		// setting avatar
		createAvatar.call(this);

		// animating set player
		var timeline = new TimelineMax({ onComplete: onSetPlayerComplete, onCompleteScope: this });
		timeline.to(this.background, this.options.setPlayerFadeOutTime, { colorProps: { changeColor: this.options.playerColor } });
		timeline.to(this.join, this.options.setPlayerFadeOutTime, { alpha: 0 }, 0);
		timeline.addLabel('fade');
		timeline.to(this.avatar, this.options.setPlayerFadeInTime, { y: this.options.avatarTargetY }, 'fade');
		timeline.to([this.name, this.points], this.options.setPlayerFadeInTime, { alpha: 1 }, 'fade');
		if(this.options.isShowStats){
			timeline.to([this.victories, this.blocks, this.fazt, this.victoriesSymbol, this.blocksSymbol, this.faztSymbol], 
				this.options.setPlayerFadeInTime, { alpha: 1 }, 'fade');
		}

		if(!isAnimate){
			timeline.progress(1);
		}
		return timeline;
	};

	PlayerIcon.prototype.removePopup = function(container, options) {
		options = _.extend({
			disappearTime: 1,
		}, options);

		if(container === undefined){
			container = this.popupContainer;
		}
	    var timeline = new TimelineMax();
		if(!container){
			return timeline;
		}
	    timeline.vars.onComplete = onPopupComplete;
	    timeline.vars.onCompleteScope = this;
	    timeline.vars.onCompleteParams = [container];
	    timeline.to(container, options.disappearTime, { alpha: 0 });
	    return timeline;
	};

	PlayerIcon.prototype.popup = function(options) {
		options = _.extend({
			color: 0x36de4a,
			text: 'Ready',
			textFormat: {
				font: "22px Montserrat",
		        fill: "#000000",
		        align: "center",
		    },
			symbol: '\uf042',
			symbolFormat: {
				font: "25px FontAwesome",
		        fill: "#000000",
		        align: "center",
		    },
			moveTime: 1,
			stayTime: 3,
			disappearTime: 1,
			padding: 10,
			radius: 10,
			isStay: false,
			targetY: -175,
		}, options);

	    var container = game.add.sprite(-this.options.width / 2, -this.options.height / 2);
	    var symbol; 
	    var textX = options.padding;
	    if(options.symbol) {
	    	symbol = new Phaser.Text(game, options.padding, options.padding, options.symbol, options.symbolFormat);
	    	textX += symbol.x + symbol.width;
	    	container.addChild(symbol);
	    }

	    var text = new Phaser.Text(game, textX, options.padding, options.text, options.textFormat);

	    var height = symbol ? symbol.height > text.height ? symbol.height : text.height : text.height;
		var box = new Phaser.Graphics(game);
	    box.beginFill(options.color);
	    box.drawRoundedRect(0, 0, text.x + text.width + options.padding, options.padding * 2 + height, options.radius);

	    container.addChildAt(box, 0);
	    container.addChild(text);

	    var index = this.children.indexOf(this.avatar);
	    this.addChildAt(container, index);

	    var timeline = new TimelineMax();
	    timeline.to(container, options.moveTime, { y: options.targetY });
	    if(options.isStay){
	    	this.popupContainer = container;
	    	return timeline;
	    }
	    timeline.add(this.removePopup(container, options), '+=' + options.stayTime);
	    return timeline;
	};

	PlayerIcon.prototype.tweenColor = function(options) {
		options = _.extend({
			isReturn: false,
			returnTime: 3,
			color: this.options.playerColor,
		}, options);

		var timeline = new TimelineMax({ onStart: onTweenColorStart, onStartScope: this });
		timeline.vars.onStartParams = [timeline];
		timeline.to(this.background, this.options.colorTime, { colorProps: { changeColor: options.color } });
		if(options.isReturn){
			timeline.to(this.background, this.options.colorTime, { colorProps: { changeColor: this.options.color } }, options.returnTime);
		}
		return timeline;
	};

	PlayerIcon.prototype.removeStats = function() {
		var timeline = new TimelineMax();
		timeline.to([this.victories, this.blocks, this.fazt, this.victoriesSymbol, this.blocksSymbol, this.faztSymbol], 
			this.options.setPlayerFadeOutTime, { alpha: 0 }, 0);
		return timeline;		
	};

	PlayerIcon.prototype.setAvatarAnimation = function(on, immidiate) {
		if(!this.avatar){
			return;
		}
		if(on){
			this.avatar.timeline.play();
		} else {
			this.stopAvatarAnimation = true;
			if(immidiate) {
				this.avatar.timeline.pause();
			}
		}
	};

	PlayerIcon.prototype.setPoints = function(points) {
		var timeline = new TimelineMax({ onUpdate: onPointsUpdate, onUpdateScope: this });
		timeline.to(this, this.options.pointsTime, { currentPoints: points });
		return timeline;
	};

	PlayerIcon.prototype.setCards = function(progress) {
		var timeline = new TimelineMax();
		timeline.to(this.cardCountBar.graphicsData[0].shape, 1, { width: this.options.width * progress });
		return timeline;
	};

	PlayerIcon.prototype.flash = function(time) {
		if(this.flashTimeline){
			this.flashTimeline.kill();
		}
		this.flashTimeline = new TimelineMax({ repeat: -1, yoyo: true });
		this.flashTimeline.to(this.cardCountBar, time, { alpha: 0, ease: Linear.easeNone });
		return this.flashTimeline;
	};

	PlayerIcon.prototype.showIcon = function(options) {
		options = _.extend({
			symbol: '\uf05e',
			symbolFormat: {
		    	font: "125px FontAwesome",
		        fill: "#cb1800",
		        align: "center"
		    },
		    time: 0.75,
		    delayTime: 3,
		    y: -20,
		}, options)

		var block = new Phaser.Text(game, 0, options.y, options.symbol, options.symbolFormat);
		block.anchor.set(0.5);
		block.alpha = 0;
		this.addChild(block);
		var timeline = new TimelineMax();
		timeline.to(block, options.time, { alpha: 1 });
		timeline.to(block, options.time, { alpha: 0 }, options.delayTime);
		return timeline;
	};

	PlayerIcon.prototype.changeName = function(name) {
		var timeline = new TimelineLite();
		timeline.to(this.name, this.options.changeNameTime * 0.5, { alpha: 0 });
		timeline.addLabel('half');
		timeline.to(this.name, this.options.changeNameTime * 0.5, { alpha: 1 }, 'half');
		timeline.add(function(){
			this.name.text = name;
		}.bind(this), 'half');
		return timeline;
	}

	PlayerIcon.prototype.changeAvatar = function(avatar) {
		if(this.changeAvatarTimeline){
			this.changeAvatarTimeline.kill();
		}
		var timeline = new TimelineMax();
		this.changeAvatarTimeline = timeline;
		timeline.to(this.avatar, 0.75, { y: this.options.avatarStartY });
		timeline.add(removeAvatar.bind(this));
		timeline.add(function(){
			createAvatar.call(this);
			timeline.to(this.avatar, 0.75, { y: this.options.avatarTargetY });
			timeline.add(animateAvatar.bind(this));
		}.bind(this));
	}
})()




