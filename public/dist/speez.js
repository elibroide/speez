// analytics.js

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','http://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-57307032-1', 'auto');
ga('send', 'pageview');

var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-57307032-1']);
  _gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})(); ;// animation.js

Animation = (function(){
	
	function Animation(){
		this.groups = [];

		Animation.instance = this;
	}

	Animation.prototype.getGroup = function(groupId) {
		var group = {
			id: id,
			animations: [],
			pause: false,
		};
		this.groups.push(group);
		return group;
	};

	Animation.prototype.create = function(options, groupId) {
		var group = this.getGroup(groupId);
		var timeline = new TimelineLite(options);
		timeline.vars.paused = group.pause;
		group.push(options);
		return timeline;
	};

	return Animation;

})();;// audio.js

Audio = (function(){
	
	function Audio(){
		this.groups = [];

		Audio.instance = this;
	}

	Audio.prototype.addGroup = function(id) {
		var group = {
			id: id,
			sounds: [],
			volume: 1,
			mute: false,
		};
		this.groups.push(group);
		return group;
	};

	Audio.prototype.getGroup = function(groupId) {
		var group = _.findWhere(this.groups, { id: groupId });
		if(!group){
			group = this.addGroup(groupId);
		}
		return group;
	};

	function handleSoundStopped(){
		var group = this.group;
		var soundIndex = group.sounds.indexOf(this);
		if(soundIndex === -1){
			return;
		}
		group.sounds.splice(soundIndex, 1);
		this.destroy();
	}

	Audio.prototype.play = function(groupId, key, volume, loop) {
		var group = this.getGroup(groupId);
		if(volume === undefined){
			volume = group.mute ? 0 : group.volume;
		}
		var sound = game.sound.play(key, volume, loop);
		group.sounds.push(sound);
		sound.group = group;
		sound.onStop.addOnce(handleSoundStopped.bind(sound));
	};

	Audio.prototype.stop = function(groupId) {
		var group = this.getGroup(groupId);
		_.each(group.sounds.slice(0), function(sound){
			sound.stop();
		});
	};

	Audio.prototype.volume = function(groupId, volume) {
		var group = this.getGroup(groupId);
		group.volume = volume;
		_.each(group.sounds, function(sound){
			sound.volume = volume;
		});
	};

	Audio.prototype.mute = function(groupId, mute) {
		var group = this.getGroup(groupId);
		group.mute = mute;
		_.each(group.sounds, function(sound){
			sound.volume = group.mute ? 0 : group.volume;
		});
	};

	return Audio;

})();;// client.js

var com;
(function(window){
    com = $.extend({ speez: {} }, com);
})(window);

var preloadAvatar;
var detector;
var gameOrientation = 'portrait';
var originalWidth;
var originalWidthCenter;
var originalHeight;
var originalHeightCenter;
var config;
var socket;
var game;
var stage;
var player;
var world;
var Layout = com.Layout;
var gameCount = 0;
var palette = [
    0xFFD646,
    0x019AFF,
    0xEA1D00,
    0xC500EE,
    0x36DE49,
];
var avatarNames = [
    "Zumi",
    "Ziki",
    "ZaZok",
    "ZoZo",
    "Zoor",
    "Zeeps",
    "Zot",
];

function init(){

    // set config
    config = {
        dpr: window.devicePixelRatio,
        width: 640,
        height: 960,
        isLocal: true,
        platform: platformType,
        isPlayer: platformType === 'player' || platformType === 'mobile',
        isPackage: window.location.protocol.indexOf('file') > -1,
        version: gameVersion,
        isUnderConstruction: isUnderConstruction && window.location.hash.indexOf('user=bb') === -1 && window.location.protocol.indexOf('file') === -1,
    }

    // set size
    originalWidth = config.width;
    originalHeight = config.height;
    originalWidthCenter = originalWidth * 0.5;
    originalHeightCenter = originalHeight * 0.5;

    // set address
    if(config.isPackage){
        config.address = 'http://speez.herokuapp.com/';
        config.isPackage = true;
    } else {
        config.address = window.location.origin + '/';
        config.isPackage = false;
    }
    config.isLocal = config.address.indexOf('localhost') > -1;
    var script = $('<script>').attr('type', 'text/javascript').attr('src', config.address + 'socket.io/socket.io.js')
    $('head').append(script);

    // initiate singletones
    var audio = new Audio();
    game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '');
    game.stageColor = function(color){
        if(color !== undefined){
            game.stage.backgroundColor = common.getRgb(color);
        }
        return game.stage.backgroundColor;
    }

    // debug config
    console.log(config);

    // load game states
    game.state.add('boot', bootState);
    if(config.isUnderConstruction){
        game.state.add('mail', mailState);
    } else {
        game.state.add('preload', preloadState);
        game.state.add('main', mainState);
        game.state.add('player', playerState);
        game.state.add('playerFinish', playerFinishState);
        game.state.add('lobby', lobbyState);
        game.state.add('lobbyPlayer', lobbyPlayerState);
        game.state.add('stage', stageState);
        game.state.add('stageFinish', stageFinishState);
    }
    game.state.start('boot');
}



;// common.js
// Eliezer Broide

var common = {

	flipOrientation: function(targetOrientation){
		console.log('try to flip ' + gameOrientation + ' to ' + targetOrientation);
		if(gameOrientation === targetOrientation){
			return;
		}
		if(config.platform === 'mobile'){
			screen.lockOrientation(targetOrientation);
		}
		console.log('Flipping ' + gameOrientation + ' to ' + targetOrientation);
		gameOrientation = targetOrientation;
		var temp = originalWidth;
		originalWidth = originalHeight;
		originalHeight = temp;
		originalWidthCenter = originalWidth * 0.5;
		originalHeightCenter = originalHeight * 0.5;
	},

	addZeroes: function(number, length, add){
		if(add === undefined){
			add = '0';
		}
		var textNumber = number.toString();
		while(textNumber.length < length){
			textNumber = add + textNumber;
		}
		return textNumber;
	},

	createBlankBackground: function(color){
		if(color === undefined){
			color = 0xffffff;
		}
		var background = game.add.sprite(0, 0, 'background');
        background.fixedToCamera = true;
        background.scale.setTo(width, height);
        background.inputEnabled = true;
        background.input.priorityID = 0;
        return background;
	},

	generateNames: function(prefix, from, to, suffix, digits, jump){
		if(suffix === undefined){
			suffix = '';
		}
		if(digits === undefined){
			digits = 1;
		}
		if(jump === undefined){
			jump = 1;
		}
		var arr = [];
		for(var i = from; i <= to; i += jump){
			var numberText = i.toString();
			while(numberText.length < digits){
				numberText = '0' + numberText;
			}
			arr.push(prefix + numberText + suffix);
		}
		return arr;
	},

	drawButton: function(text, x, y, callback, isOnce){
		var button = game.add.sprite(x, y, 'button', 5);
		button.anchor.set(0.5, 0.5);
		button.text = game.add.text(0, 0, text, {
	        font: "40px Arial",
	        fill: "#00ff44",
	        align: "center"
	    });
	    button.text.anchor.set(0.5, 0.5);
	    button.inputEnabled = true;
	    button.addChild(button.text);
	    
	    if(callback) {
	    	button.events.onInputOut.add(function(){
	    		button.frame = 5;
		    });
		    button.events.onInputOver.add(function(){
		    	button.frame = 1;
		    });
		    if(isOnce) {
		    	button.events.onInputDown.addOnce(callback);
		    }
		    else{
		    	button.events.onInputDown.add(callback);
		    }
	    }

	    return button;
	},

	tweenTint: function(obj, startColor, endColor, time) {
	    // create an object to tween with our step value at 0
	    var colorBlend = {step: 0};

	    // create the tween on this object and tween its step property to 100
	    var colorTween = game.add.tween(colorBlend).to({step: 1}, time);
	    
	    // run the interpolateColor function every time the tween updates, feeding it the
	    // updated value of our tween each time, and set the result as our tint
	    var setColor = function(tween, progress) {
	    	var color = Phaser.Color.interpolateColor(startColor, endColor, 1, colorBlend.step, 0);
	    	if(typeof obj === 'function'){
	    		obj(color);
	    		return;
	    	}
	    };

	    colorTween.onUpdateCallback(setColor);
	    setColor(colorTween, 0);
	    
	    // start the tween
	    colorTween.start();

	    return colorTween;
	},

	tweenStageColor: function(color, complete, time){
		if(time === undefined){
			time = 0.1;
		}
		return TweenLite.to(game, time, { colorProps: { stageColor: color }, onComplete: complete });
	},

	tweenSpin: function(obj, time, options){
		options = _.extend({
			isClockwise: true,
			isEase: true,
		}, options);
		var tweens = [];
		tweens[0] = game.add.tween(obj).to({ 
			angle: options.isClockwise ? 180 : -180 }, 
			time * 500, 
			options.isEase ? Phaser.Easing.Back.In : false,
			true
		);
		tweens[1] = game.add.tween(obj).to({ 
			angle: options.isClockwise ? 359 : -360 }, 
			time * 500, 
			options.isEase ? Phaser.Easing.Back.Out : false,
			false
		);
		tweens[0].chain(tweens[1]);
		tweens[1].onComplete.add(function(){
			obj.angle = 0;
		});
		return tweens;
	},

	getRgb: function(color){
		return eval('common.'+color);
	},

	rgb: function(r,g,b){
		return (r << 16) + (g << 8) + b;
	},

	rgba: function(r, g, b, a){
		return (a << 24) + (r << 16) + (g << 8) + (b);
	},

	toRgb: function(color){
		return 'rgb(' + [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff].join(',') + ')';
	},

	toRgba: function(color, alpha){
		if(alpha === undefined){
			alpha = 0;
		}
		alpha += (color & 0xff000000) >> 20;
		return 'rgba(' + [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff].join(',') + ', ' + alpha + ')';
	},

	toRgbHex: function(color, prefix){
		if(prefix === undefined){
			prefix = '';
		}
		var r = ((color & 0xff0000) >> 16).toString(16);
		var g = ((color & 0x00ff00) >> 8).toString(16);
		var b = (color & 0x0000ff).toString(16);
		r += r.length === 1 ? '0' : '';
		g += g.length === 1 ? '0' : '';
		b += b.length === 1 ? '0' : '';
		return prefix + r + g + b;
	},

	addHsl: function(color, h, s, l){
		var rgb = Phaser.Color.getRGB(color);
		var hsl = common.rgbToHsl(rgb.r, rgb.g, rgb.b);

		if(h === undefined){
			h = 0;
		}
		if(s === undefined){
			s = 0;
		}
		if(l === undefined){
			l = 0;
		}
		h = Math.min(Math.max(hsl.h + h, 0), 1);
		s = Math.min(Math.max(hsl.s + s, 0), 1);
		l = Math.min(Math.max(hsl.l + l, 0), 1);

		var hue = common.hslToRgb(h, s, l);
		return common.rgb(hue.r, hue.g, hue.b);
	},

	textColorChange: function(){
		return function(color){
			if(color !== undefined){
				this.fill = '#' + common.getRgb(color).toString(16);
			}
			return this.fill;
		}
	},

	graphicsColorChange: function(i, property){
		if(property === undefined){
			property = '_fillTint';
		}
		return function(color){
			if(color !== undefined){
				this.color = common.getRgb(color);
				this.graphicsData[i][property] = this.color;
			}
			return this.graphicsData[i][property];
		}
	},

	propertyColorChange: function(property) {
		return function(color){
			if(color !== undefined){
				this[property] = common.getRgb(color);
			}
			return this[property];
		}
	},

	brightness: function(color, diff) {
		var rgb = Phaser.Color.getRGB(color);
		rgb.r = Math.max(0, Math.min(255, rgb.r + diff));
		rgb.g = Math.max(0, Math.min(255, rgb.g + diff));
		rgb.b = Math.max(0, Math.min(255, rgb.b + diff));
		return common.rgb(rgb.r, rgb.g, rgb.b);
	},

	rgbToHsl: function(r, g, b){
	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return {h: h, s: s, l: l};
	},

	hslToRgb: function(h, s, l){
	    var r, g, b;

	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }

	    return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
	},

	addLogo: function(type, area){
		switch(type){
			case 'logo':
				var bbLogo = new com.speez.components.Logo(originalWidth - 10, originalHeight - 10, originalWidth, originalHeight, {
					scale: 0.5
				});
			    bbLogo.logo.anchor.set(1);
				game.add.existing(bbLogo);
				area.attach(bbLogo, { scale: 1, width: originalWidth, height: originalHeight, alignHorizontal: Layout.ALIGN_RIGHT, alignVertical: Layout.ALIGN_BOTTOM });
				break;
			case 'beta':
				var beta = new com.speez.components.Logo(originalWidth, 0, originalWidth, originalHeight, {
					logo: 'beta',
				});
			    beta.logo.anchor.set(1, 0);
				game.add.existing(beta);
				area.attach(beta, { width: originalWidth, height: originalHeight, alignHorizontal: Layout.ALIGN_RIGHT, alignVertical: Layout.ALIGN_TOP });
				break;
			case 'feedback':
				var format = {
					font: '65px FontAwesome',
					fill: '#000000',
					align: 'center',
				}
				var feedback = game.add.text(25, originalHeight - 3, '\uf0e0', format);
				feedback.inputEnabled = true;
				feedback.events.onInputDown.add(function(){
					common.open('mailto:broidebrothers@gmail.com?Subject=SPEEZ%20Feedback');
				});
				feedback.anchor.set(0, 1);
				var facebook = game.add.text(feedback.width * 2, originalHeight, '\uf082', format);
				facebook.inputEnabled = true;
				facebook.events.onInputDown.add(function(){
					common.open('https://www.facebook.com/Speez.co');
				});
				facebook.anchor.set(0, 1);
				var text = game.add.text(25, originalHeight - facebook.height, 'Feedback - ' + config.platform, {
					font: '25px FontAwesome',
					fill: '#000000',
					align: 'center',
				});
				text.anchor.set(0, 1);
				var container = game.add.sprite();
				container.addChild(text);
				container.addChild(feedback);
				container.addChild(facebook);
				area.attach(container, { width: originalWidth, height: originalHeight, alignHorizontal: Layout.ALIGN_LEFT, alignVertical: Layout.ALIGN_BOTTOM });
				break;
		}
	},

	open: function(url, ignore){
		var name = '_blank';
		if(!ignore && detector.mobile() && detector.os().toLowerCase().indexOf('ios') > -1 && navigator.userAgent.toLowerCase().indexOf("safari") > -1){
			name = '_parent';
		}
		window.open(url, name);
	},
}












;// achievement.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.AchievementBoard = (function(){

	function AchievementBoard(x, y, width, height, options){
		options = _.extend({
			x: x,
			y: y,
			width: width,
			height: height,
			color: 0x444444,
			alpha: 0,
			format: {
		        font: "40px Arial",
		        fill: "#eeeeee",
		        stroke: "#111111",
		        align: "center",
		        strokeThickness: 10,
		    },
		    finalHeight: 320,
		    distanceHeight: 50,
		    textAppearTime: 1,
		    textDelayTime: 1,
		    textDissipateTime: 0.3,
		    dissipateTime: 0.3,
		    levelCount: 3,
		}, options);
		this.options = options;
	    
	    Phaser.Sprite.call(this, game, x, y);

		this.background = new ColorBox(x, y, width, height, this.options.color);
		this.background.alpha = this.options.alpha;
		this.addChild(this.background);

		this.container = game.add.sprite(0, 0);
		this.addChild(this.container);

		this.texts = [];
	}

	// Constructors
	AchievementBoard.prototype = Object.create(Phaser.Sprite.prototype);
	AchievementBoard.prototype.constructor = AchievementBoard;

	// public methods

	AchievementBoard.prototype.show = function() {
		this.alpha = 1;
		this.hidden = false;
	};

	AchievementBoard.prototype.hide = function() {
		this.hidden = true;
		_.each(this.texts, function(text){
			if(text.timeline){
				text.timeline.kill()
			}
		}.bind(this));
		var complete = function(){
			_.invoke(this.texts, 'destroy');
			this.texts = [];
		}.bind(this);
		TweenLite.to(this, this.options.dissipateTime, { alpha: 0, onComplete: complete });
	};

	AchievementBoard.prototype.add = function(text) {
		if(this.hidden){
			return;
		}
		var text = new Phaser.Text(game, 0, 0, text, this.options.format);
		text.alpha = 0;
	    text.anchor.set(0.5);
	    this.container.addChild(text);
		this.texts.push(text);

		if(this.texts.length > this.options.levelCount){
			return;
		}
		this.setTextAnimation(text);
	};

	AchievementBoard.prototype.setTextAnimation = function(text) {
		if(text.timeline){
			text.timeline.kill();
		}
		var targetLevel = this.texts.indexOf(text);
		var timeline = new TimelineLite();
		var targetHeight = this.options.finalHeight - targetLevel * this.options.distanceHeight;
		var targetAlpha = targetHeight / this.options.finalHeight;
		timeline.to(text, this.options.textAppearTime, { alpha: targetAlpha, y: targetHeight }, 0);
		if(targetLevel !== 0){
			return;
		}
		timeline.to(text, this.options.textDissipateTime, { alpha: 0 }, '+=' + this.options.textDelayTime);
		timeline.add(function(){
			text.destroy();
			timeline.kill();	
		});
		timeline.add(this.setAllTextsAnimations.bind(this), '-=' + this.options.textDissipateTime * 0.75);
		text.timeline = timeline;
	};

	AchievementBoard.prototype.setAllTextsAnimations = function() {
		this.texts = _.rest(this.texts);
		_.each(this.texts, function(text){
			this.setTextAnimation(text);
		}.bind(this));
	};

	return AchievementBoard;
})();






;// AvatarPicker.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.AvatarPicker = (function(){

	AvatarPicker = function (x, y, options) {
		options = $.extend({
			avatar: 'Zot',
			arrowFormat: {
				font: 'bold 90px FontAwesome',
				fill: '#5a5a5c',
				align: 'center',
			},
			arrowDistanceX: 235,
			avatarNames: [
				'Zeeps'
			]
		}, options);
		this.options = options;
		
	    Phaser.Sprite.call(this, game, x, y);

	    this.platform = game.add.sprite(0, 60, 'logoO');
	    this.platform.anchor.set(0.5);
	    this.addChild(this.platform);

	    this.container = game.add.sprite();
	    this.container.timeline = new TimelineMax({ repeat: -1, yoyo: true });
		this.container.timeline.to(this.container, 1, { y: '-=20', ease: Power2.easeInOut });
	    this.addChild(this.container);

	    var head = createAvatar.call(this);
	    head.alpha = 1;
	    switchAvatar.call(this, head);

    	this.leftArrow = game.add.text(this.options.arrowDistanceX, 0, '\uf105', this.options.arrowFormat);
    	this.leftArrow.anchor.set(0.5);
    	this.leftArrow.inputEnabled = true;
    	this.leftArrow.events.onInputDown.add(changeAvatar, this, -1);
    	this.addChild(this.leftArrow);

    	this.rightArrow = game.add.text(-this.options.arrowDistanceX, 0, '\uf104', this.options.arrowFormat);
    	this.rightArrow.anchor.set(0.5);
    	this.rightArrow.inputEnabled = true;
    	this.rightArrow.events.onInputDown.add(changeAvatar, this, 1);
    	this.addChild(this.rightArrow);

    	this.changed = new signals.Signal();
	}

	// Constructors
	AvatarPicker.prototype = Object.create(Phaser.Sprite.prototype);
	AvatarPicker.prototype.constructor = AvatarPicker;

	// private methods

	function switchAvatar(newHead){
		if(this.head){
			this.head.destroy();
		}
		this.head = newHead;
	    this.container.addChild(this.head);
	}

	function createAvatar(){
		// create
		var head = new Phaser.Sprite(game, 0, 0, this.options.avatar + '_head');
	    head.anchor.set(0.5);
	    head.alpha = 0;
		return head;
	}

	function onChangeAvatarComplete(){
		this.setEnable(true);
	}

	function changeAvatar(target){
		var direction = this.rightArrow === target ? 1 : -1;
		var current = this.options.avatarNames.indexOf(this.options.avatar);
		var next = (current + direction + this.options.avatarNames.length) % this.options.avatarNames.length;
		this.options.avatar = this.options.avatarNames[next];
		this.setEnable(false);

		this.changed.dispatch(this.options.avatar);

		var newHead = createAvatar.call(this);
		var timeline = new TimelineMax({ onComplete: onChangeAvatarComplete, onCompleteScope: this });
		timeline.to(this.head, 0.2, { alpha: 0, ease: Sine.easeOut });
		timeline.add(function(){
			switchAvatar.call(this, newHead);
		}.bind(this));
		timeline.to(newHead, 0.2, { alpha: 1, ease: Sine.easeIn });
	}

	// public methods

	AvatarPicker.prototype.change = function(avatar) {
		
	};

	AvatarPicker.prototype.setEnable = function(on) {
		this.leftArrow.inputEnabled = on;
		this.rightArrow.inputEnabled = on;
	};

	return AvatarPicker;

})();
















;// BlockNumber.js

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
















;// board.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Board = (function(){

	function Board(x, y, width, height, color, options){
		options = _.extend({
			x: x,
			y: y,
			width: width,
			height: height,
			color: color,
			colorTime: 0.2,
			brightness: 0x22,
			darkness: 0x11,
			cardFormat: {
				font: "300px Arial",
		        fill: "#ffffff",
		        align: "center"
			},
			cardTime: 0.25,
			appearTime: 2,
			nameFormat: {
				font: "80px Arial",
		        fill: "#ffffff",
		        align: "center"
			},
			nameHeight: 200,
			nameTime: 3,
			nameFadeInTime: 0.25,
			nameFadeOutTime: 0.25,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, x, y);

		// Background
		this.background = game.add.graphics();
		this.background.beginFill(color);
		this.background.drawRect(0, 0, width, height);
		this.addChild(this.background);
		this.area = new com.LayoutArea(x, y, width, height, {isDebug: false});
		this.area.attach(this.background, {
			mode: Layout.STRETCH,
		});

		// content
		game.add.existing(this);
		this.container = game.add.sprite(0, 0);
		this.area.attach(this.container, {
			width: originalWidthCenter,
			height: originalHeight,
			mode: Layout.PROPORTIONAL_INSIDE,
		});

		// card
		this.card = new Phaser.Text(game, width * 0.5, originalHeight * 0.5, '', options.cardFormat);
	    this.card.anchor.set(0.5);
	    this.container.addChild(this.card);
	}

	// Constructors
	Board.prototype = Object.create(Phaser.Sprite.prototype);
	Board.prototype.constructor = Board;

	// Constants
	Object.defineProperty(Board, "LOCATION_LEFT_TOP", { value: 'leftTop' });
	Object.defineProperty(Board, "LOCATION_LEFT_BOTTOM", { value: 'leftBottom' });
	Object.defineProperty(Board, "LOCATION_RIGHT_TOP", { value: 'rightTop' });
	Object.defineProperty(Board, "LOCATION_RIGHT_BOTTOM", { value: 'rightBottom' });

	// private methods

	function onNameComplete(name){
		this.target.destroy();
	}

	// public methods

	Board.prototype.appear = function(color) {
		this.background.graphicsData[0].fillColor = color;
		var timeline = new TimelineLite();
		timeline.to(this, this.options.appearTime, { colorProps: { backgroundColor: this.options.color }, ease: Bounce.easeOut }, 0);
    	return timeline;
	};

	Board.prototype.cancelProximity = function() {
		return TweenLite.to(this, this.options.colorTime, { colorProps: { backgroundColor: this.options.color } }, 0)
	};

	Board.prototype.setProximity = function(isProximity) {
		var color = common.brightness(this.options.color, isProximity ? this.options.brightness : -this.options.darkness);
		return TweenLite.to(this, this.options.colorTime, { colorProps: { backgroundColor: color } }, 0)
	};

	Board.prototype.tweenColor = function(color, time) {
		return TweenLite.to(this, time, { colorProps: { backgroundColor: color }, ease: Sine.easeInOut }, 0)
	};

	Board.prototype.backgroundColor = function(color) {
		if(color !== undefined){
			this.background.graphicsData[0].fillColor = common.getRgb(color);
		}
		return this.background.graphicsData[0].fillColor;
	};

	Board.prototype.setCard = function(card, name) {
		// card
		var timeline = new TimelineLite();
		timeline.to(this.card.scale, this.options.cardTime / 4, { x: 2.5, y: 2.5 }, 0);
		timeline.addLabel('break', this.options.cardTime / 4);
		timeline.add(function(){
			this.card.text = card;
		}.bind(this));
		timeline.to(this.card.scale, this.options.cardTime * 3 / 4, { x: 1, y: 1, ease: Elastic.easeOut }, 'break');
		this.cardTimeline = timeline;

		// name
		return;
		if(this.nameTimeline && this.nameTimeline.isActive()){
			if(!name || name !== this.currentName){
				this.nameTimeline.seek('fadeOut');
			} else {
				this.nameTimeline.seek('fadeIn');
				return;
			}
		}
		if(!name){
			return;
		}
		this.currentName = name;
		var name = new Phaser.Text(game, this.options.width * 0.5, originalHeight * 0.5 + this.options.nameHeight, name, this.options.nameFormat);
	    name.anchor.set(0.5);
	    name.alpha = 0;
	    this.container.addChild(name);

		timeline = new TimelineLite();
		timeline.to(name, this.options.nameFadeInTime, { alpha: 1 });
		timeline.addLabel('fadeIn');
		timeline.addLabel('fadeOut', '+=' + this.options.nameTime);
		timeline.to(name, this.options.nameFadeOutTime, { alpha: 0, onComplete: onNameComplete, onCompleteParams: name }, 'fadeOut');
		this.nameTimeline = timeline;
	};

	return Board;
})();









;// BoardFactory.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.BoardFactory = (function(){

	function BoardFactory(){
		this.bitmapDatas = [];
		BoardFactory.instance = this;
	}

	// constants
	Object.defineProperty(BoardFactory, "TYPE_BACK", { value: 'back' });
	Object.defineProperty(BoardFactory, "TYPE_BLUR", { value: 'blur' });

	BoardFactory.prototype.create = function(options) {
		options = _.extend({
			color: 0xff0000,
			name: 0xff0000,
			backRadius: 100,
			blurRadius: 50,
			blurIntensityBegin: 0,
			blurIntensityEnd: 1,
		}, options);

		if(this.bitmapDatas[options.name]){
			return this.bitmapDatas[options.name];
		}

		this.radius = options.backRadius + options.blurRadius;
		this.diameter = this.radius * 2;
		var bmd = game.add.bitmapData(this.diameter, this.diameter);
    	this.createBlur(bmd, options);
    	this.createBack(bmd, options);

	    game.cache.addBitmapData(options.name + BoardFactory.TYPE_BACK, bmd);

	    this.bitmapDatas[options.name] = true;
	};

	BoardFactory.prototype.createBack = function(bmd, options) {
		var context = bmd.context;
		context.fillStyle = common.toRgb(options.color);
	    context.beginPath();
		context.arc(this.radius, this.radius, options.backRadius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
	};

	BoardFactory.prototype.createBlur = function(bmd, options) {
		var context = bmd.context;
		// var blurColor = common.brightness(options.color, options.blurBrightness);
		var grd = context.createRadialGradient(this.radius, this.radius, this.radius * 1, this.radius, this.radius, this.radius * 0);
		grd.addColorStop(0, common.toRgba(options.blurColor, options.blurIntensityBegin));
		grd.addColorStop(1, common.toRgba(options.blurColor, options.blurIntensityEnd));
		context.fillStyle = grd;
	    context.beginPath();
		context.arc(this.radius, this.radius, this.radius + options.blurRadius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
	};

	BoardFactory.prototype.get = function(name, type) {
		if(!this.bitmapDatas[name]){
			return;
		}
		return game.cache.getBitmapData(name + type);
	};

	BoardFactory.prototype.remove = function(name) {
		if(!this.bitmapDatas[name]){
			return;
		}
		delete this.bitmapDatas[name];
		game.cache.removeBitmapData(name);
	};

    return BoardFactory;
})();
new com.speez.components.BoardFactory();
var BoardFactory = com.speez.components.BoardFactory;










;// card.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Card = (function(){

	Card = function (index, x, y, width, height, options) {
		
		options = _.extend({
			x: 0,
			y: 0,
			index: index,
			width: width,
			height: height,
			radius: 20,
			gapX: 5,
			gapY: 5,
			color: 0x292929,
		    textColor: 0xFEFEFE,
		    diffusedColor: 0x212121,
			diffusedTextColor: 0x282828,
			pickUpColor: 0xffffff,
		    pickUpTextColor: 0x010101,
			pickUpAlpha: 1,
			card: _.random(0,9),
			overlappedColor: 0xFEFEFE,
			overlappingAlpha: 1,
			overlapOutlineLineColor: 0xFEFEFE,
			waitCard: '+',
			startTime: 2,
			spinTime: 1,
			returnTime: 0.1,
			colorTime: 0.1,
			placeCardTime: 0.5,
			winnerTime: 0.5,
			winnerScale: 5,
			overlapCompleteTime: 0.4,
			format: {
		        font: "100px Montserrat",
		        align: "center"
		    },
		    isNew: false,
		    threshold: 0.1,
		    dragStartCallback: null,
		    dragStopCallback: null,

		    shakeTime: 0.5,
			shake: 75,
			heightOffset: 35,

		}, options);
		// threshold colors
		this.thresholdHit = undefined;

		this.options = options;
		this.index = index;
		this.overlap = null;
		this.card = options.card;
		this.faceup = false;

	    Phaser.Sprite.call(this, game, options.x, options.y);
	    game.add.existing(this);
	    this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });

	    // Adding background
	    this.background = new Phaser.Graphics(game);
		this.background.beginFill(options.diffusedColor)
		var rectWidth = options.width - this.options.gapX * 2;
		var rectHeight = options.height - this.options.gapY * 2;
		this.background.x = rectWidth / 2;
		this.background.y = rectHeight / 2;
	    this.background.pivot.set(rectWidth * 0.5, rectHeight * 0.5);
	    this.background.drawRoundedRect(this.options.gapX, this.options.gapY, rectWidth, rectHeight, this.options.radius);
	    this.background.colorChange = common.graphicsColorChange(0);

	    this.backContainer = game.add.sprite();
	    this.backContainer.addChild(this.background);
	    this.addChild(this.backContainer);
	    this.area.attach(this.backContainer, { width: options.width, height: options.height, mode: Layout.PROPORTIONAL_INSIDE });

	    var overlapOutline = new Phaser.Graphics(game);
	    overlapOutline.x = this.background.x;
	    overlapOutline.y = this.background.y;
	    overlapOutline.lineWidth = 5;
	    overlapOutline.lineDash = 20;
	    overlapOutline.lineColor = this.options.overlapOutlineLineColor;
	    overlapOutline.drawRoundedRect(0, 0, options.width - this.options.gapX * 2, options.height - this.options.gapY * 2, this.options.radius);
	    overlapOutline = game.add.sprite(-10, -10, overlapOutline.generateTexture());
	    this.overlapOutline = game.add.sprite(0, 0);
	    this.overlapOutline.addChild(overlapOutline);
	    this.overlapOutline.alpha = 0;
	    this.area.attach(this.overlapOutline, { width: options.width, height: options.height, mode: Layout.PROPORTIONAL_INSIDE });
	    this.addChild(this.overlapOutline);

	    var solid = game.add.graphics(0, 0);
	    solid.drawRect(0, 0, options.width, options.height-20);
	    this.solidSprite = game.add.sprite(0, 0, solid.generateTexture());
	    this.addChild(this.solidSprite);
	    this.area.attach(this.solidSprite, { width: options.width, height: options.height, mode: Layout.STRETCH });

	    // content
	    this.container = game.add.sprite();
	    this.addChild(this.container);
	    this.area.attach(this.container, { width: options.width, height: options.height });

	    // Adding Text
	    this.text = new Phaser.Text(game, options.width * 0.5, options.height * 0.5, options.waitCard, options.format);
	    this.text.fill = '#' + this.options.diffusedTextColor.toString(16);
	    this.text.anchor.set(0.5, 0.5);
	    this.text.colorChange = common.textColorChange();
	    this.container.addChild(this.text);

	    // Emitter 
	    // this.emitter = game.add.emitter(0, 0, 100);
	    // this.emitter.particleClass = ParticleFactory.instance.create({
	    // 	name: 'cardParticle',
	    // 	color: this.options.textColor,
	    // 	size: 10,
	    // });
	    // var speed = 300;
	    // this.emitter.setXSpeed(-speed, speed);
	    // this.emitter.setYSpeed(-speed, speed);
	    // // this.emitter.minParticleSpeed.set(-100, 100);
	    // // this.emitter.setAlpha(0.1, 1, 3000);
	    // this.emitter.gravity = 200;
    	// this.emitter.makeParticles();

	    // Properties
	    this.anchor.set(0.5, 0.5);
	    this.enable(true);

	    this.overlapped = new signals.Signal();
	    this.proximity = new signals.Signal();
	    this.appeared = new signals.Signal();

	    this.background.alpha = 0;
		this.text.alpha = 1;
		this.alpha = 0.75;

		this.events.onDestroy.add(onDestroy, this);
	}

	// Constructors
	Card.prototype = Object.create(Phaser.Sprite.prototype);
	Card.prototype.constructor = Card;

	// Constants
	Object.defineProperty(Card, "THRESHOLD_NONE", { value: 4 });
	Object.defineProperty(Card, "THRESHOLD_LEFT_TOP", { value: 0 });
	Object.defineProperty(Card, "THRESHOLD_LEFT_BOTTOM", { value: 2 });
	Object.defineProperty(Card, "THRESHOLD_RIGHT_TOP", { value: 1 });
	Object.defineProperty(Card, "THRESHOLD_RIGHT_BOTTOM", { value: 3 });

	// private methods

	function onDestroy(){
		this.area.destroy();
	}

	function getThreshold(){
		var x = this.x;
		var y = this.currentRatioY;
		var threshold = game.width * this.options.threshold;
		if(x > this.options.x + threshold){
			if(y < 0.5) {
				return Card.THRESHOLD_RIGHT_TOP;
			} else {
				return Card.THRESHOLD_RIGHT_BOTTOM;
			}
		} else if(x < this.options.x - threshold){
			if(y < 0.5) {
				return Card.THRESHOLD_LEFT_TOP;
			} else {
				return Card.THRESHOLD_LEFT_BOTTOM;
			}
		}
		return undefined;
	}

	// public methods

	Card.prototype.postUpdate = function() {
		if(this.options.waitCard !== '+' || !this.input.isDragged){
			return;
		}

		this.background.angle = this.x / game.world.width * 100;
		var gameHeight = game.height - this.options.heightOffset * Layout.instance.scaleY;
		var currentY = this.background.world.y + (this.options.height * 0.5 - this.options.heightOffset) * Layout.instance.scaleY;
		this.currentRatioY = currentY / gameHeight;
		var threshold = getThreshold.bind(this)();
		if(this.thresholdHit !== threshold){
			this.thresholdHit = threshold;
			if(threshold === undefined){
				this.proximity.dispatch(this);
			} else {
				this.proximity.dispatch(this, threshold);
				this.overlap = null;
				if(this.overlap !== this.index){
					this.overlapped.dispatch(this);
				}
			}
		}
		if(this.thresholdHit !== undefined){
			return;
		}
		var overlap = Math.floor(this.currentRatioY * 5);
		if(overlap === this.index || overlap < 0 || overlap > 4){
			overlap = null;
		}
		if(this.overlap === overlap){
			return;
		}
		this.overlap = overlap;
		if(overlap === null) {
			this.overlapped.dispatch(this);
		} else {
			this.overlapped.dispatch(this, overlap);
		}
	}

	Card.prototype.makeDraggable = function() {
		if(this.options.waitCard !== '+'){
			return;
		}
		this.input.enableDrag(false, true);
	    this.events.onDragStart.add(this.pickUp.bind(this));
	    if(this.options.dragStartCallback){
	    	this.events.onDragStart.add(this.options.dragStartCallback);
	    }
	    if(this.options.dragStopCallback){
	    	this.events.onDragStop.add(this.options.dragStopCallback);
	    }
	};

	Card.prototype.makeShowCardClick = function() {
		if(this.options.waitCard !== '+'){
			return;
		}
		this.events.onInputDown.addOnce(this.appearCard.bind(this));
	};

	Card.prototype.startCard = function() {
		if(!this.options.isNew) {
			this.makeShowCardClick()
		}
		var timeline = new TimelineLite();
		// timeline.to(this.text, this.options.startTime, { alpha: this.options.diffusedAlpha, ease: Bounce.easeOut });
		return timeline;
	}

	Card.prototype.appearCard = function(isOverlap) {
		this.events.onInputDown.removeAll();
		var timeline = new TimelineLite();
		timeline.add(function(){
			Audio.instance.play('fx', 'card/draw');
		})
		timeline.to(this, this.options.spinTime, { alpha: 1 }, 0);
		timeline.to(this.background, this.options.spinTime, { alpha: 1 }, 0);
		timeline.to(this.text, this.options.spinTime, { angle: 360, ease: Back.easeInOut }, 0);
		timeline.addLabel('spinHalf', this.options.spinTime / 2);
		timeline.to(this.background, this.options.spinTime / 2, { alpha: 1 }, 'spinHalf');
		timeline.to(this.background, this.options.spinTime, { alpha: 1, colorProps: { colorChange: this.options.color } }, 0);
		timeline.to(this.text, this.options.spinTime, { alpha: 1, colorProps: { colorChange: this.options.textColor } }, 0);
		timeline.add(function(){
			this.text.text = this.card;

		}.bind(this), 'spinHalf');
		timeline.add(this.makeDraggable.bind(this));
		timeline.add(function(){
			this.faceup = true;
			this.appeared.dispatch(this);
		}.bind(this));
		return timeline;
	};

	Card.prototype.overlapCard = function(newCard) {
		this.card = newCard;
		this.text.angle = 0;
		var timeline = new TimelineLite();
		timeline.to(this.text, this.options.spinTime, { angle: 360, ease: Back.easeInOut });
		timeline.addLabel('spinHalf', this.options.spinTime / 2);
		timeline.to(this.background, this.options.spinTime / 2, { colorProps: { colorChange: this.options.color } }, 'spinHalf');
		timeline.add(function(){
			this.text.text = this.card;
		}.bind(this), 'spinHalf');
		timeline.to(this.text.scale, this.options.spinTime, { x: 1, y: 1 }, 0);
		return timeline;
	}


	Card.prototype.cancelProximity = function() {
		return TweenLite.to(this.background, this.options.colorTime, { colorProps: { colorChange: this.options.pickUpColor } });
	}

	Card.prototype.setProximity = function(color) {
		return TweenLite.to(this.background, this.options.colorTime, { colorProps: { colorChange: color } });
	};

	Card.prototype.cancelOverlapped = function() {
		var timeline = new TimelineLite();
		timeline.to(this.text.scale, this.options.colorTime, { x: 1, y: 1 });
		timeline.to(this.background, this.options.colorTime, { colorProps: { colorChange: this.options.color } });
		return timeline;
	};

	Card.prototype.setOverlapped = function() {
		var timeline = new TimelineLite();
		// timeline.to(this.text.scale, this.options.colorTime, { x: 2, y: 2 });
		timeline.to(this.background, this.options.colorTime, { colorProps: { colorChange: this.options.overlappedColor } });
		return timeline;
	};

	Card.prototype.cancelOverlapping = function() {
		return TweenLite.to(this, this.options.colorTime, { alpha: this.options.pickUpAlpha });
	}

	Card.prototype.setOverlapping = function() {
		return TweenLite.to(this, this.options.colorTime, { alpha: this.options.overlappingAlpha });
	}

	Card.prototype.cancelOverlapSighted = function() {
		var timeline = new TimelineLite();
		timeline.to(this.overlapOutline, this.options.colorTime, { alpha: 0 });
		return timeline;
	}

	Card.prototype.setOverlapSighted = function() {
		var timeline = new TimelineLite();
		timeline.to(this.overlapOutline, this.options.colorTime, { alpha: 1 });
		return timeline;
	};

	Card.prototype.pickUp = function() {
		this.destroyTweens();
		var timeline = new TimelineLite();
		timeline.to(this.background, this.options.colorTime, { colorProps: { colorChange: this.options.pickUpColor } });
		timeline.to(this, this.options.colorTime, { alpha: this.options.pickUpAlpha }, 0);
		timeline.to(this.text, this.options.colorTime, { colorProps: { colorChange: this.options.pickUpTextColor } });
		return timeline;
	}

	Card.prototype.returnCard = function() {
		this.destroyTweens();
		var timeline = new TimelineLite();
		timeline.to(this.background, this.options.colorTime, { angle: 0, colorProps: { colorChange: this.options.color } });
		timeline.to(this, this.options.returnTime, { x: this.options.x, y: this.options.y, alpha: 1 }, 0);
		timeline.to(this.text, this.options.returnTime, { colorProps: { colorChange: this.options.textColor } }, 0);
		return timeline;
	}

	Card.prototype.placeCardBoard = function() {
		var x;
		if(this.thresholdHit === Card.THRESHOLD_LEFT_BOTTOM || this.thresholdHit === Card.THRESHOLD_LEFT_TOP){
			x = -1000;
		} else {
			x = game.width + 500;
		}
		var timeline = new TimelineLite();
		timeline.to(this, this.options.placeCardTime, { x: x, alpha: 0 });
		// timeline.to(this.background.scale, this.options.placeCardTime, { x: 0, y: 0 }, 0);
		return timeline;
	};

	Card.prototype.placeCardOverlap = function() {
		var index = this.overlap - this.index;
		var y = index * this.options.height * Layout.instance.scaleY;
		var timeline = new TimelineLite();
		timeline.to(this, this.options.placeCardTime, { x: this.options.x, y: y, alpha: 0 });
		return timeline;
	}

	Card.prototype.overlapComplete = function() {
		var timeline = new TimelineLite();
		// timeline.add(function(){
			// this.emitter.x = this.background.world.x + this.background.width * 0.5;
			// this.emitter.y = this.background.world.y + this.background.height * 0.5;;
			// game.world.bringToTop(this.emitter);
			// var minScale = 0.1;
			// var maxScale = 1;
			// this.emitter.setScale(minScale, maxScale, minScale, maxScale, 6000, Phaser.Easing.Quintic.Out);
			// this.emitter.start(true, 1000, null, 10);
		// }.bind(this));
		timeline.to(this.background, this.options.overlapCompleteTime, { colorProps: { colorChange: this.options.textColor } });
		timeline.to(this.background, this.options.overlapCompleteTime, { colorProps: { colorChange: this.options.color } });
		return timeline;
	};

	Card.prototype.reject = function() {
		if(!this.faceup){
			return;
		}
		this.destroyTweens();
		this.alpha = 1;
		this.x = this.options.x;
		this.y = this.options.y;
		this.text.alpha = 1;
		this.text.fill = '#' + this.options.textColor.toString(16);
		this.text.scale.set(1,1);
		this.background.angle = 0;
		this.background.graphicsData[0].fillColor = this.options.color;
		this.overlapOutline.alpha = 0;
	};

	Card.prototype.destroyTweens = function() {
		TweenLite.killTweensOf(this);
		TweenLite.killTweensOf(this.text);
		TweenLite.killTweensOf(this.background);
	};

	Card.prototype.shake = function(isLeft, color) {
		game.world.sendToBack(this);
		var timeline = new TimelineLite();
		var targets = [this.options.x + this.options.shake, this.options.x - this.options.shake];
		timeline.to(this, this.options.shakeTime, { x: targets[isLeft ? 0 : 1], ease: Elastic.easeOut });
		timeline.to(this, this.options.shakeTime, { x: targets[isLeft ? 1 : 0], ease: Elastic.easeOut }, '-=' + this.options.shakeTime * 3 / 4);
		timeline.to(this, this.options.shakeTime, { x: this.options.x, ease: Elastic.easeOut }, '-=' + this.options.shakeTime * 3 / 4);
		var completeTime = timeline.duration();
		timeline.to(this.background, completeTime / 4, { colorProps: { colorChange: color } }, 0);
		timeline.to(this.background, completeTime / 4, { colorProps: { colorChange: this.options.color } }, completeTime / 4);
		timeline.timeScale(1.5);
		return timeline;
	};

	Card.prototype.playWinnerStart = function() {
		var timeline = new TimelineLite();
		timeline.to(this.background, this.options.colorTime, {alpha: 0});
		return timeline;
	}

	Card.prototype.playWinner = function() {
		var timeline = new TimelineLite();
		timeline.to(this.text.scale, this.options.winnerTime / 4, { x: this.options.winnerScale, y: this.options.winnerScale }, 0);
		timeline.to(this.text, this.options.winnerTime / 4, { colorProps: { colorChange: _.random(0x555555, 0xcccccc) } }, 0);
		timeline.addLabel('break', this.options.winnerTime / 4);
		timeline.to(this.text.scale, this.options.winnerTime * 3 / 4, { x: 1, y: 1, ease: Elastic.easeOut }, 'break');
		timeline.to(this.text, this.options.winnerTime * 3 / 4, { colorProps: { colorChange: 0xeeeeee } }, 'break');
		return timeline;
	};

	Card.prototype.unattach = function() {
		this.area.unattach(this.container);
	};

	Card.prototype.enable = function(isEnabled) {
		if(this.options.waitCard !== '+'){
			return;
		}
		this.inputEnabled = isEnabled;
	};

	// Methods
	return Card;
})();





;// colorBox.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.ColorBox = (function(){

	// prototype function
	ColorBox = function (x, y, width, height, color, options) {
		options = $.extend({
			width: width,
			height: height,
			color: color,
			text: '',
			format: {
				font: "24px Arial",
		        fill: "#eeeeee",
		        align: "center"
			},
			anchorX: 1,
			anchorY: 1,
			textColorMode: ColorBox.TEXT_COLOR_MODE_NONE,
		}, options);
		this.options = options;

	    // constructor
	    var rect = new Phaser.Rectangle(width * (options.anchorX - 1), height * (options.anchorY - 1), width, height);
	    Phaser.Sprite.call(this, game, x, y);
	    this.anchor.set(options.anchorX, options.anchorY);

	    // background
	    this.background = new Phaser.Graphics(game);
		this.background.beginFill(options.color)
	    this.background.drawRect(rect.x, rect.y, rect.width, rect.height);
	    this.box = this.background.graphicsData[0];
	    this.addChild(this.background);

	    // text
	    this.text = new Phaser.Text(game, width * 0.5 + rect.x, height * 0.5 + rect.y, options.text, options.format);
	    this.text.anchor.set(0.5);
	    this.addChild(this.text);

	    this.changed = new signals.Signal();
	}

	// Constants
	Object.defineProperty(ColorBox, "TEXT_COLOR_MODE_NONE", { value: 'none' });
	Object.defineProperty(ColorBox, "TEXT_COLOR_MODE_NEGATIVE", { value: 'negative' });

	// Constructors
	ColorBox.prototype = Object.create(Phaser.Sprite.prototype);
	ColorBox.prototype.constructor = ColorBox;

	// Methods
	ColorBox.prototype.setText = function(text) {
		this.text.text = text;
	}

	ColorBox.prototype.setColor = function(color) {
		var rgb = Phaser.Color.getRGB(color);
		var text = [ 'rgb(', rgb.r, ',', rgb.g, ',', rgb.b, ')' ].join('');
		this.backgroundColor(text);
	}

	ColorBox.prototype.backgroundColor = function(color) {
		if(color !== undefined){
			this.color = common.getRgb(color);
			this.box.fillColor = this.color;
			if(this.options.textColorMode === ColorBox.TEXT_COLOR_MODE_NEGATIVE){
				var rbg = Phaser.Color.getRGB(this.color);
				this.text.fill = Phaser.Color.RGBtoString(255 - rbg.r, 255 - rbg.g, 255 - rbg.b, 255, '#');
			}
			this.changed.dispatch(this.color);
		}
		return this.box.fillColor;
	};

	ColorBox.prototype.tweenColor = function(color, time) {
		this.tween = TweenLite.to(this, time, { colorProps: { backgroundColor: color } });
		return this.tween;
	};

	return ColorBox;
})()
;// header.js
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
		        font: "50px Montserrat",
		        align: "center",
		    },
		    textColor: 0xffffff,
		    color: 0xffffff,
		    alpha: 1,
		}, options);
		this.options = options;
		this.options.format.fill = '#' + common.toRgbHex(options.textColor);

	    Phaser.Sprite.call(this, game, 0, 0);

	    game.add.existing(this);

	    this.background = new ColorBox(0, 0, width, height, options.color);
	    this.background.alpha = this.options.alpha;
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
		this.title = game.add.text(0, height * 0.38, options.text, options.format);
		this.title.anchor.set(0.5);
		this.center.addChild(this.title);

		// setting left/right buttons
		this.left = game.add.sprite();
		this.headerArea.attach(this.left, { 
			mode: Layout.PROPORTIONAL_INSIDE,
			alignHorizontal: Layout.ALIGN_LEFT,
			width: 10,
			height: height,
		});

		this.right = game.add.sprite();
		this.headerArea.attach(this.right, { 
			mode: Layout.PROPORTIONAL_INSIDE,
			alignHorizontal: Layout.ALIGN_RIGHT,
			width: 10,
			height: height,
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

	Header.prototype.addCenter = function(items, options) {
		options = _.extend({
			marginLeft: 10,
			marginRight: 10,
			marginTop: 10,
			marginDown: 10,
		}, options);
		this.center.addChild(items);
	};

	Header.prototype.addLeft = function(items, options) {
		options = _.extend({
			marginLeft: 10,
			marginRight: 10,
			marginTop: 10,
			marginDown: 10,
		}, options);
		this.left.addChild(items);
	};

	Header.prototype.addRight = function(items, options) {
		options = _.extend({
			marginLeft: 10,
			marginRight: 10,
			marginTop: 10,
			marginDown: 10,
		}, options);
		this.right.addChild(items);
	}

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







;// incoming.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Incoming = (function(){

	function Incoming(x, y, options){
		options = _.extend({
		}, options);
		options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);

		this.timelines = [];
	}

	// Constructors
	Incoming.prototype = Object.create(Phaser.Sprite.prototype);
	Incoming.prototype.constructor = Incoming;

	// private methods

	function complete(options, wrapper, timeline){
		this.timelines.splice(this.timelines.indexOf(timeline), 1);
		timeline.kill();
		wrapper.destroy();
		if(options.complete){
			options.complete();
		}
	}

	function stopComplete(){
		this.destroy();
	}

	// public methods

	Incoming.prototype.makeTexts = function(texts, format) {
		return _.map(texts, function(item){
			var text = new Phaser.Text(game, 0, 0, item.text, format);
	    	text.anchor.set(0.5);
	    	text.anchor.set(0.5);
	    	text.scale.set(0);
	    	text.sound = item.sound;

	    	if(item.angle){
				text.angle = item.angle;
	    	}
	    	return text;
		}.bind(this))
	}

	Incoming.prototype.stop = function() {
		_.each(this.timelines, function(timeline){
			timeline.kill();
		});
		var timeline = new TimelineLite({ onComplete: stopComplete, onCompleteScope: this });
		timeline.to(this, 1, { alpha: 0 });
		return timeline;
	};

	Incoming.prototype.show = function(items, options) {
		options = _.extend({
			format: {
				font: "200px Montserrat",
		        fill: "#111111",
		        align: "center"
			},
			isTexts: false,

			size: 150,
			delay: 0,
			textAngleTime: 1,
			textAngleDelay: 0.4,
			itemInTime: 1.5,
			itemOutTime: 1,
			inTime: 1,
			outTime: 1.5,
			delayBetween: 1,
			timeScale: 1,
		}, options);
		// Effect Options
		options.effectOptions = _.extend({

		}, options.effectOptions);
		// Effect Animation Options
		options.effectAnimationOptions = _.extend({

		}, options.effectAnimationOptions);

		if(options.isTexts){
			items = this.makeTexts(items, options.format);
		}

		var wrapper = game.add.sprite();
		this.addChild(wrapper);

		var incomingEffect = new com.speez.components.IncomingEffect(options.effectOptions);
		wrapper.addChild(incomingEffect);

    	var timeline = new TimelineMax({ onComplete: complete, onCompleteScope: this });
    	timeline.vars.onCompleteParams = [ options, wrapper, timeline ];

    	for (var i = 0; i < items.length; i++) {
    		var item = items[i];

    		var blank = game.add.graphics();
			blank.beginFill(0xffffff);
	    	// blank.scale.set(0);
			blank.drawCircle(0, 0, options.size);

	    	var center = game.add.sprite();
	    	center.addChild(blank);
	    	center.addChild(item);
	    	center.scale.set(0);
			wrapper.addChild(center);

			var centerTimeline = new TimelineMax();
			// angle
	    	centerTimeline.to(item, options.textAngleTime, { angle: 0, ease: Sine.easeOut }, options.textAngleDelay);
	    	// item
	    	centerTimeline.to(item.scale, options.itemInTime, { x: 1, y: 1, ease: Sine.easeOut }, 0);
	    	centerTimeline.addLabel('itemShrink');
	    	centerTimeline.to(item.scale, options.itemOutTime, { x: 0, y: 0, ease: Sine.easeIn }, 'itemShrink');
	    	// white
	    	centerTimeline.to(center.scale, options.inTime, { x: 1, y: 1, ease: Sine.easeOut }, 0);
	    	centerTimeline.addLabel('shrink', options.inTime);
	    	centerTimeline.to(center.scale, options.outTime, { x: 0, y: 0, ease: Sine.easeIn }, 'shrink');
	    	
	    	timeline.addLabel('time' + i, '+=' + (i === 0 ? 0 : options.delayBetween));
	    	timeline.add(centerTimeline, 'time' + i);
    		timeline.add(incomingEffect.animate(options.effectAnimationOptions), 'time' + i);
    	};
    	timeline.timeScale(options.timeScale);
    	this.timeline = timeline;
    	this.timelines.push(timeline);
    	return timeline;
	};

	return Incoming;
})();



















;// IncomingEffect.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.IncomingEffect = (function(){

	function IncomingEffect(options){
		options = _.extend({
			size: 150,
			color: 0x007bff,
			inTime: 1,
			outTime: 1,
			count: 4,
			blurRadius: 175,
			backRadius: 350,
			blurColor: 0x4400ff,
			name: 'effect',
		}, options);
		this.options = options;
	    
	    Phaser.Sprite.call(this, game, 0, 0);

		BoardFactory.instance.create({
			color: this.options.color,
			name: this.options.name,
			blurRadius: this.options.blurRadius,
			backRadius: this.options.backRadius,
			blurColor: this.options.blurColor,
		});

    	this.circles = [];
    	this.circlesScales = [];
    	for (var i = 0; i < this.options.count; i++) {
    		// create circle
    		var circle = game.add.sprite(0, 0, BoardFactory.instance.get(this.options.name, BoardFactory.TYPE_BACK));
	    	circle.anchor.set(0.5);
	    	circle.scale.set(0);
    		this.addChild(circle);
	    	
	    	// add circle to data
	    	this.circles[i] = circle;
	    	this.circlesScales[i] = circle.scale;
    	};

    	this.events.onDestroy.add(onDestroy, this);
	}

	// Constructors
	IncomingEffect.prototype = Object.create(Phaser.Sprite.prototype);
	IncomingEffect.prototype.constructor = IncomingEffect;

	// private methods

	function onDestroy(){
		BoardFactory.instance.remove(this.options.name);
	}

	// public methods

	IncomingEffect.prototype.animate = function(options) {
		options = _.extend({
			scales: [ 1, 0.75, 0.55, 0.4 ],
			inTimes: [ 1, 1.4, 1.5, 1.45 ],
			outTimes: [ 1, 0.5, 0.5, 0.5 ],
			delays: [ 0.4, 0.4, 0.4, 0.4 ],
		}, options);

		var timeline = new TimelineMax({  });
		for (var i = 0; i < this.circles.length; i++) {
			var circle = this.circles[i];
	    	timeline.fromTo(circle.scale, options.inTimes[i], 
	    		{ x: 0, y: 0 },
	    		{ delay: options.delays[i], x: options.scales[i], y: options.scales[i], ease: Sine.easeOut }, 0);
	    	timeline.to(circle.scale, options.outTimes[i], { x: 0, y: 0, ease: Sine.easeIn }, options.inTimes[i] + options.delays[i]);
		};
		return timeline;
	};

	return IncomingEffect;
})();






;// Logo.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Logo = (function(){

	Logo = function (x, y, width, height, options) {
		options = $.extend({
			logo: 'bblogo',
			scale: 0.7,
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
















;// menuButton.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.MenuButton = (function(){

	MenuButton = function (x, y, width, height, options) {
		options = $.extend({
			format: {
		        font: "24px Arial",
		        fill: "#000000",
		        align: "center"
		    },
		    textColor: 0x000000,
		    color: 0xe1e1e1,
		    textColorOver: 0xe1e1e1,
		    colorOver: 0x000000,
		    textColorDown: 0x000000,
		    colorDown: 0xffffff,
		    isOnce: false,
		    radius: 0,
		    borderColor: 0x000000,
		    borderWidth: 0,
		    colorTime: 0.2,
		    text: '',
		}, options);
		this.options = options;
		this.options.format.fill = '#' + common.toRgbHex(this.options.textColor);

		var solid = new Phaser.Graphics(game);
		// solid.beginFill(0xff00ff);
		solid.drawRect(0, 0, width, height);
	    Phaser.Sprite.call(this, game, x, y, solid.generateTexture());
	    this.anchor.set(0.5);

	    // Adding background
	    this.background = new Phaser.Graphics(game, -width / 2, -height / 2);
	    this.background.beginFill(this.options.color);
	    this.background.lineWidth = this.options.borderWidth;
	    this.background.lineColor = this.options.borderColor;
	    this.background.drawRoundedRect(0, 0, width, height, this.options.radius);
	    this.background.colorChange = common.graphicsColorChange(0);
	    this.addChild(this.background);

	    // text
	    this.text = new Phaser.Text(game, 0, 0, this.options.text, this.options.format);
	    this.text.anchor.set(0.5);
	    this.text.colorChange = common.textColorChange();
	    this.addChild(this.text);

	    // Events
	    this.inputEnabled = true;
	    this.events.onInputOut.add(onInputOut, this);
	    this.events.onInputOver.add(onInputOver, this);
	    this.events.onInputDown.add(onInputDown, this);
	    this.events.onInputUp.add(onInputUp, this);
	    if(options.isOnce) {
	    	this.events.onInputUp.addOnce(click, this);
	    }
	    else{
	    	this.events.onInputUp.add(click, this);
	    }

	    this.enable = true;

	    this.events.onDestroy.add(onDestroy, this);
	}

	// Constructors
	MenuButton.prototype = Object.create(Phaser.Sprite.prototype);
	MenuButton.prototype.constructor = MenuButton;

	// private methods

	function onInputOut(){
		if(!this.enable){
			return;
		}
		this.tweenColor(this.options.color, this.options.textColor);
	}

	function onInputOver(){
		if(!this.enable){
			return;
		}
		this.tweenColor(this.options.colorOver, this.options.textColorOver);
	}

	function onInputDown(){
		if(!this.enable){
			return;
		}
		this.tweenColor(this.options.colorDown, this.options.textDownColor);
	}

	function onInputUp(){
		if(!this.enable){
			return;
		}
		this.tweenColor(this.options.color, this.options.textColor);
	}

	function onDestroy(){
		TweenMax.killTweensOf(this.background);
		TweenMax.killTweensOf(this.text);
	}

	function click(){
		if(!this.enable){
			return;
		}
		if(this.options.callback){
			this.options.callback.call(this);
		}
	}

	// public methods

	MenuButton.prototype.setColor = function(color) {
		this.background.change({color: color});
	}

	MenuButton.prototype.setText = function(text) {
		this.text.text = text;
	};

	MenuButton.prototype.tweenColor = function(color, textColor) {
		var timeline = new TimelineMax();
		timeline.to(this.background, this.options.colorTime, { colorProps: { colorChange: color } });
		timeline.to(this.text, this.options.colorTime, { colorProps: { colorChange: textColor } }, 0)
		return timeline;
	};

	MenuButton.prototype.setEnable = function(enable) {
		this.enable = enable;
	};

})();
















;// ParticleFactory.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.ParticleFactory = (function(){

	function ParticleFactory(){
		this.classes = [];
		ParticleFactory.instance = this;
	}

	ParticleFactory.prototype.create = function(options) {
		options = _.extend({
			size: 24,
			color: 0xff0000,
			name: 'rectangleParticles',
			makeFunction: this.defaultMakeParticles,
		}, options);

		options.makeFunction(options);

		if(this.classes[name]){
			return this.classes[name];
		}

		var ParticleClass = function(game, x, y){
	    	Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData(options.name));
	    }
		ParticleClass.prototype = Object.create(Phaser.Particle.prototype);
	    ParticleClass.prototype.constructor = ParticleClass;

	    return ParticleClass;
	};

	ParticleFactory.prototype.defaultMakeParticles = function(options) {
		var bmd = game.add.bitmapData(options.size, options.size);
	    bmd.context.fillStyle = common.toRgb(options.color);
	    bmd.context.fillRect(0, 0, options.size, options.size);
	    game.cache.addBitmapData(options.name, bmd);
	};


    return ParticleFactory;
})();
new com.speez.components.ParticleFactory();
var ParticleFactory = com.speez.components.ParticleFactory;;// PauseScreen.js

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






;// playerBoard.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerBoard = (function(){

	function PlayerBoard(x, y, width, height, color, options){
		options = _.extend({
			radius: width,
			gap: 30,
			color: color,
			arrowTime: 0.5,
			diffuseAlpha: 0.3,
			onAlpha: 1,
			halfAlpha: 0.6,
			proximityTime: 0.2,
			appearTime: 1,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);

		this.isLeft = x === 0;

		// Background
		this.background = game.add.graphics();
		this.background.x = this.isLeft ? -(options.radius + options.gap)*2 : (options.radius + options.gap)*2;
		this.background.y = height / 2;
		this.background.beginFill(this.options.color);
		this.background.fillAlpha = options.diffuseAlpha;
		this.background.drawCircle(0, 0, options.radius);
		// this.background.drawEllipse(0, 0, width, height*0.43);
		this.background.circle = this.background.graphicsData[0];
		this.addChild(this.background);

		this.backgroundOutline = new Phaser.Graphics(game);
		this.backgroundOutline.lineStyle(5, this.options.color, 1, [10]);
		// this.backgroundOutline.drawEllipse(0, 0, width, height*0.43);
		this.backgroundOutline.drawCircle(0, 0, options.radius);
		this.backgroundOutline.angle = this.isLeft ? 180 : 0;
		this.backgroundOutline.cacheAsBitmap = true;
		this.backgroundOutline = game.add.sprite(this.background.x, height / 2, this.backgroundOutline.generateTexture());
		this.backgroundOutline.anchor.set(0.5);
		this.addChild(this.backgroundOutline);

		this.text = new Phaser.Text(game, width * 0.5, height * 0.5, '', {
			font: "75px FontAwesome",
	        align: "center",
	        fill: '#' + common.toRgbHex(options.color),
		});
	    this.text.anchor.set(0.5, 0.5);
	    this.text.colorChange = common.textColorChange();
		this.text.visible = false;
		this.text.text = this.isLeft ? '\uf060' : '\uf061';
	    this.addChild(this.text);

		this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });
		this.area.attach(this, {
			mode: Layout.PROPORTIONAL_INSIDE,
			width: width,
			height: height,
			alignHorizontal: this.isLeft ? Layout.ALIGN_LEFT : Layout.ALIGN_RIGHT,
		});


		this.effectOptions = {
			count: 3,
			backRadius: options.radius * 1,
			blurRadius: 50,
		};
		this.animationOptions = {
			delays: [ 0, 0, 0 ],
			inTimes: [ 0.4, 0.5, 0.6 ],
			outTimes: [ 0.6, 0.5, 0.4 ],
			scales: [ 1, 0.8, 0.6 ],
		};
	}

	// Constructors
	PlayerBoard.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerBoard.prototype.constructor = PlayerBoard;

	// private methods

	function animateArrow(){
		var start = this.options.radius * 0.5 + (this.isLeft ? -5 : 5)
		this.arrowTimeline = new TimelineMax({ repeat: -1 });
		this.arrowTimeline.fromTo(this.text, this.options.arrowTime, 
			{ x: start },
			{ x: this.options.radius * 0.5 + (this.isLeft ? -20 : 20), ease: Back.easeOut });
		this.arrowTimeline.to(this.text, this.options.arrowTime, { x: start, ease: Back.easeOut });
	}

	// public methods

	PlayerBoard.prototype.destroyTween = function() {
		if(this.timeline){
			this.timeline.kill();
		}
	};

	PlayerBoard.prototype.setArrow = function() {
		this.text.visible = true;
	};

	PlayerBoard.prototype.cancelArrow = function() {
		this.text.visible = false;
	};

	PlayerBoard.prototype.setCard = function() {
		return TweenLite.to(this.background.circle, this.options.proximityTime, { fillAlpha: 1 }, 0)
	};

	PlayerBoard.prototype.cancelCard = function() {
		return TweenLite.to(this.background.circle, this.options.proximityTime, { fillAlpha: this.options.diffuseAlpha }, 0)
	};

	PlayerBoard.prototype.setCardSuccess = function() {
		var incomingEffect = new com.speez.components.IncomingEffect(_.extend({
			color: this.options.color,
			name: 'board' + this.options.color.toString(16),
			blurColor: common.addHsl(this.options.color, 0.1),
		}, this.effectOptions));
		incomingEffect.x = this.background.x;
		incomingEffect.y = this.background.y;
		this.addChildAt(incomingEffect, 0);

		var timeline = incomingEffect.animate(this.animationOptions);
		timeline.timeScale(2.2);
		return timeline;
	};

	PlayerBoard.prototype.setProximity = function(isProximity) {
		if(!isProximity){
			return;
		}
		return TweenLite.to(this.background.circle, this.options.proximityTime, { fillAlpha: this.options.halfAlpha }, 0)
	};

	PlayerBoard.prototype.cancelProximity = function() {
		return TweenLite.to(this.background.circle, this.options.proximityTime, { fillAlpha: this.options.diffuseAlpha }, 0)
	};

	PlayerBoard.prototype.appear = function() {
		var timeline = new TimelineLite();
		timeline.fromTo([this.background, this.backgroundOutline ], this.options.appearTime, 
			{ x: this.isLeft ? -(this.options.radius + this.options.gap)*2 : (this.options.radius + this.options.gap)*2 },
			{ x: this.isLeft ? -(this.options.gap) : (this.options.radius + this.options.gap), ease: Sine.easeOut }
		);
		timeline.add(animateArrow.bind(this));
		return timeline;
	};

	PlayerBoard.prototype.disappear = function() {
		var timeline = new TimelineLite();
		timeline.fromTo([this.background, this.backgroundOutline ], this.options.appearTime, 
			{ x: this.isLeft ? -(this.options.gap) : (this.options.radius + this.options.gap) },
			{ x: this.isLeft ? -(this.options.radius + this.options.gap)*2 : (this.options.radius + this.options.gap)*2, ease: Sine.easeIn }
		);
		timeline.to(this, this.options.appearTime, {alpha: 0}, 0);
		return timeline;
	};

	PlayerBoard.prototype.postUpdate = function() {
		this.backgroundOutline.angle += 0.2;
	};

	return PlayerBoard;
})();









;// PlayerCardBar.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerCardBar = (function(){

	function PlayerCardBar(x, y, width, height, options){
		options = _.extend({
			format: {
				font: "75px FontAwesome",
		        align: "center",
		        fill: '#fefefe',
			},
			color: 0x000000,
			colorForeground: 0xfefefe,
			lastOneTime: 0.2,
			lastFiveTime: 0.5,
			colorLastOne: 0xbb3333,
			colorLastFive: 0x33bb33,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);

		// Background
		this.foreground = game.add.graphics();
		this.foreground.beginFill(this.options.colorForeground);
		this.foreground.drawRect(0, 0, width, height);
		this.foreground.rect = this.foreground.graphicsData[0];
	    this.foreground.colorChange = common.graphicsColorChange(0);
		
		this.foregroundSprite = game.add.sprite();
		this.foregroundSprite.addChild(this.foreground);
		this.addChild(this.foregroundSprite);

		this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });
		this.area.attach(this.foregroundSprite, {
			mode: Layout.STRETCH,
			width: width,
			height: height,
		});

		this.flashLastTimeline = new TimelineMax({ paused: true, repeat: -1, yoyo: true });
		this.flashLastTimeline.to(this.foreground, this.options.lastOneTime, { alpha: 0 });

		this.flashLastFiveTimeline = new TimelineMax({ paused: true, repeat: -1, yoyo: true });
		this.flashLastFiveTimeline.to(this.foreground, this.options.lastFiveTime, { alpha: 0 });

		this.events.onDestroy.add(this.onDestroy.bind(this));
	}

	// Constructors
	PlayerCardBar.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerCardBar.prototype.constructor = PlayerCardBar;

	// private methods


	// public methods

	PlayerCardBar.prototype.setProgress = function(progress) {
		this.foreground.scale.set(progress, 1);
	};

	PlayerCardBar.prototype.flash = function(last) {
		this.alpha = 1;
		this.flashLastTimeline.stop();
		this.flashLastFiveTimeline.stop();
		if(last === 1){
			this.flashLastTimeline.play();
		} else if(last === 5){
			this.flashLastFiveTimeline.play();
		}
	};

	PlayerCardBar.prototype.onDestroy = function() {
		this.flashLastTimeline.kill();
		this.flashLastFiveTimeline.kill();
	};

	return PlayerCardBar;
})();









;// PlayerFullScreen.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerFullScreen = (function(){

	function PlayerFullScreen(x, y, width, height, options){
		options = _.extend({
			gapY: 50,
			textGapY: 0,
			textGapX: 100,
			symbolGapY: 250,
			width: width,
			height: height,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);

		// Background
		this.background = game.add.graphics();
		this.background.drawRect(0, 0, width, height);
		this.background.rect = this.background.graphicsData[0];
		this.addChild(this.background);

		this.container = game.add.sprite();
		this.addChild(this.container);

		this.textContainer = game.add.sprite();
		this.textContainer.x = 0;
		this.textContainer.y = this.options.gapY;
		this.container.addChild(this.textContainer);

		this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });
		this.area.attach(this.background, {
			mode: Layout.STRETCH,
			width: width,
			height: height,
		});

		this.area.attach(this.container, {
			width: width,
			height: height,
		});

		this.events.onDestroy.add(this.onDestroy.bind(this));
	}

	// Constructors
	PlayerFullScreen.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerFullScreen.prototype.constructor = PlayerFullScreen;

	// private methods

	function writeText(texts, symbol) {
		this.texts = [];
		var height = 0;
		_.each(texts, function(data){
			var text = new Phaser.Text(game, this.options.textGapX, height, data.text, {
				font: "125px arial",
		        align: "right",
		        fill: '#' + common.toRgbHex(data.color),
			});
			text.anchor.set(0, 0);
			height += text.height + this.options.textGapY;
			this.textContainer.addChild(text);
		}.bind(this));
		height += this.options.symbolGapY;
		this.symbol = new Phaser.Text(game, this.options.width / 2, height, symbol.text, {
			font: "350px FontAwesome",
	        align: "center",
	        fill: '#' + common.toRgbHex(symbol.color),
		});
		this.symbol.anchor.set(0.5);
		this.textContainer.addChild(this.symbol);
	}

	function onShowStart(){
		game.world.bringToTop(this);
	}

	// public methods

	PlayerFullScreen.prototype.show = function(texts, symbol, options) {
		options = _.extend({
			color: 0xff0000,
			fadeInTime: 0.2,
			fadeOutTime: 0.2,
			delayTime: 3,
			alpha: 0.8,
		}, options);
		this.background.rect.fillColor = options.color;
		this.background.alpha = 0;
		this.textContainer.alpha = 0;
		writeText.bind(this)(texts, symbol);

		if(this.timelineShow){
			this.timelineShow.kill();
		}
		
		this.timelineShow = new TimelineMax({ onStart: onShowStart.bind(this), onComplete: this.onDestroy.bind(this) });
		this.timelineShow.to(this.background, options.fadeInTime, { alpha: options.alpha });
		this.timelineShow.to(this.textContainer, options.fadeInTime, { alpha: options.alpha }, 0);
		this.timelineShow.addLabel('delay', '+=' + options.delayTime);
		if(options.complete){
			this.timelineShow.add(options.complete, 'delay');
		}
		this.timelineShow.to([this.background, this.textContainer], options.fadeOutTime, { alpha: 0 }, 'delay');
		return this.timelineShow;

		game.world.bringToTop(this);
	};

	PlayerFullScreen.prototype.onDestroy = function() {
		if(this.timelineShow){
			this.timelineShow.kill();
		}
	};

	return PlayerFullScreen;
})();









;// playerIcon.js
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




;// rain.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Rain = (function(){

	function Rain(options){
		options = _.extend({
			minX: 0,
			maxX: 100,
			frequencyMin: 0.01,
			frequencyMax: 0.1,
			angleMin: -1,
			angleMax: 1,
			widthMin: 5,
			widthMax: 10,
			heightMin: 50,
			heightMax: 200,
			color: 0xc6c6c6,
			targetY: 1000,
			speedMin: 0.6,
			speedMax: 0.6,
		}, options);
		this.options = options;
	    
	    Phaser.Sprite.call(this, game, 0, 0);
    	
    	this.counted = 0;

    	this.random = new Phaser.RandomDataGenerator();
	}

	// Constructors
	Rain.prototype = Object.create(Phaser.Sprite.prototype);
	Rain.prototype.constructor = Rain;

	// private methods

	function rainComplete(rain){
		rain.destroy();
	}

	function create(options){
		var background = new Phaser.Graphics(game);
		background.beginFill(options.color);
		background.drawRect(0, 0, options.width, options.height);

		var rain = new Phaser.Sprite(game, options.x, options.y, background.generateTexture());
		rain.angle = options.angle;
		rain.anchor.set(0.5);

		var timeline = new TimelineMax({ onComplete: rainComplete, onCompleteScope: this, onCompleteParams: [rain] });
		timeline.to(rain, options.speed, { y: options.targetY, ease: Linear.easeNone });
		rain.timeline = timeline;

		this.addChild(rain);

		return rain;
	}

	// public methods

	Rain.prototype.activate = function() {
	    this.active = true;
	};

	Rain.prototype.postUpdate = function() {
		if(!this.active){
			return;
		}

		this.counted -= game.time.elapsed * 0.001;
		if(this.counted > 0){
			return;
		}
		this.counted = this.random.realInRange(this.options.frequencyMin, this.options.frequencyMax);
		create.call(this, {
			color: this.options.color,
			x: _.random(this.options.minX, this.options.maxX),
			y: this.options.y,
			angle: _.random(this.options.angleMin, this.options.angleMax),
			width: _.random(this.options.widthMin, this.options.widthMax),
			height: _.random(this.options.heightMin, this.options.heightMax),
			targetY: this.options.targetY,
			speed: this.random.realInRange(this.options.speedMin, this.options.speedMax),
		});
	};

	return Rain;
})();






;// stageBoard.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.StageBoard = (function(){

	function StageBoard(x, y, options){
		options = _.extend({
			x: x,
			y: y,
			radius: 300,
			color: 0x00f00f,
			diffuseColor: 0x000000,
			backgroundAlpha: 0.3,
			card: 1,
			cardFormat: {
				font: "120px Montserrat",
		        fill: "#ffffff",
		        align: "center"
			},
			startTime: 1,
			setCardTime: 0.4,
			rotateSpeed: -0.2,
			countingTime: 10,
			expandTime: 1,
			disappearTime: 1,
			isLeft: false,
		}, options);
		this.options = options;
		this.card = options.card;
		
		Phaser.Sprite.call(this, game, x, -500);
		game.add.existing(this);

		this.rotateSpeed = options.rotateSpeed / options.radius;

		// Background
		this.background = game.add.graphics();
		this.background.alpha = this.options.backgroundAlpha;
		this.background.beginFill(this.options.color);
		this.background.drawCircle(0,0, this.options.radius);
		this.background.circle = this.background.graphicsData[0];
		this.background.colorChange = common.graphicsColorChange(0);
		this.addChild(this.background);

		this.foreground = game.add.graphics();
		this.foreground.lineStyle(5, this.options.color, 1, [10]);
		this.foreground.colorLineChange = common.graphicsColorChange(0, 'lineColor');
		this.foreground.drawCircle(0,0, this.options.radius);
		this.addChild(this.foreground);

		this.backgroundMask = game.add.graphics();
		this.backgroundMask.drawCircle(0,0, this.options.radius);
		this.backgroundMask.circle = this.backgroundMask.graphicsData[0];
		this.addChild(this.backgroundMask);

		// incoming effect
		this.effectOptions = {
			count: 3,
			backRadius: options.radius * 1.9,
			blurRadius: 52,
		}
		this.animationOptions = {
			delays: [ 0, 0, 0 ],
			inTimes: [ 0.4, 0.5, 0.6 ],
			outTimes: [ 0.6, 0.5, 0.4 ],
			scales: [ 1, 0.9, 0.8 ],
		}

		// card
		createText.call(this);

	    this.circleScales = [this.text.mask.scale, this.background.scale, this.foreground.scale];
	    this.text.visible = false;

	    this.appeared = new signals.Signal();
	    this.counted = new signals.Signal();
	    this.expanded = new signals.Signal();

	    this.events.onDestroy.add(this.destroyTween, this);
	}

	// Constructors
	StageBoard.prototype = Object.create(Phaser.Sprite.prototype);
	StageBoard.prototype.constructor = StageBoard;

	// private methods

	function createText(){
		this.text = new Phaser.Text(game, 0, 0, this.card.toString(), this.options.cardFormat);
	    this.text.anchor.set(0.5);
	    this.text.mask = this.backgroundMask;
	    this.addChild(this.text);
	}

	function onAppearStart(){
		this.text.visible = true;
	}

	function onAppearComplete(){
		this.destroyTween();
		this.appeared.dispatch();
	}

	function onSetCardPartComplete(oldCard){
		// if(oldCard){
		// 	oldCard.destroy();
		// }
	}

	function onSetCardComplete(incomingEffect){
		if(incomingEffect){
			incomingEffect.destroy();
		}
	}

	// public methods

	StageBoard.prototype.destroyTween = function() {
		if(this.timeline){
			this.timeline.kill();
		}
	};

	StageBoard.prototype.appear = function() {
		var timeline = new TimelineLite({ onStart: onAppearStart.bind(this), onComplete: onAppearComplete, onCompleteScope: this });
		timeline.to(this, this.options.startTime, { y: this.options.y, ease: Power4.easeOut });

		return timeline;
	};

	StageBoard.prototype.disappear = function() {
		var timeline = new TimelineMax();
		timeline.to(this, this.options.disappearTime, { y: 1000, ease: Power4.easeIn });
		return timeline;
	};

	StageBoard.prototype.setCard = function(card, name, isAnimate) {

		var oldCard = this.text;
		this.card = card;
		createText.call(this);

		if(!isAnimate){
			onSetCardPartComplete.call(this, oldCard);
			return;
		}

		// var incomingEffect = new com.speez.components.IncomingEffect(_.extend({
		// 	color: this.options.color,
		// 	name: 'board' + this.options.color.toString(16),
		// 	blurColor: common.addHsl(this.options.color, 0.1),
		// }, this.effectOptions));
		// this.addChildAt(incomingEffect, 0);

		var currentCard = parseInt(oldCard.text);
		var newCard = parseInt(card)
		var direction = currentCard > newCard ? 1 : -1;
		if((currentCard === 9 && newCard === 0) || (currentCard === 0 && newCard === 9)){
			direction *= -1;
		}
		var targetY = this.options.radius + this.text.height;
		this.text.y = targetY * direction;

		var timeline = new TimelineLite({ onComplete: onSetCardComplete, onCompleteScope: this, onCompleteParams: [] });
		timeline.to(oldCard, this.options.setCardTime, { onComplete: onSetCardPartComplete, onCompleteScope: this, onCompleteParams: [oldCard], y: -targetY * direction, ease: Linear.noEase }, 0);
		timeline.to(this.text, this.options.setCardTime, { y: 0, ease: Linear.noEase }, 0);

		timeline.to(this.background, this.options.setCardTime, { alpha: 1, ease: Sine.easeOut }, 0);
		// timeline.add(incomingEffect.animate(this.animationOptions), this.options.setCardTime + '-=' + 0.5);
		timeline.to(this.background, this.options.setCardTime, { alpha: this.options.backgroundAlpha, ease: Sine.easeIn }, this.options.setCardTime);

		timeline.to(this.circleScales, this.options.setCardTime, { x: 1.4, y: 1.4, ease: Sine.easeOut }, 0);
		timeline.to(this.circleScales, this.options.setCardTime, { x: 1, y: 1, ease: Sine.easeIn }, this.options.setCardTime);

		return timeline;
	};

	StageBoard.prototype.postUpdate = function() {
		this.foreground.angle += this.rotateSpeed;
	};

	return StageBoard;
})();









;// StagePlayer.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.StagePlayer = (function(){

	StagePlayer = function (x, y, options) {
		options = $.extend({
			x: x,
			y: y,
			disappearY: 1000,
			nameFormat: {
		        font: "30px Montserrat",
		        align: "center"
		    },
		    pointsFormat: {
		    	font: "30px Montserrat",
		        align: "center",
		    },
		    color: 0xfefefe,
		    offColor: 0x010101,
		    name: 'Angry Llama',
		    points: '0',

		    colorTime: 0.5,

		    colorFadeInTime: 0.5,
		    colorFadeOutTime: 0.5,
		    colorDelayTime: 2,

		    addPointsDelayTime: 2,
		    addPointsTime: 0.5,

		    appearTime: 0.5,
		    disappearTime: 0.5,

		    lineWidth: 100,
		    lineHeight: 4,
		}, options);
		this.options = options;
		options.nameFormat.fill = '#' + common.toRgbHex(options.color);
		options.pointsFormat.fill = '#' + common.toRgbHex(options.color);

		this.points = options.points;

	    Phaser.Sprite.call(this, game, x, this.options.disappearY);

	    var lineY = 40;
	    var radius = 50;
	    this.background = new Phaser.Graphics(game, 0, lineY);
	    this.background.beginFill(this.options.offColor);
	    this.background.drawRoundedRect(-this.options.lineWidth, -this.options.lineHeight, this.options.lineWidth * 2, this.options.lineHeight * 2, radius);
	    this.addChild(this.background);

	    this.foreground = new Phaser.Graphics(game, 0, lineY);
	    this.foreground.beginFill(this.options.color);
	    this.foreground.drawRoundedRect(-this.options.lineWidth, -this.options.lineHeight, this.options.lineWidth * 2, this.options.lineHeight * 2, radius);
	    this.foreground.colorChange = common.graphicsColorChange(0);
	    this.addChild(this.foreground);

	    this.text = new Phaser.Text(game, 0, 0, options.name, this.options.nameFormat);
	    this.text.colorChange = common.textColorChange();
	    this.text.anchor.set(0.5);
	    this.addChild(this.text);

	    this.textPoints = new Phaser.Text(game, 0, 80, this.options.points, this.options.pointsFormat);
	    this.textPoints.anchor.set(0.5);
	    this.textPoints.colorChange = common.textColorChange();
	    this.addChild(this.textPoints);

	    this.events.onDestroy.add(onDestroy, this);
	    this.currentColor = this.options.color;
	    this.alpha = 0;
	}

	// Constructors
	StagePlayer.prototype = Object.create(Phaser.Sprite.prototype);
	StagePlayer.prototype.constructor = StagePlayer;

	// private methods

	function pointsUpdate(){
		this.textAddPoints.text = "+ " + Math.ceil(this.currentAdd);
		this.textPoints.text = Math.ceil(this.points);
	}

	function pointsComplete(text){
		text.destroy();
		// this.addPointsTimeline.kill();
	}

	function colorComplete(){
		this.currentColor = this.options.color;
		this.colorTween.kill();
	}

	function onDestroy(){
		TweenMax.killTweensOf(this);
		TweenMax.killTweensOf(this.textPoints);
		TweenMax.killTweensOf(this.text);
		if(this.flashTimeline){
			this.flashTimeline.kill();
		}
	}

	// public Methods

	StagePlayer.prototype.appear = function() {
		var timeline = new TimelineMax();
		timeline.to(this, this.options.appearTime, { y: this.options.y, ease: Power4.easeOut });
		return timeline;
	};

	StagePlayer.prototype.disappear = function() {
		var timeline = new TimelineMax();
		timeline.to(this, this.options.disappearTime, { y: this.options.disappearY, ease: Power4.easeIn });
		return timeline;
	};

	StagePlayer.prototype.removePlayer = function() {
	}

	StagePlayer.prototype.setPlayer = function(name, points, isAnimate) {
		if(!isAnimate){
			this.alpha = 1;
			this.text.text = name;
			this.textPoints.text = points;
			return;
		}
	}

	StagePlayer.prototype.setColor = function(color) {
		if(this.colorTween){
			this.colorTween.kill();
		}
		this.currentColor = color;
		this.colorTween = new TimelineMax({ onComplete: colorComplete, onCompleteScope: this });
		this.colorTween.to([ this.textPoints, this.text, this.textAddPoints ], this.options.colorTime, { colorProps: { colorChange: color } })
	    this.colorTween.addLabel('fadeOut', '+=' + this.options.colorDelayTime);
		this.colorTween.to([ this.textPoints, this.text, this.textAddPoints ], this.options.colorTime, { colorProps: { colorChange: this.options.color } }, 'fadeOut')
		return this.colorTween;
	};

	StagePlayer.prototype.addPoints = function(add, total) {
		if(this.addPointsTimeline && this.addPointsTimeline.getLabelBefore() !== 'fadeOut'){
			this.targetAdd += add;
	    	this.addPointsTimeline.to(this, this.options.addPointsTime, { points: total, currentAdd: this.targetAdd, onUpdate: pointsUpdate, onUpdateScope: this }, 'fadeInEnd');
			this.addPointsTimeline.seek('fadeInEnd');
			return;
		}
		
		this.targetAdd = add;
		this.currentAdd = this.targetAdd;
		var textAddPoints = new Phaser.Text(game, 50, 80, '+ ' + add, _.extend(this.options.pointsFormat, { fill: '#' + common.toRgbHex(this.currentColor) }));
	    textAddPoints.anchor.set(0.5);
	    textAddPoints.alpha = 0;
	    this.textAddPoints = textAddPoints;
	    this.addChild(textAddPoints);
	    
	    this.addPointsTimeline = new TimelineMax();
	    this.addPointsTimeline.to(this, this.options.addPointsTime, { points: total, onUpdate: pointsUpdate, onUpdateScope: this });
	    this.addPointsTimeline.to(textAddPoints, this.options.addPointsTime, { alpha: 1,  x: 100 }, 0);
	    this.addPointsTimeline.addLabel('fadeInEnd');
	    this.addPointsTimeline.addLabel('fadeOut', '+=' + this.options.addPointsDelayTime);
	    this.addPointsTimeline.to(textAddPoints, this.options.addPointsTime, { onComplete: pointsComplete, onCompleteParams: [textAddPoints], onCompleteScope: this, alpha: 0 }, 'fadeOut');
	  
	    return this.addPointsTimeline;
	};

	StagePlayer.prototype.setCards = function(progress) {
		this.foreground.graphicsData[0].points[2] = this.options.lineWidth * 2 * progress;
	};

	StagePlayer.prototype.flash = function(speed, color) {
		if(this.flashTimeline){
			this.flashTimeline.kill();
		}
		this.flashTimeline = new TimelineMax({ repeat: -1 });
		this.flashTimeline.to(this.foreground, speed, { colorProps: { colorChange: color } });
		this.flashTimeline.to(this.foreground, speed, { colorProps: { colorChange: this.options.color } });
	};

})()






;// TextNotification.js

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
















;// timerBall.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.TimerBall = (function(){

	function TimerBall(x, y, radius, options){
		// options
		options = _.extend({
			color: 0x000000,
			format: {
				font: "50px Arial",
		        fill: "#eeeeee",
		        align: "center"
			},
			text: '',
		}, options);

		// animation options
		options.card = _.extend({
			time: 0.25,
			delayTime: 0.3,
			complete: this.beginCounting.bind(this),
		}, options.card);
		options.counting = _.extend({
			time: 4,
			complete: this.expand.bind(this),
			scale: 0,
			delayTime: 0,
		}, options.counting);
		options.expand = _.extend({
			time: 1,
			scale: 10,
			isBreak: true,
			breakScale: 2.5,
			breakTime: 1,
			breakTimeOut: 0.1,
			colorTime: 0.5,
			delayTime: 0,
			complete: this.deflate.bind(this),
		}, options.expand),
		options.deflate = _.extend({
			time: 1,
			scale: 1,
			delayTime: 0.3,
			complete: this.beginCounting.bind(this),				
		}, options),
		this.options = options;

		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);
		this.background = game.add.graphics();
		this.background.beginFill(options.color);
		this.background.drawCircle(0, 0, radius);
		this.addChild(this.background);

		this.text = new Phaser.Text(game, 0, 0, options.text, options.format);
	    this.text.anchor.set(0.5);
	    this.addChild(this.text);
	}

	// Constructors
	TimerBall.prototype = Object.create(Phaser.Sprite.prototype);
	TimerBall.prototype.constructor = TimerBall;

	// private methods

	function setDeflate(){
		var options = this.options.deflate;
		var timeline = new TimelineLite({ });
		timeline.addLabel('deflate', '+=0.1');
		timeline.to(this.scale, options.time, 
			{ x: options.scale, y: options.scale, ease: Back.easeOut }, 'deflate');
		timeline.add(function(){
			if(options.complete){
				options.complete();
			}
		}, '+=' + options.delayTime);
		timeline.addLabel('deflateEnded');
		// timeline.add(function(){ console.log('deflate ended') }, 'deflateEnded');
		// timeline.add(function(){ console.log('deflate started') }, 'deflate');
		return timeline;
	}

	function setCounting(){
		var options = this.options.counting;
		var timeline = new TimelineLite({ });
		console.log('starting');
		timeline.addLabel('counting');
		timeline.to(this, options.time, { colorProps: { backgroundColor: this.options.color } }, 'counting');
		timeline.to(this.scale, options.time, { x: options.scale, y: options.scale, ease: Power3.easeIn }, 'counting');
		timeline.add(function(){
			if(options.complete){
				options.complete();
			}
		}, '+=' + options.delayTime);
		timeline.addLabel('countingEnded');
		// timeline.add(function(){ console.log('counting started') }, 'counting');
		// timeline.add(function(){ console.log('counting ended') }, 'countingEnded');
		return timeline;
	}

	function setExpand(){
		var options = this.options.expand;
		var timeline = new TimelineLite({ });
		timeline.addLabel('expand');
		timeline.to(this, options.colorTime, { colorProps: { backgroundColor: this.options.color } }, 'expand');
		timeline.to(this.scale, options.breakTime, { x: options.breakScale, y: options.breakScale, ease: Elastic.easeOut }, 'expand');
		timeline.addLabel('expandBreak', '-=' + options.breakTimeOut);
		timeline.add(function(){
			if(options.breakCallback){
				options.breakCallback();
			}
		}, 'expandBreak');
		timeline.to(this.scale, options.time, { x: options.scale, y: options.scale }, 'expandBreak');
		timeline.add(function(){
			if(options.complete){
				options.complete();
			}
		}, '+=' + options.delayTime);
		timeline.addLabel('expandEnded');

		// timeline.add(function(){ console.log('expand started') }, 'expand');
		// timeline.add(function(){ console.log('expand ended') }, 'expandEnded');
		return timeline;
	}

	function setCard(color){
		var options = this.options.card;
		var timeline = new TimelineLite({ });
		timeline.addLabel('card');
		timeline.fromTo(this.scale, options.time, {x: 0.5, y: 0.5}, { x: 1, y: 1, ease: Elastic.easeOut }, 'card');
		timeline.to(this, options.time / 2, { colorProps: { backgroundColor: color } }, 'card');
		timeline.addLabel('cardHalf');
		timeline.add(function(){
			if(options.complete){
				options.complete();
			}
		}, 'cardHalf+=' + options.delayTime);
		timeline.addLabel('cardEnded');

		// timeline.add(function(){ console.log('card started') }, 'card');
		// timeline.add(function(){ console.log('card ended') }, 'cardEnded');
		return timeline;
	}

	// public methods

	TimerBall.prototype.setCard = function(color) {
		var options = this.options.card;
		return this.playTimeline(setCard.call(this, color));
	}

	TimerBall.prototype.backgroundColor = function(color) {
		if(color !== undefined){
			this.background.graphicsData[0].fillColor = common.getRgb(color);
		}
		return this.background.graphicsData[0].fillColor;
	};

	TimerBall.prototype.beginCounting = function() {
		return this.playTimeline(setCounting.call(this));
	}

	TimerBall.prototype.expand = function(callback, breakCallback) {
		this.options.expand.complete = callback;
		this.options.expand.breakCallback = breakCallback;
		return this.playTimeline(setExpand.call(this));
	};

	TimerBall.prototype.deflate = function() {
		return this.playTimeline(setDeflate.call(this));
	}

	TimerBall.prototype.playTimeline = function(timeline) {
		if(this.currentTimeline){
			this.currentTimeline.kill();
		}
		if(!timeline){
			return;
		}
		this.currentTimeline = timeline;
		return timeline;
	}

	return TimerBall;
})();



;// TimerLines.js

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






;// layout.js
var moduel = (function(window){
	Object.defineProperty(Layout, "PIN_LEFT_TOP", { value: 'leftTop' });
	Object.defineProperty(Layout, "PIN_LEFT_BOTTOM", { value: 'leftBottim' });
	Object.defineProperty(Layout, "PIN_LEFT", { value: 'left' });
	Object.defineProperty(Layout, "PIN_RIGHT_TOP", { value: 'rightTop' });
	Object.defineProperty(Layout, "PIN_RIGHT_BOTTOM", { value: 'rightBottom' });
	Object.defineProperty(Layout, "PIN_RIGHT", { value: 'right' });
	Object.defineProperty(Layout, "PIN_TOP", { value: 'top' });
	Object.defineProperty(Layout, "PIN_BOTTOM", { value: 'bottom' });
	Object.defineProperty(Layout, "PIN_CENTER", { value: 'center' });

	Object.defineProperty(Layout, "NONE", { value: 'none' });
	Object.defineProperty(Layout, "PROPORTIONAL_INSIDE", { value: 'proportionalInside' });
	Object.defineProperty(Layout, "PROPORTIONAL_OUTSIDE", { value: 'proportionalOutside' });
	Object.defineProperty(Layout, "STRETCH", { value: 'stretch' });
	Object.defineProperty(Layout, "STRETCH_WIDTH", { value: 'stretchWidth' });
	Object.defineProperty(Layout, "STRETCH_HEIGHT", { value: 'stretchHeight' });

	Object.defineProperty(Layout, "ALIGN_LEFT", { value: 'left' });
	Object.defineProperty(Layout, "ALIGN_RIGHT", { value: 'right' });
	Object.defineProperty(Layout, "ALIGN_CENTER", { value: 'center' });
	Object.defineProperty(Layout, "ALIGN_TOP", { value: 'top' });
	Object.defineProperty(Layout, "ALIGN_BOTTOM", { value: 'bottom' });
	Object.defineProperty(Layout, "ALIGN_MIDDLE", { value: 'middle' });

	Object.defineProperty(Layout, "STATE_ADDED", { value: 'added' });
	Object.defineProperty(Layout, "STATE_UPDATE", { value: 'update' });


	function Layout(options){
		options = _.extend({
			width: 600,
			height: 800,
			minWidth: 0,
			minHeight: 0,
			maxWidth: Number.MAX_VALUE,
			maxHeight: Number.MAX_VALUE,
			isDebug: false,
		}, options);
		this.options = options;

		this.originalWidth = options.width;
		this.originalHeight = options.height;
		this.currentWidth = options.width;
		this.currentHeight = options.height;
		this.maxScaleX = options.maxHeight / options.width;
		this.maxScaleY = options.maxHeight / options.height;
		this.minScaleX = options.minWidth / options.width;
		this.minScaleY = options.minHeight / options.height;
		this.scaleX = 1;
		this.scaleY = 1;
		this.enable = true;

		if(this.init){
			this.init();
		}

		this.pinArray = [];

		this.resized = new signals.Signal(); 

		Layout.instance = this;
	}

	// Private
	function pinResize(item){
		var layout = item.layout;
		switch(item.type){
			case Layout.PIN_LEFT_TOP:
				// x is default
				// y is default
				break;
			case Layout.PIN_TOP:
				item.obj.x += layout.deltaWidth * 0.5;
				// y is default
				break;
			case Layout.PIN_RIGHT_TOP:
				item.obj.x += layout.deltaWidth;
				// y is default
				break;
			case Layout.PIN_RIGHT:
				item.obj.x += layout.deltaWidth;
				// y is default
				break;
			case Layout.PIN_RIGHT_BOTTOM:
				item.obj.x += layout.deltaWidth;
				item.obj.y += layout.deltaHeight;
				break;
			case Layout.PIN_BOTTOM:
				item.obj.x += layout.deltaWidth * 0.5;
				item.obj.y += layout.deltaHeight;
				break;
			case Layout.PIN_LEFT_BOTTOM:
				// x is default
				item.obj.y += layout.deltaHeight;
				break;
			case Layout.PIN_LEFT:
				// x is default
				item.obj.y += layout.deltaHeight * 0.5;
				break;
			case Layout.PIN_CENTER:
				item.obj.x += layout.deltaWidth * 0.5;
				item.obj.y += layout.deltaHeight * 0.5;
				break;
		}
	}

	// Public
	Layout.prototype.resize = function(width, height) {
		if(!this.enable){
			return;
		}

		this.scaleX = width / this.originalWidth;
		this.scaleX = Math.min(this.maxScaleX, this.scaleX);
		this.scaleX = Math.max(this.minScaleX, this.scaleX);
		this.scaleY = height / this.originalHeight;
		this.scaleY = Math.min(this.maxScaleY, this.scaleY);
		this.scaleY = Math.max(this.minScaleY, this.scaleY);
		this.minScale = Math.min(this.scaleX, this.scaleY);
		this.maxScale = Math.max(this.scaleX, this.scaleY);
		if(this.scaling){
			this.scaling(this.scaleX, this.scaleY);
		}

		this.deltaWidth = width - this.currentWidth;
		this.deltaHeight = height - this.currentHeight;
		_.each(this.pinArray, pinResize);
		this.currentWidth = width;
		this.currentHeight = height;

		this.resized.dispatch(this, width, height);
	};

	Layout.prototype.pin = function(obj, pinTo) {
		// this.unpin(obj);
		var pin = new Pin(this, obj, pinTo);
		this.pinArray.push(pin);
		if(this.pinAdded){
			this.pinAdded(obj, pin);
		}
	};

	Layout.prototype.unpin = function(obj) {
		this.pinArray = _.reject(this.pinArray, function(item){
			return item.obj === obj;
		});
		if(this.pinRemoved){
			this.pinRemoved(obj);
		}
	};

	// Pin Decleration

	function Pin(layout, obj, type){
		this.layout = layout;
		this.obj = obj;
		this.type = type;
	}

	// Area
	function LayoutArea(x, y, width, height, options) {
		options = _.extend({
			width: width,
			height: height,
			x: x,
			y: y,
			layout: Layout.instance,
			isDebug: false,
		},options);
		this.options = options;

		this.attachArray = [];
		this.originalWidth = options.width;
		this.originalHeight = options.height;
		this.layout = options.layout;
		this.layout.resized.add(this.resize.bind(this));

		if(this.init){
			this.init();
		}

		this.x = options.x;
		this.y = options.y;

		this.resized = new signals.Signal();
		this.resize();
	}

	LayoutArea.prototype.attach = function(obj, options) {
		// Checking exists
		if(this.getAttached(obj)){
			return;
		}

		// add attached
		options = _.extend({
			width: obj.width - 20,
			height: obj.height - 20,
			alignHorizontal: Layout.ALIGN_CENTER,
			alignVertical: Layout.ALIGN_MIDDLE,
			mode: Layout.PROPORTIONAL_INSIDE,
		}, options);
		var item = { obj: obj, options: options, state: Layout.STATE_ADDED };
		this.attachArray.push(item);
		this.scaleAttached(item);
		item.state = Layout.STATE_UPDATE;
		if(this.onAttached){
			this.onAttached(obj);
		}
	}

	LayoutArea.prototype.unattach = function(obj) {
		// check not exists
		if(!this.getAttached(obj)){
			return false;
		}

		// remove attached
		this.attachArray = _.reject(this.attachArray, function(){
			return obj === obj;
		});
		if(this.onUnattached){
			this.onUnattached(obj);
		}
		return true;
	}

	LayoutArea.prototype.getAttached = function(obj) {
		return _.findWhere(this.attachArray, { obj: obj });
	}

	LayoutArea.prototype.resize = function() {
		this.currentX = this.options.x * this.layout.scaleX;
		this.currentY = this.options.y * this.layout.scaleY;
		this.currentWidth = this.options.width * this.layout.scaleX;
    	this.currentHeight = this.options.height * this.layout.scaleY;
		_.each(this.attachArray, this.scaleAttached.bind(this));
		this.resized.dispatch(this.currentWidth, this.currentHeight);
	};

	LayoutArea.prototype.scaleAttached = function(item) {
		var data;
		switch(item.options.mode){
			case Layout.PROPORTIONAL_INSIDE:
				data = this.proportionalInside(item);
				break;
			case Layout.PROPORTIONAL_OUTSIDE:
				data = this.proportionalOutside(item);
				break;
			case Layout.STRETCH:
				data = this.stretch(item);
				break;
			case Layout.STRETCH_WIDTH:
				data = this.stretchWidth(item);
				break;
			case Layout.STRETCH_HEIGHT:
				data = this.stretchHeight(item);
				break;
			case Layout.NONE:
				data = this.none(item);
				break;
			default: 
				return;
		}
		this.setScale(item, data);
	};

	LayoutArea.prototype.proportionalOutside = function(item) {
		var data = {};
		var scale;
		var w = this.currentWidth / item.options.width;
	    var h = this.currentHeight / item.options.height;
		if(w < h){
			scale = h;
			data.x = this.currentWidth * 0.5 - item.options.width * scale * 0.5;
	    	data.y = this.currentY;
		} else {
			scale = w;
	    	data.x = this.currentX;
	    	data.y = this.currentHeight * 0.5 - item.options.height * scale * 0.5;
		}
		data.scaleX = scale;
		data.scaleY = scale;
		return data;
	}

	LayoutArea.prototype.proportionalInside = function(item) {
		var data = {};
		var scale;
		var w = this.currentWidth / item.options.width;
	    var h = this.currentHeight / item.options.height;
		if(w > h){
			scale = h;
			data.x = this.alignHorizontal(item, scale);
	    	data.y = this.currentY;
		} else {
			scale = w;
	    	data.x = this.currentX;
	    	data.y = this.alignVertical(item, scale);
		}
		data.scaleX = scale;
		data.scaleY = scale;
		return data;
	};

	LayoutArea.prototype.stretch = function(item) {
		return { scaleX: this.currentWidth / item.options.width, scaleY: this.currentHeight / item.options.height, x: this.currentX, y: this.currentY };
	}

	LayoutArea.prototype.stretchWidth = function(item) {
		return { scaleX: this.currentWidth / item.options.width, x: this.currentX, y: this.alignVertical(item, 1) };
	}

	LayoutArea.prototype.stretchHeight = function(item) {
		return { scaleY: this.currentHeight / item.options.height, x: this.alignHorizontal(item, 1), y: this.currentY };
	}

	LayoutArea.prototype.none = function(item) {
		return { x: this.alignHorizontal(item, 1), y: this.alignVertical(item, 1) };
	}

	LayoutArea.prototype.alignHorizontal = function(item, scale) {
		switch(item.options.alignHorizontal){
			case Layout.ALIGN_LEFT:
				return this.currentX;
			case Layout.ALIGN_CENTER:
				return this.currentX + this.currentWidth * 0.5 - item.options.width * scale * 0.5;
			case Layout.ALIGN_RIGHT:
				return this.currentX + this.currentWidth - item.options.width * scale;
		}
	};

	LayoutArea.prototype.alignVertical = function(item, scale) {
		switch(item.options.alignVertical){
			case Layout.ALIGN_TOP:
				return this.currentY;
			case Layout.ALIGN_MIDDLE:
				return this.currentY + this.currentHeight * 0.5 - item.options.height * scale * 0.5;
			case Layout.ALIGN_BOTTOM:
				return this.currentY + this.currentHeight - item.options.height * scale;
		}
	}

	return {
		Layout: Layout,
		LayoutArea: LayoutArea,
		Pin: Pin,
	}

})(window)

com = _.extend(moduel, com);
var Layout = moduel.Layout;
var LayoutArea = moduel.LayoutArea;


;// layoutPhaser.js
(function(){

	var LayoutArea = com.LayoutArea;
	var Layout = com.Layout;

	// Layout

	Layout.prototype = _.extend(Object.create(Phaser.Group.prototype), Layout.prototype);
	Layout.prototype.constructor = com.LayoutArea;

	Layout.prototype.init = function() {
		Phaser.Group.call(this, this.options.game);

	    this.options.game.add.existing(this);

	    if(!this.options.isDebug){
	    	return;
	    }

	    this.graphics = this.options.game.add.graphics();
	    this.graphics.beginFill(0xcc0000);
	    this.graphics.drawRect(0, 0, this.options.width, this.options.height);
	    var graphWidth = this.originalWidth;
		var graphHeight = this.originalHeight;
		var size = graphWidth > graphHeight ? graphHeight * 0.2 : graphWidth * 0.2;
		this.graphics.drawRect(0, 0, graphWidth, graphHeight);
		this.graphics.beginFill(0x0000aa);
		this.graphics.drawRect(0, 0, size, size);
		this.graphics.drawRect(graphWidth - size, 0, size, size);
		this.graphics.drawRect(0, graphHeight - size, size, size);
		this.graphics.drawRect(graphWidth - size, graphHeight - size, size, size);
		this.graphics.visible = this.options.isDebug;
		this.add(this.graphics);
	}

	Layout.prototype.scaling = function(scaleX, scaleY) {
		this.scale.set(scaleX, scaleY);
	}

	Layout.prototype.pinAdded = function(obj, pin) {
		if(!obj.events || !obj.events.onDestroy){
			return;
		}
		obj.layoutDestroy = function(){
			layout.unpin(obj);
		};
		obj.events.onDestroy.add(obj.layoutDestroy);
	};

	Layout.prototype.pinRemoved = function(obj) {
		if(!obj.events || !obj.events.onDestroy){
			return;
		};
		obj.events.onDestroy.remove(obj.layoutDestroy);
	};

	// LayoutArea

	LayoutArea.prototype = _.extend(Object.create(Phaser.Sprite.prototype), LayoutArea.prototype);
	LayoutArea.prototype.constructor = com.LayoutArea;

	LayoutArea.prototype.init = function(){
	    this.game = this.layout.game;
	    Phaser.Sprite.call(this, this.game);

	    this.layout.add(this);

	    this.changesArray = [];
	    this.preUpdate = this.performChanges;

	    if(!this.options.isDebug){
	    	return;
	    }

	    this.graphics = this.game.add.graphics();
	    this.graphics.beginFill(0x00cc00);
	    this.graphics.drawRect(0, 0, this.options.width, this.options.height);
	    this.debugBox = this.graphics.graphicsData[0];
		var graphWidth = this.options.width;
		var graphHeight = this.options.height;
		var size = graphWidth > graphHeight ? graphHeight * 0.2 : graphWidth * 0.2;
		this.graphics.drawRect(0, 0, graphWidth, graphHeight);
		this.graphics.beginFill(0x0000aa);
		this.graphics.drawRect(0, 0, size, size);
		this.graphics.drawRect(graphWidth - size, 0, size, size);
		this.graphics.drawRect(0, graphHeight - size, size, size);
		this.graphics.drawRect(graphWidth - size, graphHeight - size, size, size);
	    this.addChild(this.graphics);
	    this.graphics.visible = this.options.isDebug;
	}

	LayoutArea.prototype.onAttached = function(obj) {
		if(!obj.events || !obj.events.onDestroy){
			return;
		}
		obj.layoutAreaDestroy = function(){
			this.unattach(obj);
		}.bind(this);
		obj.events.onDestroy.add(obj.layoutAreaDestroy);
	};

	LayoutArea.prototype.onUnattached = function(obj) {
		if(!obj.events || !obj.events.onDestroy){
			return;
		};
		obj.events.onDestroy.remove(obj.layoutAreaDestroy);
	};

	LayoutArea.prototype.performChanges = function(){
    	if(this.isUpdate > 0){
	    	this.isUpdate--;
    		return;
    	}
    	if(this.isUpdate !== 0){
    		return;
    	}
    	_.each(this.changesArray, this.performChangeAttach.bind(this));
    	this.changesArray = [];
    	this.isUpdate = -1;
	}

	LayoutArea.prototype.performChangeAttach = function(item){
		// Check if still valid
		var found = this.getAttached(item.obj);
		if(!found) {
			return;
		}

		item.obj.x = item.data.x;
		item.obj.y = item.data.y;
		if(item.obj.parent !== game.world){
			item.obj.x -= item.obj.parent.x;
			item.obj.y -= item.obj.parent.y;
		}
		item.obj.scale.set(
			item.data.scaleX ? item.data.scaleX : item.obj.scale.x, 
			item.data.scaleY ? item.data.scaleY : item.obj.scale.y
		);

		if(item.options.onResize){
			item.options.onResize.call(this, item);
		}
	}

	LayoutArea.prototype.setScale = function(item, data){
		if(item.state === Layout.STATE_UPDATE){
			this.isUpdate = 0;
		} else {
			this.isUpdate = 0;
		}
		this.changesArray.push(_.extend(item, { data: data }));
	}

	LayoutArea.prototype.onResize = function(scale){
		if(!this.scale){
			return;
		}
		this.scale.set(scale);
	}

})();// network.js

var Network = (function(){

	function Network(options){
		this.options = _.extend({ 
			address: config.address,
		}, options);

		socket = io.connect(this.options.address);
		socket.on('disconnect', onDisconnect);
		socket.on('connect', onConnect);
		socket.on('connectError', onConnectFail);
		socket.on('connectTimeout', onConnectFail);
		// socket.on('reconnect', onReconnect);
		// socket.on('reconnecting', onReconnecting);
		// socket.on('reconnect_error', onReconnectFail);
		// socket.on('reconnect_timeout', onReconnectFail);
		socket.off = socket.removeListener;
	}

	function onConnect(){
		// game.state.load('menu');
		console.log('Connected');
	}

	function onDisconnect(data){
		player = null;
		stage = null;
		console.log('Disconnected');
		game.state.start('main');
	}

	function onConnectFail(){
		// alert('onConnectFail');
	}

	// function onReconnecting(num){
	// 	alert('onReconnectTry ' + num);
	// }

	// function onReconnect(num){
	// 	alert('onReconnect ' + num);
	// }

	// function onReconnectFail(num){
	// 	alert('onReconnectFail ' + num);
	// }


	return Network;
})();;// boot.js

var bootState = (function(){

	var resizeTimeout = 0;

	function setSocket(){
		//// Local
		console.log('Trying to connect to ' + config.address);

		network = new Network();
	}

	function setScale(){
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVeritcally = true;
        game.scale.refresh();
        // game.scale.trackParentInterval = 500;
        game.scale.setResizeCallback(resizeWorld);

        layout = new com.Layout({
        	game: game,
        	width: originalWidth,
        	height: originalHeight,
        });
    	resizeWorld(game.scale, game.world.getBounds(), true);
	}

	function resizeWorld(scaleManager, rect, isOverwriteMobile, isRepeat) {
		if(Layout.instance){
	  		Layout.instance.resize(scaleManager.width, scaleManager.height);

	  		if(isRepeat){
	  			return;
	  		}
  			clearTimeout(resizeTimeout);
  			setTimeout(function(){
				resizeWorld(scaleManager, rect, isOverwriteMobile, true);
  			}, 500);
	  	}
	}

	return {
		preload: function(){
			game.load.image('bblogo', 'images/bros_logo.png');
			game.load.image('logo', 'images/speez_logo.png');
			game.load.image('logoGray', 'images/speez_logo_gray.png');
			game.load.image('logoO', 'images/speez_logo_o.png');
			game.load.image('beta', 'images/beta.png');

			// creatures
			var number = common.addZeroes(_.random(1, avatarNames.length), 2);
			game.load.image('preloadAvatar', 'images/avatar_' + number + '_head.png');
		},

		create: function(){
    		game.stage.disableVisibilityChange = true;
			setScale();
			if(!config.isUnderConstruction){
				setSocket();
  				game.state.start('preload');
			} else {
				game.state.start('mail');
			}
		},

		render: function(){
			
		}
	}

})();;// stage.js
var lobbyState = (function(){

	// gui
	var header;	
	var lobbyArea;
	var iconsGroup;
	var container;
	var downContainer;
	var numberText;
	var numberBox;
	var playersIcons;
	var descriptionContainer;

	var textStatus;
	var textData;
	var textPlayers;
	var btnBoardsCount;

	var timeline;

	function drawGui(){
		game.stage.backgroundColor = 0xe2e2e2;

		// header
		var headerHeight = 70;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			alpha: 0,
		});
		if(config.isPlayer){
			var headerButton = game.add.text(30, headerHeight * 0.5, '\uf04c', {
				font: "20px FontAwesome",
		        fill: "#000000",
		        align: "center"
			});
			headerButton.anchor.set(0.5);
		    headerButton.inputEnabled = true;
		    headerButton.events.onInputDown.add(handleStagePauseClicked);
			header.addLeft(headerButton);
		}

		// Content
		lobbyArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		downContainer = game.add.sprite();
		container = game.add.sprite();
		lobbyArea.attach(container, { width: originalWidth, height: originalHeight });
		lobbyArea.attach(downContainer, { width: originalWidth, height: originalHeight, alignVertical: Layout.ALIGN_BOTTOM });

		// Players Icons
		iconsGroup = game.add.group();
	    playersIcons = [];
    	iconsGroup.x = originalWidthCenter;
    	iconsGroup.y = 210;
		container.addChild(iconsGroup);

		var keys = _.keys(stage.players);
		if(keys.length === 0){
    		playersIcons.push(createNewIcon());
			rearrangeIcons();	    
		} else {
			keys = _.sortBy(keys, function(key){ return stage.players[key].icon });
			for (var i = 0; i < keys.length; i++) {
				var player = stage.players[keys[i]];
				var icon = createNewIcon();
				icon.setPlayer(player, false);
				playersIcons.push(icon);
				player.icon = playersIcons.indexOf(icon);
			};
			rearrangeIcons().progress(1);	    
			if(playersIcons.length < 4){
				playersIcons.push(createNewIcon())
				rearrangeIcons();	    
			}
		}

		var numberTextFormat = {
			font: "22px Montserrat",
	        fill: "#000000",
	        align: "center"
		}
		numberText = game.add.text(originalWidthCenter, originalHeight - 30, 'GAME NUMBER', numberTextFormat);
		numberText.anchor.set(0.5);
		downContainer.addChild(numberText);

		blockNumber = new com.speez.components.BlockNumber(originalWidthCenter - 260 / 2, originalHeight - 126, 260, 70, stage.id, {
			format: {
				font: "52px Montserrat",
		        fill: "#ffffff",
		        align: "center"
			},
			margin: 10,
		});
		downContainer.addChild(blockNumber);

		drawDescription();

		toggleDescription(playersIcons.length === 1).progress(1);

		// common
		common.addLogo('logo', lobbyArea);
		common.addLogo('beta', lobbyArea);
	}

	function drawDescription(){
		// lobby description
		descriptionContainer = game.add.sprite(originalWidthCenter, originalHeightCenter);
		container.addChild(descriptionContainer);

		var description = game.add.sprite(-150, 0,'lobbyDescription');
		description.anchor.set(0.5);
		description.scale.set(0.9);
		descriptionContainer.addChild(description);

		var textY = -100;
		var descriptionText = game.add.text(120, textY, 'JOIN THE GAME\nON YOUR SMARTPHONE', {
			font: '20px Montserrat',
			fill: 0x000000,
			align: 'center',
		});
		var descriptionTextBold = game.add.text(120, textY + descriptionText.height, 'AND ENTER THIS NUMBER', {
			font: 'bold 20px Montserrat',
			fill: 0x000000,
			align: 'center',
		});
		descriptionText.anchor.set(0.5, 0);
		descriptionTextBold.anchor.set(0.5, 0);
		descriptionContainer.addChild(descriptionText);
		descriptionContainer.addChild(descriptionTextBold);
		// block number
		var descriptionBlockNumber = new com.speez.components.BlockNumber(descriptionText.x - 210 / 2, 0, 210, 60, stage.id, {
			format: {
				font: "52px Montserrat",
		        fill: "#ffffff",
		        align: "center"
			},
			margin: 10,
		});
		descriptionContainer.addChild(descriptionBlockNumber);

		var descriptionNumberText = game.add.text(descriptionText.x, 80, 'GAME NUMBER', {
			font: '20px Montserrat',
			fill: 0x000000,
			align: 'center',
		});
		descriptionNumberText.anchor.set(0.5);
		descriptionContainer.addChild(descriptionNumberText);
	}

	function drawPause(){
		var text = game.add.text(originalWidthCenter, 143, 'PAUZE', {
			font: "bold 50px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
	    text.anchor.set(0.5);

		btnContinue = new MenuButton(originalWidthCenter, 313, 324, 96, {
	    	color: 0x009bff,
	    	textColor: 0x1e1e1e,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'CONTINUE',
			callback: handleContinueClicked,
	    });

	    btnExit = new MenuButton(originalWidthCenter, 453, 324, 85, {
	    	color: 0x1e1e1e,
	    	textColor: 0xffffff,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'END GAME',
			callback: handleExitClicked,
	    });

		pause = new com.speez.components.PauseScreen(originalWidth, originalHeight);
		game.add.existing(pause);
	    pause.container.addChild(text);
		pause.container.addChild(btnExit);
		pause.container.addChild(btnContinue);
	}

	function toggleDescription(on){
		var timeline = new TimelineMax();
		var alpha = on ? 0 : 1;
		timeline.to(descriptionContainer, 1, { alpha: on ? 1 : 0 });
		timeline.to([iconsGroup, blockNumber, numberText], 1, { alpha: on ? 0 : 1 }, 0);
		return timeline;
	}

	// Various

	function rearrangeIcons(){
	    var distance = 200;
		var timeline = new TimelineMax();
		for (var i = 0; i < playersIcons.length; i++) {
			var icon = playersIcons[i];
			var targetX = -distance * (0.5 * (playersIcons.length - 1)) + i * distance;
			timeline.to(icon, 1, { x: targetX }, 0);
		};
		return timeline;
	}

	function createNewIcon(){
		var icon = new PlayerIcon(0, 0, 155, 80, {
    		readyColor: 0x36de4a,
    	});
    	var lastIcon = playersIcons[getAvailableIcon()];
		if(lastIcon){
			icon.x = lastIcon.x;
			icon.y = lastIcon.y;
		}
		iconsGroup.addAt(icon, 0);
		return icon;
	}

	function getAvailableIcon(){
		return playersIcons.length-1;
		// for(var i=0;i<playersIcons.length; i++){
		// 	if(!playersIcons[i].player){
		// 		return i;
		// 	}
		// }
	}

	function isAbleToPlay(){
		return _.size(stage.players) > 0 && _.every(stage.players, function(item){ return item.isReady; });
	}

	// buttons handlers

	function handleBoardsCountClick(){
		stage.game.boardCount += 1;
		if(stage.game.boardCount > 4){
			stage.game.boardCount = 2;
		}
		btnBoardsCount.text.setText( 'Boards Count: ' + stage.game.boardCount);
	}

	function handleStagePauseClicked() {
		drawPause();
	}

	function handleContinueClicked(){
		pause.destroy();
	}

	function handleExitClicked(){
	 	if(!confirm("Are you sure?")){
	        return;
	    };
		_.each(pause.container.children, function(item){
			if(item.setEnable){
				item.setEnable(false);
			}
		});
		socket.emit('speed:stage:stageLeave', handleStageLeave);
	}

	// socket handlers

	function handleIdentify(data){
		stage = {
			id: data.id,
			players: [],
		};
		drawGui();
		
	}

	function handleNextLobby(data) {
		drawGui();
	}

	function handleJoin(data){
		console.log('handleJoin:', data)

		var player = data;
		stage.players[data.id] = player;
		player.victories = 0;
		player.icon = getAvailableIcon();

		timeline = playersIcons[player.icon].setPlayer(player, true);
		if(playersIcons.length === 1) {
			toggleDescription(false);
		}  
		if(playersIcons.length < 4) {
			playersIcons.push(createNewIcon());
			timeline.add(rearrangeIcons());
		}
	}

	function handleLeave(data){
		console.log('handleLeave:', data)

		var player = stage.players[data.id];
		var icon = playersIcons[player.icon];
		for (var i = player.icon + 1; i < playersIcons.length; i++) {
			var nextIcon = playersIcons[i];
			if(nextIcon.player){
				nextIcon.player.icon--;
			}
		};
		playersIcons.splice(player.icon, 1);

		var timeline = icon.removePlayer();
		timeline.add(icon.removePopup(), 0);

		if(playersIcons.length === 1){
			timeline.add(toggleDescription(true));
		} else if(playersIcons[playersIcons.length - 1].player){
			playersIcons.push(createNewIcon());
		}
		timeline.add(rearrangeIcons());
		delete stage.players[data.id];
	}

	function handleReady(data) {
		console.log('handleReady:', data);
		var player = stage.players[data.id];
		if(!player){
			return;
		}
		player.isReady = data.isReady;
		var icon = playersIcons[player.icon];
		if(player.isReady){
			icon.popup({
				color: 0x36de4a,
				text: 'Ready',
				symbol: '\uf00c',
				moveTime: 1,
				isStay: true,
			});
			icon.tweenColor({ color: 0x36de4a });
		} else {
			icon.removePopup();
			icon.tweenColor();
		}
	}

	function handleLoad(data) {
		console.log('handleLoad:', data);
		stage.game = data;

		if(timeline){
			timeline.kill();
		}

		var timeline = new TimelineMax({ onComplete: function(){
			game.state.start('stage');
		} });
		var lastIcon = playersIcons[playersIcons.length-1];
		if(!lastIcon.player){
			playersIcons.splice(playersIcons.length-1, 1);
			timeline.to(lastIcon, 1, { alpha: 0 });
		}
		timeline.add(function() { 
			_.invoke(playersIcons, 'setAvatarAnimation', false);
		});
		timeline.add(rearrangeIcons(), 0);
		timeline.add(_.invoke(playersIcons, 'removePopup'), 0);
		timeline.add(_.invoke(playersIcons, 'removeStats'), 0);
		timeline.addLabel('start');
		timeline.add(_.invoke(playersIcons, 'tweenColor', { color: 0xffffff }), 'start');
		timeline.to(iconsGroup, 2, { y: originalHeight - 60, ease: Sine.easeInOut }, 'start');
		timeline.to([blockNumber, numberText], 2, { y: '+=250', alpha: 0, ease: Sine.easeIn}, 'start');
		timeline.add(common.tweenStageColor(0x1e1e1e, null, 1));
	}

	function handleName(data){
		var player = stage.players[data.playerId];
		player.name = data.name;
		var icon = playersIcons[player.icon];
		icon.changeName(data.name);
	}

	function handleAvatar(data){
		console.log('handleAvatar:', data);

		var player = stage.players[data.playerId];
		var icon = playersIcons[player.icon];

		player.avatar = data.avatar;
		icon.changeAvatar(player.avatar);
	}

	function handleStageLeave(data){
		console.log('handleStageLeave:', data);

		stage = null;
		game.state.start('main');
	}

	return {

		preload: function(){
		},

		create: function(){
			common.flipOrientation('landscape');
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);

			// network
			socket.on('speed:stage:join', handleJoin);
			socket.on('speed:stage:leave', handleLeave);
			socket.on('speed:stage:ready', handleReady);
			socket.on('speed:stage:load', handleLoad);
			socket.on('speed:stage:name', handleName);
			socket.on('speed:stage:avatar', handleAvatar);
			
			if(stage){
				socket.emit('speed:stage:nextLobby', null, handleNextLobby);
			} else {
				socket.emit('speed:create', null, handleIdentify)
			}
		},

		update: function(){

		},

		shutdown: function(){
			socket.off('speed:stage:join', handleJoin);
			socket.off('speed:stage:leave', handleLeave);
			socket.off('speed:stage:ready', handleReady);
			socket.off('speed:stage:load', handleLoad);
			socket.off('speed:stage:name', handleName);
			socket.off('speed:stage:avatar', handleAvatar);
		},

	}

})();;// lobbyPlayer.js

var lobbyPlayerState = (function(){
	var graphics;
	// data
	var isReady;

	// menu
	var avatarPicker;
	var blockNumber;
	var lobbyArea;
	var buttons;
	var btnReady;
	var headerText;
	var textAreYou;

	// header
	var header;

	// debug
	var textLatency;

	function drawGui(){

		lobbyArea = new com.LayoutArea(0, 0, originalWidth, originalHeight);
		container = game.add.sprite();
		lobbyArea.attach(container, {width: originalWidth, height: originalHeight, onResize: onAreaResized, });
		game.stage.backgroundColor = 0xe2e2e2;

		blockNumber = new com.speez.components.BlockNumber(originalWidthCenter - 470 / 2, 120, 470, 125, player.stageId);
		game.add.existing(blockNumber);
		container.addChild(blockNumber);

		var headerTextFormat = {
			font: "27px Montserrat",
	        fill: "#000000",
	        align: "center"
		}
		headerText = game.add.text(originalWidthCenter, 80, 'GAME NUMBER', headerTextFormat);
		headerText.anchor.set(0.5);
		container.addChild(headerText);

	    var buttonOptions = {
	    	color: 0x36de4a,
	    	textColor: 0x000000,
	    	colorOver: 0x269e34,
	    	textColorOver: 0x000000,
	    	colorDown: 0x36de4a,
			format: {
		        font: "bold 44px Montserrat, FontAwesome",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0x000000,
			radius: 10,
	    }
		btnReady = new MenuButton(0, 814, 476, 154, _.extend({ callback: handleReadyClicked, text: "I'M READY" }, buttonOptions));

		// texts
		var textsFormat = {
			font: "27px Montserrat",
	        fill: "#000000",
	        align: "center"
		};
		textAreYou = game.add.text(0, 540, 'YOUR NAME IS', textsFormat);
		textAreYou.anchor.set(0.5);

		// Group buttons
		buttons = game.add.group();
		buttons.add(btnReady);
		buttons.add(textAreYou);

		buttons.x = originalWidthCenter;
		buttons.y = 0;

    	container.addChild(buttons);

    	// input
    	$('<form>')
    		.submit(function(event){
    			event.preventDefault();
    		})
    		.appendTo('body');
		$('<style>')
    		.appendTo('form')
    		.text('input::-webkit-input-placeholder { font-size: 60 }');
    	$('<input id="tbxChangeName" type="text">')
    		.appendTo('form')
    		.addClass('tbxChangeName')
    		.css({
    			'background-color': 'transparent',
				'font-family': 'Montserrat, FontAwesome',
    		})
    		.attr('placeholder', 'ENTER NAME')
    		.focusout(onJoinTextFocusOut)
    		.focusin(onJoinTextFocusIn)
    		.change(onJoinTextChange)
    		.keyup(onJoinTextChange)
    		.val(player.name);

		// avatar picker
		avatarPicker = new com.speez.components.AvatarPicker(originalWidthCenter, 400, {
			avatar: player.avatar,
			avatarNames: avatarNames,
		});
		avatarPicker.changed.add(handleAvatarPickerChange);
		container.addChild(avatarPicker);

		// header
		var headerHeight = 100;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			alpha: 0,
		});
		var headerButton = game.add.text(50, headerHeight * 0.5, '\uf00d', {
			font: "65px FontAwesome",
	        fill: "#000000",
	        align: "center"
		});
		headerButton.anchor.set(0.5);
	    headerButton.inputEnabled = true;
	    headerButton.events.onInputDown.add(handleExitClicked);
		header.addLeft(headerButton);
	}

	function onAreaResized(){
		var width = 486 * Layout.instance.minScale;
		var height = 128 * Layout.instance.minScale;
		var x = container.x + (originalWidthCenter - 5) * Layout.instance.minScale - width * 0.5;
		var y = container.y + 635 * Layout.instance.minScale - height * 0.5;
		$('#tbxChangeName').css({ 
			left: x + 'px',
			top: y + 'px',
			width: width * (detector.mobile() && detector.os().toLowerCase() === 'ios' ? 0.9 : 1) + 'px',
			height: height * (detector.mobile() && detector.os().toLowerCase() === 'ios' ? 0.9 : 1) + 'px',
			'border-width': (5 * Layout.instance.minScale) + 'px',
			'font-size': (60 * Layout.instance.minScale) + 'px', 
			'line-height': (80 * Layout.instance.minScale) + 'px',
		});
		$('form style')
			.text('input::-webkit-input-placeholder {font-size:' + (60 * Layout.instance.minScale) + 'px}\n');
	}

	function toggleButtons(on){
		$('#tbxChangeName').prop('disabled', !on);
		buttons.callAll('setEnable', null, on);
	}

	function removeDom(){
		$('form').remove();
	}

	// gui handlers

	function onJoinTextFocusOut(event){
		// set name
		var val = $('#tbxChangeName').val().substring(0, 7);
		$('#tbxChangeName').val(val);
		if(val && player.name !== val){
			socket.emit('speed:player:name', { name: val }, handleName);
			toggleButtons(false);
		} else {
			$('#tbxChangeName').val(player.name);
			btnReady.setEnable(true);
		}

		Layout.instance.enable = true;
		_.delay(function(){
			Layout.instance.resize(game.width, game.height);
		}, 2000);
	}

	function onJoinTextFocusIn(event){
		Layout.instance.enable = false;
		btnReady.setEnable(false);
		$('#tbxChangeName')
			.val('');
	}

	function onJoinTextChange(event){
		if(event.keyCode === 13){
			$('#tbxChangeName').blur();
			return;
		}
		var val = $('#tbxChangeName').val().substring(0, 7);
		$('#tbxChangeName').val(val);

	}

	function handleReadyClicked(){		
		isReady = !isReady;
		
		$('#tbxChangeName').prop('disabled', isReady);
		btnReady.setText(isReady ? '\uf058' : 'I\'M READY');

		$('#tbxChangeName').prop('disabled', isReady);
		avatarPicker.setEnable(!isReady);

		common.tweenStageColor(isReady ? 0x36de4a : 0xe2e2e2, function(){
			socket.emit('speed:player:ready', { isReady: isReady }, handleReady);
		}, 1);
	}

	function handleExitClicked(){
		toggleButtons(false);
		socket.emit('speed:player:leave', handleLeave);
	}

	function handleAvatarPickerChange(avatar){
		player.avatar = avatar;
		toggleButtons(false);
		socket.emit('speed:player:avatar', { avatar: avatar }, handleAvatar);
	}

	// socket handlers

	function handleLeave(data){
		console.log('handleLeave:', data);
		game.state.start('main');
	}

	function handleLoad(data){
		console.log('handleLoad:', data);
		toggleButtons(false);
		player.game = data;
		player.game.cardTotal = player.game.cardCount;
		
		_gaq.push(['_trackEvent', 'speez', 'player', player.avatar]);
		game.state.start('player');
	}

	function handleName(data){
		console.log('handleName:', data);
		player.name = data.name;
		toggleButtons(true);
	}

	function handleReady(data){
		console.log('handleName:', data);
	}

	function handleAvatar(data){
		console.log('handleAvatar:', data);
		toggleButtons(true);
	}

	return {

		preload: function() {
			common.flipOrientation('portrait');
		},

		create: function(){

			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});

			isReady = false;

			// Draw things
			drawGui();
			// common.addLogo('logo', lobbyArea);
			common.addLogo('beta', lobbyArea);

			socket.on('speed:player:load', handleLoad);
			socket.on('speed:player:leave', handleLeave);
			// socket.on('speed:player:ready', handleReady);

	  		Layout.instance.resize(game.width, game.height);
	  		_.delay(function(){
	  			Layout.instance.resize(game.width, game.height);
	  		}, 1000);
		},

		update: function(){
		},

		shutdown: function(){
			socket.off('speed:player:leave', handleLeave);
			socket.off('speed:player:load', handleLoad);
			removeDom();
			// socket.off('speed:player:ready', handleReady);
		},

	}

})();;// test.js
var mailState = (function(){

	function state(){

	}

	state.prototype.preload = function() {
		common.flipOrientation('portrait');

		layout = new Layout({
			game: game,
        	width: originalWidth,
        	height: originalHeight,
        	isDebug: false,
		});

		for (var i = 0; i < avatarNames.length; i++) {
			var number = common.addZeroes(i+1, 2);
			game.load.image(avatarNames[i] + '_head', 'images/avatar_' + number + '_head.png');
		};
	};

	state.prototype.create = function() {
		// Draw things
		this.drawGui();
  		Layout.instance.resize(game.width, game.height);
	};

	state.prototype.drawGui = function() {
		
		// set container
		this.container = game.add.sprite();
		this.area = new com.LayoutArea(0, 0, originalWidth, originalHeight);
		this.area.attach(this.container, {width: originalWidth, height: originalHeight, onResize: onAreaResized.bind(this) });
		game.stage.backgroundColor = 0xe2e2e2;

		this.updateText = game.add.text(originalWidthCenter, originalHeightCenter);
		this.updateText.anchor.set(0.5);
		this.container.addChild(this.updateText);

		this.logo = game.add.sprite(originalWidthCenter, 125, 'logo');
		this.logo.anchor.set(0.5);
		this.container.addChild(this.logo);

		this.logoO = game.add.sprite(originalWidthCenter, 310, 'logoO');
		this.logoO.anchor.set(0.5);
		this.container.addChild(this.logoO);

		this.avatarContainer = game.add.sprite(originalWidthCenter, 250);
		this.avatarContainer.alpha = 0;
		this.avatarContainer.timeline = new TimelineMax({ repeat: -1, yoyo: true });
		this.avatarContainer.timeline.to(this.avatarContainer, 1, { y: '-=20', ease: Power2.easeInOut });
		this.avatarAnimation();
		this.container.addChild(this.avatarContainer);

		this.notificationContainer = game.add.sprite(originalWidthCenter, originalHeightCenter);
		this.container.addChild(this.notificationContainer);

		this.textNotification = game.add.text(0, -45, 'COMING SOON', {
			font: "27px Montserrat",
	        fill: "#000000",
	        align: "center"
		});
		this.textNotification.anchor.set(0.5);
		this.notificationContainer.addChild(this.textNotification);

		this.textAssurance = game.add.text(0, 165, '* We won\'t share your address', {
			font: "22px Montserrat",
	        fill: "#000000",
	        align: "center"
		});
		this.textAssurance.anchor.set(0.5);
		this.notificationContainer.addChild(this.textAssurance);

		this.footer = game.add.sprite(originalWidthCenter, originalHeight - 200);
		this.container.addChild(this.footer);

		this.btnVideo = new MenuButton(-100, 0, 170, 100, {
	    	color: 0xA3A3A3,
	    	textColor: 0x000000,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 60px FontAwesome",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0x000000,
			radius: 30,
			text: '\uf04b',
			callback: handleVideoClicked.bind(this),
	    });
	    this.footer.addChild(this.btnVideo);

	    this.textVideo = game.add.text(this.btnVideo.x, this.btnVideo.y + 80, 'GAME VIDEO', {
			font: "22px Montserrat",
	        fill: "#000000",
	        align: "center"
		});
		this.textVideo.anchor.set(0.5);
		this.footer.addChild(this.textVideo);

		this.btnFacebook = new MenuButton(130, 0, 100, 100, {
	    	color: 0xA3A3A3,
	    	textColor: 0x000000,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 60px FontAwesome",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0x000000,
			radius: 30,
			text: '\uf09a',
			callback: handleFacebookClicked.bind(this),
	    });
	    this.footer.addChild(this.btnFacebook);

	    this.textFacebook = game.add.text(this.btnFacebook.x, this.btnFacebook.y + 80, 'FACEBOOK', {
			font: "22px Montserrat",
	        fill: "#000000",
	        align: "center"
		});
		this.textFacebook.anchor.set(0.5);
		this.footer.addChild(this.textFacebook);

		common.addLogo('logo', this.area);

		// input
		this.emailPlaceholderText = "SIGN UP FOR UPDATE";
		this.emailPlaceholderFocusText = "ENTER EMAIL ADDRESS";
    	$('<form>')
    		.submit(function(event){
    			event.preventDefault();
    		})
    		.appendTo('body');
		$('<style>')
    		.appendTo('form');
		if(detector.os() && detector.os().toLowerCase().indexOf('android') === -1){
			$('<button type="submit">')
				.css({
					position: 'absolute',
					margin: -1000,
				})
				.click(function(event){
					event.preventDefault();
				})
				.appendTo('form');
		}
    	this.tbxMail = $('<input id="tbxMail" type="email">')
    		.appendTo('form')
    		.addClass('tbxMail')
    		.css({
				position: 'absolute',
				'background-color': common.toRgb(_.sample(palette)),
				'text-align': 'center',
				'font-family': 'Montserrat, FontAwesome',
				'font-weight': 'bold',
    		})
    		.attr('placeholder', this.emailPlaceholderText)
    		.focusout(onJoinTextFocusOut.bind(this))
    		.focusin(onJoinTextFocusIn.bind(this))
    		.keydown(onJoinTextKeyDown.bind(this))
    		.keyup(onJoinTextChange.bind(this))
    		.change(onJoinTextChange.bind(this));
	};

	state.prototype.avatarAnimation = function() {
		if(this.avatarContainer.showTimeline){
			this.avatarContainer.avatar.destroy();
			delete this.avatarContainer.avatar;
			this.avatarContainer.showTimeline.kill();
			delete this.avatarContainer.showTimeline;
		}
		var timeline = new TimelineMax({onComplete: this.avatarAnimation, onCompleteScope: this});
		this.avatarContainer.showTimeline = timeline;

		var avatar = game.add.sprite(0, 0, _.sample(avatarNames) + '_head');
		avatar.anchor.set(0.5);
		this.avatarContainer.avatar = avatar;
		this.avatarContainer.addChild(avatar);
		timeline.to(this.avatarContainer, 1, { alpha: 1, ease: Elastic.easeOut });
		timeline.to(this.avatarContainer, 1, { alpha: 0, ease: Elastic.easeOut }, '+=3');
	};

	state.prototype.hideMail = function() {
		this.tbxMail.hide().val('');
		this.notificationContainer.kill();
	};

	state.prototype.showMail = function() {
		this.tbxMail.show();
		this.notificationContainer.revive();
	};

	state.prototype.showThinking = function() {
		this.thinkingText = game.add.text(originalWidthCenter, originalHeightCenter, 'Sending your information!', {
			font: "bold 55px Montserrat",
	        fill: "#000000",
	        align: "center"
		});
		this.thinkingText.anchor.set(0.5);
		this.container.addChild(this.thinkingText);
	};

	state.prototype.hideThinking = function() {
		if(this.thinkingText){
			this.thinkingText.destroy();
			delete this.thinkingText;
		}
	};

	// private methods

	function handleVideoClicked(){
		common.open('https://www.youtube.com/watch?v=meak65zqfGE');
	}

	function handleFacebookClicked(){
		common.open('https://www.facebook.com/Speez.co');
	}

	function onJoinTextFocusOut(event){
		_.delay(function(){
			Layout.instance.enable = true;
			Layout.instance.resize(game.width, game.height);
		}, 2000);
		this.tbxMail
			.removeClass('focus')
			.attr('placeholder', this.emailPlaceholderText);
	}

	function onJoinTextFocusIn(event){
		Layout.instance.enable = false;
		this.tbxMail
			.addClass('focus')
			.removeClass('error')
			.attr('placeholder', this.emailPlaceholderFocusText);
	}

	function onJoinTextKeyDown(event){
	}

	function onJoinTextChange(event){
		if(event.keyCode === 13){
			event.preventDefault();
			this.tbxMail.blur();
			var mail = this.tbxMail.val().toLowerCase();
			if(!mail){
				return;
			}
			if(!/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(mail)){
				this.tbxMail.addClass('error').val('').attr('placeholder', 'INVALID EMAIL ADDRESS');
				return;
			}
			this.hideMail();
			this.showThinking();
			$.ajax({
				type: "POST",
				url: "/mail",
				data: { mail: mail },
				success: onMailSeccess.bind(this),
				error: onMailError.bind(this),
				complete: this.hideThinking.bind(this),
			});
			return;
		}
	}

	function onMailSeccess(data){
		var text = 'Your address is saved.\nYou will receive a notification\nwhen the game is ready!';
		if(data.isRegistered){
			text = 'Your address was already saved.\nWe are working really hard\nso you will enjoy Speez very soon!';
		}
    	this.savedText = game.add.text(originalWidthCenter, originalHeightCenter, text, {
			font: "bold 35px Montserrat",
	        fill: "#000000",
	        align: "center"
		});
		this.savedText.anchor.set(0.5);
		this.container.addChild(this.savedText);
	}

	function onMailError(data){
		var res = data.responseJSON;
		this.tbxMail
			.addClass('error')
			.val('')
			.attr('placeholder', res[0].msg);
		this.showMail();
	}

	function onAreaResized(){
		var width = 466 * Layout.instance.minScale;
		var height = 144 * Layout.instance.minScale;
		var x = this.container.x + (originalWidthCenter - 5) * Layout.instance.minScale - width * 0.5;
		var y = this.container.y + 530 * Layout.instance.minScale - height * 0.5;
		this.tbxMail.css({ 
			left: x + 'px',
			top: y + 'px',
			width: width * (detector.mobile() && detector.os().toLowerCase() === 'ios' ? 0.9 : 1) +'px',
			height: height * (detector.mobile() && detector.os().toLowerCase() === 'ios' ? 0.9 : 1) + 'px',
			'border-width': (5 * Layout.instance.minScale) + 'px',
			'font-size': (40 * Layout.instance.minScale) + 'px', 
			'line-height': (80 * Layout.instance.minScale) + 'px', 
		});
		$('form style')
			.text('input::-webkit-input-placeholder {font-size:' + (35 * Layout.instance.minScale) + 'px}\n' +
				'input.focus::-webkit-input-placeholder {font-size:' + (35 * Layout.instance.minScale) + 'px}\n' +
				'input.error::-webkit-input-placeholder {font-size:' + (35 * Layout.instance.minScale) + 'px}');
	}

	return state;

})();







;// main.js
var board;
var mainState = (function(){
	var graphics;

	// menu
	var menuArea;
	var buttons;
	var logo;
	var logoO;
	var bbLogo;
	var btnJoinStage;
	var btnBecomeStage;
	var btnTestPlayer;
	var btnTestStage;
	var btnReady;
	var btnChangeName;

	// avatar
	var avatar;
	var avatarTimeline;

	// header
	var header;

	// debug
	var textLatency;

	var help;

	function drawGui(){
		// header
		var headerHeight = originalHeight * 0.125;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			alpha: 0,
		});
		var headerButton = game.add.text(50, headerHeight * 0.5, '\uf059', {
			font: "65px FontAwesome",
	        fill: "#000000",
	        align: "center"
		});
		headerButton.anchor.set(0.5);
	    headerButton.inputEnabled = true;
	    headerButton.events.onInputDown.add(handleHelpClicked);
		header.addLeft(headerButton);

		menuArea = new com.LayoutArea(0, 0, originalWidth, originalHeight);
		container = game.add.sprite();
		menuArea.attach(container, {width: originalWidth, height: originalHeight, onResize: onAreaResized, });
		game.stage.backgroundColor = 0xe2e2e2;

		// logo

		logo = game.add.sprite(originalWidthCenter, 125, 'logo');
		logo.anchor.set(0.5);
		container.addChild(logo);

		logoO = game.add.sprite(originalWidthCenter, 310, 'logoO');
		logoO.anchor.set(0.5);
		container.addChild(logoO);

		// header
		var headerHeight = 100;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			alpha: 0,
		});

		// Draw components
		if(config.isPlayer){
			drawMobile();
		} else {
			drawStage();
		}

		if(config.isLocal){
			// drawTest();
		}
	}

	function drawMobile(){
		var buttonOptions = {
	    	color: 0xe2e2e2,
	    	textColor: 0x000000,
	    	colorOver: 0x000000,
	    	textColorOver: 0xe1e1e1,
			format: {
		        font: "bold 44px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0x000000,
			radius: 5,
	    };
		btnBecomeStage = new MenuButton(0, 746, 486, 128, _.extend({ callback: handleBecomeStageClicked, text: "CREATE A GAME" }, buttonOptions));

		// texts
		var textsFormat = {
			font: "27px Montserrat",
	        fill: "#000000",
	        align: "center"
		};
		var textJoin = game.add.text(0, 420, 'JOIN THE GAME', textsFormat);
		textJoin.anchor.set(0.5);
		var textOr = game.add.text(0, 650, 'OR', textsFormat);
		textOr.anchor.set(0.5);

		// Group buttons
		buttons = game.add.group();
		buttons.add(btnBecomeStage);
		
		buttons.add(textJoin);
		buttons.add(textOr);

		buttons.x = originalWidthCenter;
		buttons.y = 0;

    	container.addChild(buttons);

    	// input
    	$('<form>')
    		.submit(function(event){
    			event.preventDefault();
    		})
    		.appendTo('body');
		$('<style>')
    		.appendTo('form')
    		.text('input::-webkit-input-placeholder { font-size: 60 }');
		if(detector.os() && detector.os().toLowerCase().indexOf('android') === -1){
			$('<button type="submit">')
				.css({
					position: 'absolute',
					margin: -1000,
				})
				.click(function(event){
					event.preventDefault();
				})
				.appendTo('form');
		}
    	$('<input id="tbxJoin" type="text">')
    		.appendTo('form')
    		.addClass('tbxJoin')
    		.css({
				position: 'absolute',
				'background-color': common.toRgb(_.sample(palette)),
				'text-align': 'center',
				'font-family': 'Montserrat, FontAwesome'
    		})
    		.attr('placeholder', '\uf064')
    		.focusout(onJoinTextFocusOut)
    		.focusin(onJoinTextFocusIn)
    		.keydown(onJoinTextKeyDown)
    		.keyup(onJoinTextChange)
    		.change(onJoinTextChange);
		if(detector.os() && detector.os().toLowerCase().indexOf('android') === -1){
			$('#tbxJoin').on('touchstart', function() {
		  		$(this).attr('type', 'number');
			});
			$('#tbxJoin').on('blur', function() {
		  		$(this).attr('type', 'text');
			});
		}
	}

	function drawStage(){
		var textsFormat = {
			font: "50px Montserrat",
	        fill: "#000000",
	        align: "center"
		};
		var stageText = game.add.text(originalWidthCenter, originalHeightCenter, 'Connecting to Game Server', textsFormat);
		stageText.anchor.set(0.5);
		container.addChild(stageText);
	}

	function drawHelp(){
		var title = game.add.text(originalWidthCenter, 100, 'HELP ME', {
			font: "bold 50px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
	    title.anchor.set(0.5);

	    var text = "1. Enter the address\n" + 
	    	"   SPEEZ.CO from any\n" + 
	    	"   Device - (PC/Smartphone\n" +
	    	"   Tablet) and\n" +
	    	"   CREATE A GAME.\n" +
	    	"\n" +
	    	"2. Enter the address\n" +
	    	"    SPEEZ.CO from any\n" +
	    	"    other Device and\n" + 
	    	"    JOIN THE GAME.\n";
	    var helpText = game.add.text(0, 200, text, {
			font: "bold 35px Montserrat",
	        fill: "#ffffff",
	        align: "left"
		});
		helpText.x = originalWidthCenter - helpText.width/2;

		var btnVideo = new MenuButton(originalWidthCenter, 705, 324, 64, {
	    	color: 0x1e1e1e,
	    	textColor: 0xffffff,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px FontAwesome",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: '\uf16a',
			callback: handleHelpVideoClicked,
	    });

		var btnContinue = new MenuButton(originalWidthCenter, 830, 324, 96, {
	    	color: 0x009bff,
	    	textColor: 0x1e1e1e,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'GOT IT',
			callback: handleHelpContinueClicked,
	    });

		help = new com.speez.components.PauseScreen(originalWidth, originalHeight);
		game.add.existing(help);
	    help.container.addChild(title);
	    help.container.addChild(helpText);
		help.container.addChild(btnContinue);
		help.container.addChild(btnVideo);
	}

	function drawTest(){
		btnTestPlayer = new MenuButton(logo.x, logo.y, 300, 60, _.extend({ callback: handleTestingPlayerClicked, text: "T.P" }));
		btnTestStage = new MenuButton(logo.x, logo.y + 60, 300, 60, _.extend({ callback: handleTestingStageClicked, text: "T.S" }));
		game.add.existing(btnTestPlayer);
		game.add.existing(btnTestStage);
	}

	function avatarAnimation(){
		if(avatarTimeline){
			avatarTimeline.kill();
		}
		avatarTimeline = new TimelineMax({ onComplete: function(item){
			item.timeline.kill();
			item.destroy();
		}, onCompleteParams: [avatar] });
		if(avatar){
			avatarTimeline.to(avatar, 1, { alpha: 0, ease: Elastic.easeIn });
		}

		avatar = game.add.sprite(originalWidthCenter, 250, _.sample(avatarNames) + '_head');
		avatar.alpha = 0;
		avatar.anchor.set(0.5);
		container.addChild(avatar);

		avatar.timeline = new TimelineMax({ repeat: -1, yoyo: true });
		avatar.timeline.to(avatar, 1, { y: '-=20', ease: Power2.easeInOut });
		
		avatarTimeline.to(avatar, 1, { alpha: 1, ease: Elastic.easeOut });
		avatarTimeline.add(avatarAnimation, 4);
	}

	function onJoinTextFocusOut(event){
		Layout.instance.enable = true;
		_.delay(function(){
			Layout.instance.resize(game.width, game.height);
		}, 2000);
		$('#tbxJoin')
			.removeClass('focus')
			.attr('placeholder', '\uf064');
	}

	function onJoinTextFocusIn(event){
		Layout.instance.enable = false;
		$('#tbxJoin')
			.addClass('focus')
			.removeClass('error')
			.attr('placeholder', 'ENTER GAME NUMBER');
	}

	function onJoinTextKeyDown(event){
	}

	function onJoinTextChange(event){
		if(event.keyCode === 13){
			$('#tbxJoin').blur();
			event.preventDefault();
			var id = parseInt($('#tbxJoin').val());
			if(id === 999 && !btnTestPlayer){
				drawTest();
			} else if(id) {
				socket.emit('speed:join', { id: id }, handleJoin);
				toggleButtons(false);
			}
			return;
		}

		var val = $('#tbxJoin').val().replace(/[^0-9]/g, "").substring(0, 4);
		$('#tbxJoin').val(val);
		return val;
	}

	function removeDom(){
		$('form').remove();
	}

	function onAreaResized(){
		var width = 466 * Layout.instance.minScale;
		var height = 144 * Layout.instance.minScale;
		var x = container.x + (originalWidthCenter - 5) * Layout.instance.minScale - width * 0.5;
		var y = container.y + 530 * Layout.instance.minScale - height * 0.5;
		$('#tbxJoin').css({ 
			left: x + 'px',
			top: y + 'px',
			width: width * (detector.mobile() && detector.os().toLowerCase() === 'ios' ? 0.9 : 1) +'px',
			height: height * (detector.mobile() && detector.os().toLowerCase() === 'ios' ? 0.9 : 1) + 'px',
			'border-width': (5 * Layout.instance.minScale) + 'px',
			'font-size': (60 * Layout.instance.minScale) + 'px', 
			'line-height': (80 * Layout.instance.minScale) + 'px', 
		});
		$('form style')
			.text('input::-webkit-input-placeholder {font-size:' + (60 * Layout.instance.minScale) + 'px}\n' +
				'input.focus::-webkit-input-placeholder {font-size:' + (33 * Layout.instance.minScale) + 'px}\n' +
				'input.error::-webkit-input-placeholder {font-size:' + (33 * Layout.instance.minScale) + 'px}');
	}

	function getRandomTime(number, from, to){
		return number + _.random(from, to);
	}

	function onQuestionClicked(){

	}

	function toggleButtons(on){
		$('#tbxJoin').prop('disabled', !on);
		buttons.callAll('setEnable', null, on);
	}

	function disappear(){
		var timeline = new TimelineMax();
		timeline.to(container, 0.1, { alpha: 0 });
		return timeline;
	}

	// gui handlers

	function handleBecomeStageClicked(){
		toggleButtons(false);
		game.state.start('lobby');
	}

	function handleHelpClicked(){
		toggleButtons(false);
		$('form').hide();
		drawHelp();
	}

	function handleHelpVideoClicked(){
		common.open('https://www.youtube.com/watch?v=meak65zqfGE');
	}

	function handleHelpContinueClicked(){
		toggleButtons(true);
		$('form').show();
		help.destroy();
	}

	function handleTestingPlayerClicked(){
		// mockup
		var colors = [0xbf00d8, 0xd84100, 0xdbaf00, 0xa1ff00, 0x00c8cc, 0x0065bf];
		colors = _.shuffle(colors);
		player = {
			winner: true,
			name: 'Zeeps',
			game: {
				boardCount: 4,
				hand: [],
				boards: [
					{ color: colors[0] },
					{ color: colors[1] },
					{ color: colors[2] },
					{ color: colors[3] },
				],
				cardCount: 6,
				cardTotal: 6,
			},
			avatar: 'Zeeps',
		}
		player.game.hand.push(1);
		player.game.hand.push(_.random(0,9));
		player.game.hand.push(_.random(0,9));
		player.game.hand.push(_.random(0,9));
		player.game.hand.push(1);
		player.game.hand.push(_.random(0,9));
		// set test
		config.isTest = true;
		setTimeout(function(){
			game.state.start('player');
		}, 1);
	}

	function handleTestingStageClicked(){
		stage = {
			game: {
				boardCount: 4,
				boards: [],
			},
		}
		for(var i = 0; i < stage.game.boardCount; i++){
			stage.game.boards[i] = {
				current: _.random(0, 9),
				previous: [],
			}
		}
		config.isTest = true;
		setTimeout(function(){
			game.state.start('stage');
		}, 1)
	}

	// socket handlers

	function handleJoin(data){
		console.log('handleJoin:', data);
		if(!data.confirm){
			$('#tbxJoin')
				.blur()
				.val('')
				.addClass('error')
				.attr('placeholder', 'GAME NOT FOUND');
			toggleButtons(true);
			return;
		}
		player = {
			id: data.id,
			name: data.name,
			stageId: data.stageId,
			block: data.block,
			fazt: data.fazt,
			avatar: data.avatar,
		}
		$('#tbxJoin').remove();
		game.state.start('lobbyPlayer');
	}

	return {

		preload: function() {
			// common.flipOrientation('landscape');
			common.flipOrientation('portrait');

			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
		},

		create: function(){
			// Draw things
			drawGui();
			_.delay(avatarAnimation, 200);
			common.addLogo('logo', menuArea);
			common.addLogo('beta', menuArea);
			common.addLogo('feedback', menuArea);

	  		Layout.instance.resize(game.width, game.height);

	  		gameCount = 0;
		},

		shutdown: function(){
			removeDom();
			if(avatarTimeline){
				avatarTimeline.kill();
			}
		},

		resize: function (width, height) {
	        //  This could be handy if you need to do any extra processing if the game resizes.
	        //  A resize could happen if for example swapping orientation on a device.
	        console.log('gameResized');

    	},

	}

})();;// player.js

var playerState = (function(){

	// data
	var state;
	var isReady;
	var winnerColor;

	// gui
	var footer;
	var header;
	var boards;
	var hand;
	var colors;
	var playerArea;
	var container;

	// timeline
	var screenTimeline;

	var headerHeight;
	var gameHeight;
	var barHeight;
	var boardMiddle;
	var boardWidth;
	var boardWidthCenter;
	var boardWidthRight;
	var cardHeight;

	var achieveText;
	var achieveSymbol;

	var nextCard;
	var overlapCard;
	var sightedCards;
	var heldCards = [];

	var winnerText;
	var btnReady;

	var btnContinue;
	var btnExit;
	var pause;

	function drawGui(){
		// sizes
		headerHeight = originalHeight * 0.125;
		barHeight = 25;
		gameHeight = originalHeight - headerHeight - barHeight;
		gameHeightCenter = gameHeight / 2;
		boardMiddle = gameHeightCenter + headerHeight;
		boardWidth = 150;
		boardWidthCenter = boardWidth * 0.5;
		boardWidthRight = originalWidth - boardWidth;
		cardHeight = gameHeight / 5;
		cardWidth = originalWidth - boardWidth * 2;

		// Content
		playerArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		playerArea.attach(container, { width: originalWidth, height: originalHeight });

		hand = [];
		for(var i = 0; i < 5; i++){
			var index = i % 5;
			var card = drawCard(player.game.hand[index], index, true, i > player.game.cardCount);
			hand[index] = card;
		}

		// header
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			text: getHeaderText(),
			alpha: 0,
		});
		var headerButton = game.add.text(50, headerHeight * 0.5, '\uf04c', {
			font: "65px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
		headerButton.anchor.set(0.5);
	    headerButton.inputEnabled = true;
	    headerButton.events.onInputDown.add(handlePauseClicked);
		header.addLeft(headerButton);
		var avatar = game.add.sprite(-50, headerHeight * 0.5, player.avatar + '_head');
		avatar.scale.set(0.4);
		avatar.anchor.set(0.5);
		header.addRight(avatar);

		// footer
		var barHeightGap = 10;
		footer = new com.speez.components.PlayerCardBar(0, originalHeight - (barHeight - barHeightGap), originalWidth, barHeight - barHeightGap);
		setFooter();
	}

	function drawBoards(){
		destroyBoards();
		boards = [];
		colors = [];
		for (var i = 0; i < player.game.boards.length; i++) {
			colors.push(player.game.boards[i].color);
		};
		switch(player.game.boards.length) {
			case 2:
				boards[0] = new com.speez.components.PlayerBoard(0, headerHeight, boardWidth, gameHeight, colors[0]);
				boards[1] = new com.speez.components.PlayerBoard(boardWidthRight, headerHeight, boardWidth, gameHeight, colors[1]);
				// colors
				colors[2] = colors[0];
				colors[3] = colors[1];
				break;
			case 3:
				boards[0] = new com.speez.components.PlayerBoard(0, headerHeight, boardWidth, gameHeightCenter, colors[0]);
				boards[1] = new com.speez.components.PlayerBoard(boardWidthRight, headerHeight, boardWidth, gameHeight, colors[1]);
				boards[2] = new com.speez.components.PlayerBoard(0, boardMiddle, boardWidth, gameHeightCenter, colors[2])
				// colors
				colors[3] = colors[1];
				break;
			case 4:
				boards[0] = new com.speez.components.PlayerBoard(0, headerHeight, boardWidth, gameHeightCenter, colors[0]);
				boards[1] = new com.speez.components.PlayerBoard(boardWidthRight, headerHeight, boardWidth, gameHeightCenter, colors[1]);
				boards[2] = new com.speez.components.PlayerBoard(0, boardMiddle, boardWidth, gameHeightCenter, colors[2]);
				boards[3] = new com.speez.components.PlayerBoard(boardWidthRight, boardMiddle, boardWidth, gameHeightCenter, colors[3]);
				break;
		}
	}

	function destroyBoards(){
		if(!boards){
			return;
		}
		_.each(boards, function(board){
			board.destroy();
		});
	}

	function drawPause(){
		var text = game.add.text(originalWidthCenter, 215, 'PAUZE', {
			font: "bold 50px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
	    text.anchor.set(0.5);

		btnContinue = new MenuButton(originalWidthCenter, 470, 486, 144, {
	    	color: 0x009bff,
	    	textColor: 0x1e1e1e,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'CONTINUE',
			callback: handleContinueClicked,
	    });

	    btnExit = new MenuButton(originalWidthCenter, 680, 486, 128, {
	    	color: 0x1e1e1e,
	    	textColor: 0xffffff,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'END GAME',
			callback: handleExitClicked,
	    });

		pause = new com.speez.components.PauseScreen(originalWidth, originalHeight);
		game.add.existing(pause);
		pause.container.addChild(text);
		pause.container.addChild(btnExit);
		pause.container.addChild(btnContinue);
	}

	function drawAchieveText(text){
		if(achieveText){
			achieveText.destroy();
		}
		achieveText = new Phaser.Text(game, 0, headerHeight - 25, text, {
			font: "40px Montserrat",
	        fill: "#f2cb42",
	        align: "center"
		});
		achieveText.anchor.set(0.5);
		header.addCenter(achieveText);
		return achieveText;
	}

	function drawSymbol(text){
		if(achieveSymbol){
			achieveSymbol.destroy();
		}
		achieveSymbol = new Phaser.Text(game, -50, headerHeight * 0.5, text, {
			font: "80px FontAwesome",
	        fill: "#f2cb42",
	        align: "center"
		});
		achieveSymbol.anchor.set(0.5);
		header.addRight(achieveSymbol);
		return achieveSymbol;
	}

	function onScrew(data){
		player.block++;
		player.points += data.points;
		drawAchieveText('YOU BLOCKED ' + data.data.screw);
		achieveText.alpha = 0;
		var timeline = new TimelineMax();
		timeline.to(achieveText, 0.75, { alpha: 1 }, 0);
		timeline.to(achieveText, 0.75, { alpha: 0 }, 3);
	}

	// handle gui

	function handlePauseClicked(){
		drawPause();
		_.invoke(hand, 'enable', false);
		// TweenMax.pauseAll();
		// socket.emit('speed:player:pause');
	}

	function handleStageReady(){
		if(config.isTest){
			setTest();
			return;
		}

		socket.emit('speed:player:loaded');
	}

	function handleCardPickedUp(card){
		heldCards[card.index] = card;
		Audio.instance.play('fx', 'card/pickup');
		if(state === 'play'){
			_.invoke(boards, 'setArrow');
		}
		sightedCards = [];
		_.each(hand, function(cardInHand){
			if(!cardInHand || cardInHand === card || !cardInHand.faceup){
				return;
			}
			cardInHand.reject();
			if(compareCards(cardInHand.card, card.card)){
				// card.setOverlapSighted();
				cardInHand.setOverlapSighted();
				sightedCards.push(cardInHand);
			}
		});
		// create a beneath card
		destroyNext();
		nextCard = drawCard(null, card.index, false, player.game.cardCount <= 5);
	}

	function handleCardPutDown(card){
		delete heldCards[card.index];
		_.invoke(boards, 'cancelArrow');
		overlapCard = null;
		_.each(sightedCards, function(sightedCard){
			sightedCard.cancelOverlapSighted();
		});
		if(card.thresholdHit !== undefined && state === 'play'){
			_.invoke(hand, 'enable', false);
			placeCardBoard(card, card.thresholdHit)
			Audio.instance.play('fx', 'card/placeBoard');
		} else if(card.overlap !== null && hand[card.overlap] && compareCards(card.card, hand[card.overlap].card) && hand[card.overlap].faceup){
			_.invoke(hand, 'enable', false);
			placeCardOverlap(card, card.overlap);
			Audio.instance.play('fx', 'card/placeOverlap');
		} else {
			card.returnCard();
			destroyNext();
			Audio.instance.play('fx', 'card/return');
		}
	}

	function placeCardBoard(card, thresholdId){
		card.placeCardBoard();
		var boardId = getBoard(thresholdId);
		board = boards[boardId];
		board.setCard();
		if(config.isTest){
			testCardPutBoard({ boardId: boardId, handId: card.index });
			return;
		}
		socket.emit('speed:player:cardBoard', { boardId: boardId, handId: card.index }, handleCardBoard);
	}

	function placeCardOverlap(card, overlap){
		card.placeCardOverlap();
		if(config.isTest){
			testCardPutOverlap(card, overlap);
			return;
		}
		socket.emit('speed:player:cardOverlap', { overlapId: overlap, handId: card.index }, handleCardOverlap);
	}

	function handleCardOverlapped(card, overlap){
		if(overlapCard){
			_.invoke(boards, 'cancelProximity')
			overlapCard.cancelOverlapped();
			card.cancelOverlapping();
		}
		overlapCard = null;
		if(overlap === undefined){
			return;
		}
		var targetCard = hand[overlap];
		if(!targetCard || !targetCard.faceup || !compareCards(targetCard.card, card.card)){
			if(state === 'play'){
				_.invoke(boards, 'setArrow');
			}
			return;
		}
		overlapCard = targetCard;
		overlapCard.setOverlapped();
		card.setOverlapping();
		_.invoke(boards, 'cancelArrow');
		_.invoke(boards, 'setProximity', false)
	}

	function handleCardProximity(card, threshold){
		if(state !== 'play'){
			return;
		}
		_.invoke(boards, 'cancelProximity');
		if(threshold === undefined){
			_.invoke(boards, 'setArrow');
			card.cancelProximity();
		} else {
			_.invoke(boards, 'cancelArrow');
			_.invoke(boards, 'setProximity', false);
			var board = boards[getBoard(threshold)];
			board.setProximity(true);
			board.setArrow();
			card.setProximity(board.options.color);
		}
	}

	function setPlay(){
		state = 'play';
		var keys = _.keys(heldCards);
		if(keys.length === 0){
			return;
		}
		if(overlapCard){
			return;
		}
		_.each(keys, function(key){
			var card = heldCards[key];
			handleCardProximity(card, card.thresholdHit);
		});
	}

	function setSpeedy(){
		state = 'speedy';
		var keys = _.keys(heldCards);
		if(keys.length === 0){
			return;
		}
		_.invoke(boards, 'cancelProximity');
		_.invoke(boards, 'cancelArrow');
		_.each(keys, function(key){
			var card = heldCards[key];
			card.cancelProximity();
		});
	}

	function onWinnerComplete(){
		if(config.isTest){
			handleNext();
			return;
		}
		socket.emit('speed:player:next');
	}

	function handleReadyClicked() {
		isReady = !isReady;

		if(isReady){
			btnReady.setText('\uf058');
			btnReady.options.color = 0x36de4a;
			btnReady.options.colorOver = winnerColor;
		} else {
			btnReady.setText("I'M READY");
			btnReady.options.color = winnerColor;
			btnReady.options.colorOver = 0x36de4a;
		}

		var timeline = new TimelineMax();
		timeline.add(common.tweenStageColor(isReady ? 0x36de4a : winnerColor, function(){
			socket.emit('speed:player:ready', { isReady: isReady });
		}, 0.75), 0);
		timeline.add(btnReady.tweenColor(isReady ? 0x36de4a : winnerColor, 0xffffff), 0);

		if(config.isTest){
		}
	}

	function handleContinueClicked(){
		pause.destroy();
	}

	function handleExitClicked(){
	 	if(!confirm("Are you sure?")){
	        return;
	    };
		_.each(pause.container.children, function(item){
			if(item.setEnable){
				item.setEnable(false);
			}
		});
		socket.emit('speed:player:leave', handleLeave);
	}

	// handling socket

	function handleStart(data){
		console.log('handleStart:', data);
		drawGui();

		// animation start
		var timeline = new TimelineLite({ delay: 1 });
		timeline.add(_.invoke(hand, 'startCard'), 0, null, 0);
		timeline.add(_.invoke(hand, 'appearCard', false), null, null, 0.2);
		if(config.isTest){
			timeline.timeScale(9);
		}

		if(config.isTest){
			var colors = _.shuffle([0xbf00d8, 0xd84100, 0xdbaf00, 0xa1ff00, 0x00c8cc, 0x0065bf]);
			var testBoards = [];
			testBoards[0] = { color: colors.pop()};
			testBoards[1] = { color: colors.pop()};
			testBoards[2] = { color: colors.pop()};
			testBoards[3] = { color: colors.pop()};
			timeline.vars.onComplete = handlePlay;
			timeline.vars.onCompleteParams = [testBoards];
		}
	}

	function handlePlay(data){
		console.log('handlePlay:', data);

		player.game.boards = data;
		drawBoards();
		var timeline = new TimelineMax();
		timeline.add(_.invoke(boards, 'appear', 0x333333));
		timeline.add(setPlay, timeline.totalDuration() / 2);

		if(config.isTest){
			// timeline.add(handleSpeedy, 15);
		}
	}

	function handleSpeedy(data){
		console.log('handleSpeedy:', data);
		if(state === 'finish'){
			return;
		}
		setSpeedy();
		var timeline = new TimelineMax();
		timeline.add(_.invoke(boards, 'disappear'));

		if(config.isTest){
			var colors = _.shuffle([0xbf00d8, 0xd84100, 0xdbaf00, 0xa1ff00, 0x00c8cc, 0x0065bf]);
			var testBoards = [];
			testBoards[0] = { color: colors.pop()};
			testBoards[1] = { color: colors.pop()};
			testBoards[2] = { color: colors.pop()};
			testBoards[3] = { color: colors.pop()};
			timeline.vars.onComplete = handlePlay;
			timeline.vars.onCompleteParams = [testBoards];
		}
	}

	function handleCardOverlap(data) {
		console.log('handleCardOverlap:', data);
		if(state === 'finish'){
			return;
		}
		_.invoke(hand, 'enable', true);
		_.invoke(boards, 'cancelProximity');
		if(!data.confirm){
			destroyNext();
			_.invoke(hand, 'reject')
			Audio.instance.play('fx', 'card/reject');
			return;
		}
		player.points += data.points;
		// create new card
		destroyCard(hand[data.handId]);
		hand[data.overlapId].overlapComplete();
		player.game.cardCount--;
		hand[data.handId] = nextCard;
		nextCard.card = data.newCard;
		var timeline = nextCard.startCard();
		if(player.game.cardCount < 5){
			nextCard.enable(false);
		} else {
			timeline.add(nextCard.appearCard())
		}
		nextCard = null;
		timeline.add(setFooter(), 0);
		Audio.instance.play('fx', 'card/overlapSuccess');
	}

	function handleCardBoard(data){
		console.log('handleCardBoard:', data);
		if(state === 'finish'){
			return;
		}
		_.invoke(boards, 'cancelCard');
		_.invoke(boards, 'cancelProximity');
		if(!data.confirm){
			if(navigator.vibrate){
				navigator.vibrate(2500);
			}
			// reject
			destroyNext();
			_.invoke(hand, 'reject')
			var timeline = new TimelineLite();
			var color = boards[data.boardId].options.color;
			var isLeft = data.boardId % 2 === 0;
			timeline.add(hand[data.handId].shake(isLeft, color));
			timeline.add(hand[data.handId].shake(isLeft, color), '-=' + hand[data.handId].options.shakeTime * 0.75);
			timeline.add(hand[data.handId].shake(isLeft, color), '-=' + hand[data.handId].options.shakeTime * 0.75);
			timeline.add(function(){
				_.invoke(hand, 'enable', true);
			});
			// timeline.add(_.invoke(hand, 'shake', isLeft, color), null, null, 0.05);
			// timeline.add(_.invoke(hand, 'shake'), '-=0.75', null, 0.05);
			Audio.instance.play('fx', 'card/boardFailed');

			// add screw
			if(data.screw){
				drawAchieveText(data.screw + ' BLOCKED YOU');
				drawSymbol('\uf05e');
				achieveText.alpha = 0;
				achieveSymbol.alpha = 0;
				if(screenTimeline){
					screenTimeline.kill();
				}
				screenTimeline = new TimelineMax();
				screenTimeline.to([achieveText, achieveSymbol], 0.75, { alpha: 1 });
				screenTimeline.add(common.tweenStageColor(0x730d01, null, 0.75), 0);
				screenTimeline.addLabel('screwOver', 4);
				screenTimeline.to([achieveText, achieveSymbol], 0.75, { alpha: 0 }, 'screwOver');
				screenTimeline.add(common.tweenStageColor(0x1E1E1E, 0.75), 'screwOver-=1');
				timeline.add(screenTimeline, 0);
			}
			return;
		}
		player.points += data.points;
		// create new card
		var board = boards[data.boardId];
		board.setCardSuccess();
		_.invoke(hand, 'enable', true);
		destroyCard(hand[data.handId]);
		player.game.cardCount--;
		hand[data.handId] = nextCard;
		nextCard.card = data.newCard;
		var timeline = nextCard.startCard();
		if(player.game.cardCount < 5){
			nextCard.enable(false);
		} else {
			timeline.add(nextCard.appearCard())
		}
		nextCard = null;
		timeline.add(setFooter(), 0);

		if(data.fazt){
			player.fazt++;
			drawAchieveText('FAZT ONE');
			drawSymbol('\uf0e7');
			achieveText.alpha = 0;
			achieveSymbol.alpha = 0;
			achieveSymbol.x -= 30;
			if(screenTimeline){
				screenTimeline.kill();
			}
			screenTimeline = new TimelineMax();
			screenTimeline.to([achieveText, achieveSymbol], 0.75, { alpha: 1 });
			screenTimeline.add(common.tweenStageColor(0x710072, null, 0.75), 0);
			screenTimeline.addLabel('faztOver', 4);
			screenTimeline.to([achieveText, achieveSymbol], 0.75, { alpha: 0 }, 'faztOver');
			screenTimeline.add(common.tweenStageColor(0x1E1E1E, 0.75), 'faztOver-=1');
			timeline.add(screenTimeline, 0);
		}

		Audio.instance.play('fx', 'card/boardSuccess');
	}

	function handleAchievement(data){
		console.log('handleAchievement:', data);
		var achievement = data.achievement;
		switch(achievement){
			case 'screw':
				onScrew(data);
				break;
		}
	}

	function handleLeave(data){
		console.log('handleLeave:', data);
		delete player;
		Audio.instance.stop('fx');
		TweenMax.killAll();
		var timeline = new TimelineLite();
		timeline.to(_.flatten([hand, boards, container, header]), 1, {alpha: 0});
		timeline.add(common.tweenStageColor(0x000000, function(){
			setTimeout(function(){ 
				game.state.start('main'); 
			}, 500);
		}));
	}

	function handleWinner(data){
		console.log('handleWinner:', data);
		state = 'finish';
		var timeline = new TimelineLite({ delay: 1, onComplete: onWinnerComplete });
		var dissipateTime = 1;
		player.game.winner = data.winner;
		player.points += data.points;

		destroyNext();
		
		footer.flash(0);	
		_.invoke(hand, 'reject');
		_.invoke(hand, 'enable', false);
		timeline.add(_.invoke(boards, 'disappear'));
		timeline.to(hand, dissipateTime, { alpha: 0 }, 'dissipate');

		_gaq.push(['_trackEvent', 'speez', 'player', 'end' + gameCount]);
	}

	function handleNext(data){
		console.log('handleNext:', data);

		winnerText = game.add.text(originalWidthCenter, originalHeightCenter, 'TEST', {
			font: "100px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
		winnerText.alpha = 1;
		winnerText.anchor.set(0.5);
		container.addChild(winnerText);

		var sound;
		var timeline = new TimelineMax();
		if(player.game.winner){
			winnerText.text = 'YOU WIN';
			winnerColor = 0x009bff;
			sound = 'win/win';
		} else {
			winnerText.text = 'YOU LOSE';
			winnerColor = 0xcc1801;
			sound = 'lose/lose';
		}
		Audio.instance.play('fx', sound);

		var distance = 70;
		var pointsText = game.add.text(originalWidthCenter, 320, player.points.toString(), {
			font: "70px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
		pointsText.anchor.set(0.5);

		var line = game.add.graphics();
		line.beginFill(0xffffff);
		line.drawRoundedRect(originalWidthCenter - 270 / 2, 380, 270, 15, 25);

		var blockText = game.add.text(originalWidthCenter + distance, 480, player.block.toString(), {
			font: "55px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
		blockText.anchor.set(0.5);
		var blockSymbol = game.add.text(originalWidthCenter - distance, 480, '\uf05e', {
			font: "100px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
		blockSymbol.anchor.set(0.5);

		var faztText = game.add.text(originalWidthCenter + distance, 610, player.fazt.toString(), {
			font: "55px Montserrat",
	        fill: "#ffffff",
	        align: "center"
		});
		faztText.anchor.set(0.5);
		var faztSymbol = game.add.text(originalWidthCenter - distance, 610, '\uf0e7', {
			font: "100px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
		faztSymbol.anchor.set(0.5);

		var all = [pointsText, line, blockText, blockSymbol, faztText, faztSymbol ];
		_.each(all, function(item){
			item.alpha = 0;
			container.addChild(item);
		})

		timeline.add(common.tweenStageColor(winnerColor, null, 0.75), 0);
		timeline.to(winnerText, 0.75, { alpha: 1 }, 0);
		timeline.addLabel('delay', '+=3');
		timeline.to(all, 2, { alpha: 1 });

		if(config.isTest){
			timeline.add(function(){
				handleNextLobby();
			}, 2);
		}
	}

	function handleNextLobby(data){
		console.log('handleNextLobby:', data);

		var buttonOptions = {
	    	color: winnerColor,
	    	textColor: 0xffffff,
	    	colorOver: 0x269e34,
	    	textColorOver: 0xffffff,
	    	colorDown: 0x36de4a,
			format: {
		        font: "bold 44px Montserrat, FontAwesome",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0x000000,
			radius: 10,
	    }
		btnReady = new MenuButton(originalWidthCenter, 820, 476, 154, _.extend({ callback: handleReadyClicked, text: "I'M READY" }, buttonOptions));
		btnReady.alpha = 0;
		container.addChild(btnReady);

		var timeline = new TimelineMax();
		timeline.to(btnReady, 2, { alpha: 1 });
	}

	function handleLoad(data){
		console.log('handleLoad:', data);

		player.game = data;
		player.game.cardTotal = player.game.cardCount;
		
		game.state.start('player');
	}

	// other

	function getStreakName(level){
		switch(level){
			case 1:
				return 'Great';
			case 2:
				return 'Amazing';
			case 3:
				return 'AWESOME';
		}
	}

	function compareCards(card1, card2){
		return card1 === card2;
	}

	function destroyNext(){
		if(!nextCard){
			return;
		}
		nextCard.destroy();
	}

	function destroyCard(card){
		card.enable(false);
		_.delay(function(){
			card.destroy();
		}, card.options.placeCardTime * 1000);
	}

	function drawCard(card, index, isNew, isEmpty){
		if(state === 'finish'){
			return;
		}
		var card = new com.speez.components.Card(index, 
			boardWidth, cardHeight * index + headerHeight, 
			cardWidth, cardHeight, {
				colors: colors,
				waitCard: isEmpty ? 'speez'[index] : '+',
				textColor: isEmpty ? 0x222222 : 0xeeeeee,
				isNew: isNew,
				card: card,
				dragStartCallback: handleCardPickedUp,
				dragStopCallback: handleCardPutDown,
				heightOffset: headerHeight,
			}
		);
		card.overlapped.add(handleCardOverlapped);
		card.proximity.add(handleCardProximity);
		if(!isNew){
			card.options.startTime = 0.5;
			card.options.spinTime = 0.5;
		}
		// container.addChild(card);
		return card;
	}

	function getBoard(boardId){
		if(player.game.boards.length === 2 && boardId === 2){
			return 0;
		} 
		if(player.game.boards.length === 2 && boardId === 3){
			return 1;
		}
		if(player.game.boards.length === 3 && boardId === 3){
			return 1;
		} 
		return boardId;
	}

	function getHeaderText(){
		return player.name;
	}

	function setFooter(){
		var timeline = new TimelineMax();
		footer.setProgress(1 - player.game.cardCount / player.game.cardTotal);
		if(player.game.cardCount !== 5 && player.game.cardCount !== 1){
			return timeline;
		}
		var text = player.game.cardCount === 1 ? 'LAST CARD' : 'LAST 5 CARDS';
		drawAchieveText(text);
		achieveText.alpha = 0;
		timeline.to(achieveText, 0.75, {alpha: 1});
		timeline.to(achieveText, 0.75, {alpha: 0}, 4);
		footer.flash(player.game.cardCount);
		Audio.instance.play('fx', 'achievement/last' + player.game.cardCount);
		return timeline;
	}

	// test

	function setTest(){
		handleStart();
		game.input.keyboard.onPressCallback = function(key, event){
			switch(event.charCode){
				case 113:
					handleAchievement({ achievement: 'screw', data: { screw: 'ZoZo' } });
					break;
				case 50: 
					handleAchievement({ achievement: 'test', data: { isGood: true } });
					break;
			}
		}
	}

	function testCardPutOverlap(card, overlapId){
		handleCardOverlap({ confirm: true, newCard: _.random(0, 9), handId: card.index, overlapId: overlapId, newOverlapCard: card.card, points: 50 });
	}

	function testCardPutBoard(data){
		var boardId = data.boardId;
		var returnData = _.pick(data, ['boardId', 'handId']);
		if(boardId % 2 === 0){
			var newCard = _.random(0, 9);
			if(player.game.cardCount === 6){
				// handleAchievement({ achievement: 'last', data: { count: 5 } });
			} else if(player.game.cardCount === 2){
				// handleAchievement({ achievement: 'last', data: { count: 1 } });
			}
			if(boardId === 0){
				handleCardBoard(_.extend({ confirm: true, newCard: newCard, fazt: _.random(0,1) > 0.5 ? true : false, points: 100 }, returnData));
				if(player.game.cardCount === 0){
					setTimeout(function(){
						handleWinner({winner: true, points: 1000});
					}, 10);
				}
			} else {
				setTimeout(function(){ 
					handleCardBoard(_.extend({ confirm: true, newCard: newCard, points: 100 }, returnData));
					if(true || player.game.cardCount === 0){
						setTimeout(function(){
							handleWinner({winner: false, points: 0});
						}, 10);
					}
				}, 1000);
			}
			return;
		}
		if(boardId === 3){
			setTimeout(function(){
				handleCardBoard(_.extend({ confirm: false }, returnData));
			}, 1000);
		} else {
			handleCardBoard(_.extend({ confirm: false, screw: 'ZoZo' }, returnData));
		}
	}

	return {

		preload: function(){

			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);
		},

		create: function(){
			common.tweenStageColor(0x1E1E1E, handleStageReady);

			state = 'start';
			isReady = false;
			player.points = 0;
			player.block = 0;
			player.fazt = 0;

			gameCount++;
			_gaq.push(['_trackEvent', 'speez', 'player', 'start' + gameCount]);

			socket.on('speed:player:leave', handleLeave);
			socket.on('speed:player:speedy', handleSpeedy);
			socket.on('speed:player:play', handlePlay);
			socket.on('speed:player:start', handleStart);
			socket.on('speed:player:winner', handleWinner);
			socket.on('speed:player:achieve', handleAchievement);
			socket.on('speed:player:next', handleNext);
			socket.on('speed:player:nextLobby', handleNextLobby);
			socket.on('speed:player:load', handleLoad);
		},

		update: function(){
		},

		render: function(){
			if(config.isTest){
				game.debug.cameraInfo(game.camera, 32, 32);
			}
		},

		shutdown: function(){
			socket.off('speed:player:speedy', handleSpeedy);
			socket.off('speed:player:leave', handleLeave);
			socket.off('speed:player:play', handlePlay);
			socket.off('speed:player:start', handleStart);
			socket.off('speed:player:achieve', handleAchievement);
			socket.off('speed:player:winner', handleWinner);
			socket.off('speed:player:next', handleNext);
			socket.off('speed:player:nextLobby', handleNextLobby);
			socket.off('speed:player:load', handleLoad);
		},
	}
})();
;// playerFinish.js
var playerFinishState = (function(){
	// gui
	var header;
	var container;
	var finishArea;
	var textWin;
	var nextGameContainer;
	var textNextGame;
	var btnReady;

	// data
	var headerHeight;

	function drawGui(){		
		headerHeight = originalHeight * 0.125;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			text: player.name,
			color: 0xffffff,
		});

		finishArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, {isDebug:false});
		container = game.add.sprite();
		finishArea.attach(container, {width: originalWidth, height: originalHeight });

		textWin = game.add.text(originalWidthCenter, originalHeightCenter - 30, player.game.winner ? 'YOU\nWIN' : 'YOU\nLOSE', {
			font: "200px Arial",
	        fill: "#ffffff",
	        align: "center"
		});
		textWin.anchor.set(0.5, 0.5);
		textWin.alpha = 0;
		container.addChild(textWin);

		nextGameContainer = game.add.sprite(originalWidthCenter, originalHeightCenter + 250);
		nextGameContainer.alpha = 0;
		container.addChild(nextGameContainer);

		textNextGame = game.add.text(0, 0, 'Next Game:', {
			font: "25px Arial",
	        fill: "#ffffff",
	        align: "center"
		});
		textNextGame.anchor.set(0.5, 0.5);
		nextGameContainer.addChild(textNextGame);

		player.isReady = false;
		btnReady = new MenuButton(0, 50, 300, 60, 'Ready', handleReadyClicked, { anchorX: 0.5, anchorY: 0.5 })
		nextGameContainer.addChild(btnReady);
	}

	// gui handlers

	function handleReadyClicked(){
		player.isReady = !player.isReady;
		btnReady.setText(player.isReady ? 'Not Ready' : 'Ready');
		socket.emit('speed:player:ready', { isReady: player.isReady });
	}

	// socket handlers

	function handleNext(){
		Audio.instance.play('fx', player.game.winner ? 'win/win' : 'lose/lose');
		var timeline = new TimelineLite();
		timeline.to(textWin, 0.1, { alpha: 1 });
	}

	function handleNextLobby(){
		var timeline = new TimelineLite();
		timeline.to(nextGameContainer, 1, { alpha: 1, delay: 2 });
	}

	function handleLoad(data){
		player.game = data;
		player.game.cardTotal = player.game.cardCount;
		var timeline = new TimelineLite();
		timeline.add(common.tweenStageColor(0xffffff, function(){
			setTimeout(function(){ game.state.start('player'); }, 500);
		}));
		timeline.to(btnReady, 1, { alpha: 0 }, 0);
	}

	function handleLeave(data){
		console.log('handleLeave:', data);
		delete player;
		TweenMax.killAll();
		var timeline = new TimelineLite();
		timeline.to([header, container], 1, {alpha: 0});
		timeline.add(common.tweenStageColor(0x000000, function(){
			setTimeout(function(){ 
				game.state.start('main'); 
			}, 500);
		}));
	}

	return {
		preload: function(){
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);
		},

		create: function(){
			drawGui();

			if(config.isTest){
				handleNext();
				return;
			}
			socket.on('speed:player:load', handleLoad);
			socket.on('speed:player:next', handleNext);
			socket.on('speed:player:nextLobby', handleNextLobby);
			socket.emit('speed:player:next');
		},

		shutdown: function(){
			socket.off('speed:player:load', handleLoad);
			socket.off('speed:player:next', handleNext);
			socket.off('speed:player:nextLobby', handleNextLobby);
		}
	}

})();;// preload.js

var preloadState = (function(){

	// data
	var finished = 0;

	// gui
	var container;
	var preloaderArea;
	var textProgress;
	var data;

	function drawGui(){
        preloaderArea = new com.LayoutArea(0, 0, originalWidth, originalHeight);
		container = game.add.sprite();
		preloaderArea.attach(container, { width: originalWidth, height: originalHeight });
		// game.stage.backgroundColor = 0x1e1e1e;

		var logo = game.add.sprite(originalWidthCenter, originalHeightCenter * 0.5, 'logoGray');
		logo.anchor.set(0.5);
		container.addChild(logo);

		var logoO = game.add.sprite(originalWidthCenter, originalHeightCenter + 50, 'logoO');
		logoO.anchor.set(0.5);
		container.addChild(logoO);

		var avatar = game.add.sprite(originalWidthCenter, originalHeightCenter, 'preloadAvatar');
		avatar.anchor.set(0.5);
		container.addChild(avatar); 

        textProgress = game.add.text(originalWidthCenter, originalHeightCenter * 1.5, 'Preloading', { font: "bold 50px Montserrat", fill: "#58585a", align: "center" });
        textProgress.anchor.set(0.5);
		container.addChild(textProgress);

		data = { progress: 0 };

	}

	function updateProgress(){
		textProgress.text = Math.ceil(data.progress) + "%";
	}

	function setFinished(){
		if(++finished === 2){
			console.error('VERSION ' + config.version);
			console.error(config);
			if(config.isPlayer){
				game.state.start('main');
			} else {
				game.state.start('lobby');
			}
		}
	}

	return {
		preload: function(){

			// fonts
			var fontUrl;
			if(config.isPackage){
				fontUrl = [ 'style/font-awesome.min.css', 'style/fonts-package.css' ];
			} else {
				fontUrl = [ 'style/font-awesome.min.css', 'style/fonts.css' ];
				fontUrl = [ 'style/font-awesome-package.min.css', 'style/fonts-package.css' ];
			}
			WebFont.load({
				custom: {
					families: ['FontAwesome', 'Montserrat'],
	            	urls: fontUrl,
				}, 
				active: function(){
					setFinished();
				},
				inactive: function(){
  					console.log('Could not load font');
  					setFinished();
				}
			});

			// layout
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});

			// gui
			drawGui();

			Layout.instance.resize(game.width, game.height);

			// images
			game.load.image('lobbyDescription', 'images/lobby_description.png'); 

			// avatars
			for (var i = 0; i < avatarNames.length; i++) {
				var number = common.addZeroes(i+1, 2);
				game.load.image(avatarNames[i], 'images/avatar_' + number + '.png');
				game.load.image(avatarNames[i] + '_head', 'images/avatar_' + number + '_head.png');
			};

			// *** Card ***
			// // pickup
			// game.load.audio('card/pickup', ['audio/fx/card/pickup.wav']);
			// // draw
			// game.load.audio('card/draw', ['audio/fx/card/draw.wav']);
			// // return
			// game.load.audio('card/return', ['audio/fx/card/return.wav']);
			// // place board
			// game.load.audio('card/placeBoard', ['audio/fx/card/placeBoard.wav']);
			// // place overlap
			// game.load.audio('card/placeOverlap', ['audio/fx/card/placeOverlap.wav']);
			// // board success
			// game.load.audio('card/boardSuccess', ['audio/fx/card/boardSuccess.wav']);
			// // board failed
			// game.load.audio('card/boardFailed', ['audio/fx/card/boardFailed.wav']);
			// // overlap success
			// game.load.audio('card/overlapSuccess', ['audio/fx/card/overlapSuccess.wav']);
			// // win
			// game.load.audio('win/win', ['audio/fx/win/win.mp3']);
			// // lose
			// game.load.audio('lose/lose', ['audio/fx/lose/lose.wav']);

			// // *** achievement ***
			// // last
			// game.load.audio('achievement/last1', ['audio/fx/achievement/last1.wav']);
			// game.load.audio('achievement/last5', ['audio/fx/achievement/last5.wav']);
			// // screw
			// game.load.audio('achievement/screw', ['audio/fx/achievement/screw.wav']);
			// game.load.audio('achievement/screwed', ['audio/fx/achievement/screwed.wav']);

		},

		loadUpdate: function(){
			TweenMax.to(data, 1, { progress: game.load.progress, onUpdate: updateProgress })
		},

		create: function(){
			textProgress.text = 'Loading Fonts';
            
            game.add.text(-1000, 0, '', { font: '30px FontAwesome'});

			setFinished();
		},

		shutdown: function(){
			TweenMax.killTweensOf(data);
		}
	}

})();;// stage.js

var stageState;

(function(){

	// gui
	var stageArea;
	var container;
	var boards;
	var boardsContainer;
	var timerBall;
	var iconsGroup;
	var playersIcons;
	var incoming;
	var notification;
	var rain;

	// pause
	var pause;
	var btnContinue;
	var btnExit;

	// groups
	var playersIconsGroup;

	// header
	var header;
	var headerButton;

	// timeline
	var timelineEnd;

	function drawGui(){
		// header
		var headerHeight = 70;
		header = new com.speez.components.Header(originalWidth, headerHeight, {
			alpha: 0,
		});
		var headerButton = game.add.text(30, headerHeight * 0.5, '\uf04c', {
			font: "20px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
		headerButton.anchor.set(0.5);
	    headerButton.inputEnabled = true;
	    headerButton.events.onInputDown.add(drawPause);
		header.addLeft(headerButton);

		game.stage.backgroundColor = 0x1e1e1e;

		// Content
		stageArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, { isDebug: false });
		container = game.add.sprite();
		stageArea.attach(container, { width: originalWidth, height: originalHeight });

		// rain
    	rain = new com.speez.components.Rain({
    		y: originalHeight + 100,
    		targetY: -100,
    		maxX: originalWidth,
    	});
    	rain.alpha = 0.3;
    	game.add.existing(rain);
    	game.world.sendToBack(rain);

    	stageArea.attach(rain, {
    		width: originalWidth,
    		height: originalHeight,
    		mode: Layout.PROPORTIONAL_OUTSIDE,
    	});

	    // setting players
	    playersIcons = [];
	    iconsGroup = game.add.group();
	    iconsGroup.x = originalWidthCenter;
	    iconsGroup.y = originalHeight - 60;
	    container.addChild(iconsGroup);
		var keys = _.keys(stage.players);
		for (var i = 0; i < keys.length; i++) {
			var player = stage.players[keys[i]];
			var icon = new PlayerIcon(0, 0, 155, 80, { 
				isShowStats: false,
	 		});
			playersIcons[player.icon] = icon;
			iconsGroup.add(icon);
			icon.setPlayer(player, false);
		};
	    rearrangeIcons(false);

		timer = new com.speez.components.TimerLines({ 
			time: 10,
			width: 20,
			height: originalHeight,
			color: 0xc5c5c5,
			countComplete: handleTimerComplete,
		});
		game.add.existing(timer);
		
		incoming = new com.speez.components.Incoming(originalWidthCenter, originalHeightCenter);
		container.addChild(incoming);

		var notificationX = 126;
		notification = new com.speez.components.TextNotification(notificationX, originalHeightCenter, originalWidth - notificationX * 2, 200, {

		});
		container.addChild(notification);

		// common
		// common.addLogo('logo', stageArea);
		common.addLogo('beta', stageArea);
	}

	function drawBoards(){
		destroyBoards();

		// Boards
		boards = [];
		boardsContainer = game.add.group();
		var minRadius = 100;
		var maxRadius = 140;
		var minY = -150;
		var maxY = 0;
		var rotateSpeed = 0.2;
		var options = {
			diffuseColor: game.stage.backgroundColor,
		};
		switch(stage.game.boards.length) {
			case 2:
				boards[0] = new com.speez.components.StageBoard(originalWidthCenter * 0.5, originalHeightCenter + _.random(minY, maxY), 
					_.extend(options, { color: stage.game.boards[0].color, radius: _.random(minRadius, maxRadius), rotateSpeed: 100, isLeft: true }));
				boards[1] = new com.speez.components.StageBoard(originalWidthCenter * 1.5, originalHeightCenter + _.random(minY, maxY), 
					_.extend(options, { color: stage.game.boards[1].color, radius: _.random(minRadius, maxRadius), rotateSpeed: -100, isLeft: false }));
				break;
			case 3:
				boards[0] = new com.speez.components.StageBoard(0, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[0].color);
				boards[1] = new com.speez.components.StageBoard(originalWidthCenter, 0, originalWidthCenter, originalHeight, stage.game.boards[1].color);
				boards[2] = new com.speez.components.StageBoard(0, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[2].color)
				break;
			case 4:
				boards[0] = new com.speez.components.StageBoard(0, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[0].color);
				boards[1] = new com.speez.components.StageBoard(originalWidthCenter, 0, originalWidthCenter, originalHeightCenter, stage.game.boards[1].color);
				boards[2] = new com.speez.components.StageBoard(0, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[2].color)
				boards[3] = new com.speez.components.StageBoard(originalWidthCenter, originalHeightCenter, originalWidthCenter, originalHeightCenter, stage.game.boards[3].color)
				break;
		}
		_.each(boards, function(board){
			// boardsContainer.add(board);
			container.addChild(board);
			board.options.appearTime = 0;
		});
	}

	function drawPause(){
		var text = game.add.text(originalWidthCenter, 143, 'PAUZE', {
			font: "bold 50px FontAwesome",
	        fill: "#ffffff",
	        align: "center"
		});
	    text.anchor.set(0.5);

		btnContinue = new MenuButton(originalWidthCenter, 313, 324, 96, {
	    	color: 0x009bff,
	    	textColor: 0x1e1e1e,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'CONTINUE',
			callback: handleContinueClicked,
	    });

	    btnExit = new MenuButton(originalWidthCenter, 453, 324, 85, {
	    	color: 0x1e1e1e,
	    	textColor: 0xffffff,
	    	colorOver: 0xffffff,
	    	textColorOver: 0x000000,
			format: {
		        font: "bold 30px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0xffffff,
			radius: 5,
			text: 'END GAME',
			callback: handleExitClicked,
	    });

		pause = new com.speez.components.PauseScreen(originalWidth, originalHeight);
		game.add.existing(pause);
	    pause.container.addChild(text);
		pause.container.addChild(btnExit);
		pause.container.addChild(btnContinue);
	}

	function destroyBoards(){
		if(!boards){
			return;
		}
		_.each(boards, function(board){
			board.destroy();
		});
	}

	function handleTimerComplete(){
		doSpeedy();
	}

	function handlePlayIncomingComplete(){
		if(config.isTest){
			handlePlay(generateBoards());
			return;
		}
		socket.emit('speed:stage:play', handlePlay);
	}

	function onWinnerComplete(){
		if(config.isTest){

		}
		socket.emit('speed:stage:next');
	}

	function handleContinueClicked(){
		pause.destroy();
	}

	function handleExitClicked(){
	 	if(!confirm("Are you sure?")){
	        return;
	    };
		_.each(pause.container.children, function(item){
			if(item.setEnable){
				item.setEnable(false);
			}
		});
		socket.emit('speed:stage:stageLeave', handleStageLeave);
	}

	// handling socket

	function handleStageLeave(){
		delete stage;
		stage = null;
		game.state.start('main');
	}

	function handleStart(){
		var texts = [
			{ text: '5', sound: 'countdown/5' },
			{ text: '4', sound: 'countdown/4' },
			{ text: '3', sound: 'countdown/3' },
			{ text: '2', sound: 'countdown/2' },
			{ text: '1', sound: 'countdown/1' },
		];
		var speezTexts = [ { text: 'SPEEZ', sound: 'countdown/speed', angle: 30 } ];

		if(config.isTest){
			texts = [
				{ text: '5', sound: 'countdown/5' }
			]
		}

		var speezOptions = {
			isTexts: true,
			delay: 1,
			size: 300,
			delayBetween: 1,
			effectOptions: {
				name: 'speezIncoming',
				backRadius: 650,
			},
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			complete: handlePlayIncomingComplete,
			timeScale: 0.9,
		}
		var textsOptions = {
			isTexts: true,
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			delay: 1,
			size: 150,
			delayBetween: 0.2,
			effectOptions: {
				name: 'numericIncoming',
				backRadius: 400,
			},
			timeScale: 1.7,
		};

		var timeline = new TimelineMax({ delay: 1 });
		timeline.add(incoming.show(texts, textsOptions), 0);
		timeline.add(incoming.show(speezTexts, speezOptions), '+=' + 1);
	}

	function handleSpeedy(data){
		console.log('handleSpeedy:', data);

		var texts = [
			{ text: '3', sound: 'countdown/3' },
			{ text: '2', sound: 'countdown/2' },
			{ text: '1', sound: 'countdown/1' },
		];
		var speezTexts = [ { text: 'SPEEZ', sound: 'countdown/speed', angle: 30 } ];

		var speezOptions = {
			isTexts: true,
			delay: 1,
			size: 300,
			delayBetween: 1,
			effectOptions: {
				name: 'speezIncoming',
				backRadius: 650,
			},
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			complete: handlePlayIncomingComplete,
			timeScale: 0.9,
		}
		var textsOptions = {
			isTexts: true,
			format: {
				font: "bold 150px Montserrat",
		        fill: "#111111",
		        align: "center",
			},
			delay: 1,
			size: 150,
			delayBetween: 0.2,
			effectOptions: {
				name: 'numericIncoming',
				backRadius: 400,
			},
			timeScale: 1.7,
		};

		var timeline = new TimelineMax();
		timeline.add(function(){
			rain.active = false;
		});
		timeline.add(timer.disappear(), 0);
		timeline.add(_.invoke(boards, 'disappear'), 0);
		// timeline.add(_.invoke(playersIcons, 'disappear', true), 0);
		// timeline.add(incoming.show(texts, textsOptions), '+=' + 1);
		timeline.add(incoming.show(speezTexts, speezOptions), '+=' + 1);
	}

	function handlePlay(data){
		console.log('handlePlay:', data);
		stage.game.boards = data;
		
		drawBoards();
		var timeline = new TimelineMax({  });
		timeline.add(function(){
			rain.active = true;
		});
		timeline.add(setBoards(), 0);
		timeline.add(timer.appear(), 0);
		// timeline.add(_.invoke(playersIcons, 'appear', true), 0);
	}

	function handleCardBoard(data){
		console.log('handleCardBoard:', data);
		var player = stage.players[data.playerId];
		var board = boards[data.boardId];
		board.setCard(data.card, player.name, true);
		container.removeChild(board);
		container.addChild(board);

		// set icon
		player.points += data.points;
		var icon = playersIcons[player.icon];
		icon.tweenColor({ color: board.options.color, isReturn: true, returnTime: 3});
		icon.setPoints(player.points);
		player.cardCount = data.cardCount;
		setPlayerCards(icon, player);
		var symbol = '\uf067';
		if(data.fazt){
			player.currentFazt++;
			symbol = '\uf0e7';
			icon.showIcon({
				symbol: symbol,
				symbolFormat: {
			    	font: "125px FontAwesome",
			        fill: "#ffd646",
			        align: "center"
			    },
			});
		}
		icon.popup({
			color: board.options.color,
			text: data.points.toString(),
			symbol: symbol,
			isStay: false,
			stayTime: -0.5,
		});
		timer.setCard(board.options.color);
	}

	function handleCardOverlap(data){
		console.log('handleCardOverlap:', data);

		var player = stage.players[data.playerId];
		player.points += data.points;
		var icon = playersIcons[player.icon];
		icon.setPoints(player.points);
		icon.popup({
			color: 0xffffff,
			text: data.points.toString(),
			symbol: '\uf067',
			isStay: false,
			stayTime: -0.5,
		});
		player.cardCount = data.cardCount;
		setPlayerCards(icon, player);
	}

	function setPlayerCards(icon, player){
		if(player.cardCount === 5){
			icon.flash(0.5, 0x00ee00);
		} else if(player.cardCount === 1){
			icon.flash(0.2, 0xee0000);
		} else if(player.cardCount === 0){
			icon.flash(0, 0x1e1e1e);
		}
		icon.setCards(1 - player.cardCount / stage.game.cardCount);
	}

	function handleAchieve(data){
		console.log('handleAchieve:', data);
		var player = stage.players[data.player];
		if(data.points){
			player.points += data.points;
		}
		if(data.achievement === 'screw'){
			handleScrew(player, data);
		}
	}

	function handleScrew(player, data){
		player.currentBlock++;
		var screwPlayer = stage.players[data.data.screwId];
		var icon = playersIcons[screwPlayer.icon];
		icon.showIcon({
			symbol: '\uf05e',
			symbolFormat: {
		    	font: "125px FontAwesome",
		        fill: "#cb1800",
		        align: "center"
		    },
		});
		player.points += data.points;
		
		var icon = playersIcons[player.icon];
		icon.setPoints(player.points);
		icon.tweenColor({color: 0xcb1800, isReturn: true });
		icon.popup({
			color: 0xcb1800,
			text: data.points.toString(),
			symbol: '\uf05e',
			isStay: false,
			stayTime: -0.5,
		});
	}

	function handleLeave(data){
		console.log('handleLeave:', data);
		if(timelineEnd){
			timelineEnd.kill();
		}
		delete stage.players[data.id];
		if(_.keys(stage.players).length !== 0){
			return;
		}
		// stop the game if there are no players
		game.state.start('lobby');
		Audio.instance.stop('fx');
	}

	function handleNoMoves(data){
		console.log('handleNoMoves:', data);
		timer.noMoves();
	}

	function handleWinner(data){
		console.log('handleWinner:', data);
		stage.game.winnerData = data;

		var player = stage.players[data.winner];
		player.victories++;

		finalizePlayers();

		var timeline = new TimelineMax();
		timelineEnd = timeline;
		timeline.add(function(){ rain.active = false; });
		timeline.add(timer.disappear());
		timeline.add(_.invoke(boards, 'disappear'), 0);
		// timeline.add(_.invoke(playersIcons, 'disappear', true));
		// timeline.add(onWinnerComplete, '+=' + 2);
		
		var icon;

		// points
		var texts = [ 
			{ text: 'THE', color: 0xffffff },
			{ text: 'WINNER', color: 0xffffff },
			{ text: player.name, color: 0x009bff },
		];
		icon = playersIcons[player.icon];
		player.points += stage.game.winnerData.points;
		timeline.addLabel('points', '+=2');
		timeline.add(function(){
			socket.emit('speed:stage:next');
		}, 'points');
		timeline.add(notification.show(texts, '\uf091', null, {
			symbolColor: 0xffffff,
			delayTime: 5,
		}), 'points');
		timeline.add(icon.popup({
			color: 0x009bff,
			text: stage.game.winnerData.points.toString(),
			symbol: '\uf091',
			isStay: false,
			stayTime: 3,
		}), 'points');
		timeline.add(icon.setPoints(player.points), 'points');
		timeline.add(icon.tweenColor({color: 0x009bff, isReturn: true, returnTime: 5}), 'points');
		
		// best blocker
		if(stage.game.winnerData.bestBlocker){
			var bestBlocker = stage.players[stage.game.winnerData.bestBlocker];
			icon = playersIcons[bestBlocker.icon];
			bestBlocker.points += stage.game.winnerData.bestBlockerPoints;
			var blockerTexts = [
				{ text: 'BEST', color: 0xffffff },
				{ text: 'BLOCKER', color: 0xffffff },
				{ text: bestBlocker.name, color: 0xcb1800 },
			]
			timeline.addLabel('bestBlocker', '+=2');
			timeline.add(notification.show(blockerTexts, '\uf05e', bestBlocker.currentBlock, {
				symbolColor: 0xffffff,
				delayTime: 3,
			}), 'bestBlocker');
			timeline.add(icon.popup({
				color: 0xcb1800,
				text: stage.game.winnerData.bestBlockerPoints.toString(),
				symbol: '\uf05e',
				isStay: false,
				stayTime: 1,
			}), 'bestBlocker');
			timeline.add(icon.setPoints(bestBlocker.points), 'bestBlocker');
			timeline.add(icon.tweenColor({color: 0xcb1800, isReturn: true, returnTime: 3}), 'bestBlocker');
		}
		// best fazt
		if(stage.game.winnerData.bestFazt){
			var bestFazt = stage.players[stage.game.winnerData.bestFazt];
			icon = playersIcons[bestFazt.icon];
			bestFazt.points += stage.game.winnerData.bestFaztPoints;
			var faztTexts = [
				{ text: 'FAZT', color: 0xffffff },
				{ text: 'ONE', color: 0xffffff },
				{ text: bestFazt.name, color: 0xb600db },
			]
			timeline.addLabel('bestFazt', '+=2');
			timeline.add(notification.show(faztTexts, '\uf0e7', bestFazt.currentFazt, {
				symbolColor: 0xffffff,
				delayTime: 3,
			}), 'bestFazt');
			timeline.add(icon.popup({
				color: 0xb600db,
				text: stage.game.winnerData.bestFaztPoints.toString(),
				symbol: '\uf0e7',
				isStay: false,
				stayTime: 1,
			}), 'bestFazt');
			timeline.add(icon.setPoints(bestFazt.points), 'bestFazt');
			timeline.add(icon.tweenColor({color: 0xb600db, isReturn: true, returnTime: 3}), 'bestFazt');
		}

		_gaq.push(['_trackEvent', 'speez', 'stage', 'end' + gameCount]);
	}

	function handleNext(data){
		console.log('handleNext:', data);

		// var player = stage.players[stage.game.winnerData.winner];

		// Finish
		timelineEnd.to(iconsGroup, 1, { delay: 1, y: 210 });
		timelineEnd.add(common.tweenStageColor(0xe2e2e2, null, 1));
		timelineEnd.add(function(){
			game.state.start('lobby');
		});
	}

	// other

	function doSpeedy(){
		if(config.isTest){
			// handleWinner({ winner: 0 });
			handleSpeedy();
			return;
		}
		socket.emit('speed:stage:speedy', null, handleSpeedy);
	}

	function setBoards(){
		var timeline = new TimelineMax();
		drawBoards();
		for(var i = 0; i < stage.game.boards.length; i++) {
			boards[i].setCard(stage.game.boards[i].current);
			var prevColor = boards[i].options.color;
			boards[i].options.color = stage.game.boards[i].color;
			timeline.add(boards[i].appear(prevColor), 0);
		}
		return timeline;
	}

	function rearrangeIcons(isAnimate){
	    var distance = 200;
		var timeline = new TimelineMax();
		for (var i = 0; i < playersIcons.length; i++) {
			var icon = playersIcons[i];
			var targetX = -distance * (0.5 * (playersIcons.length - 1)) + i * distance;
			timeline.to(icon, 1, { x: targetX }, 0);
		};
		if(!isAnimate){
			timeline.progress(1);
		}
		return timeline;
	}

	function initPlayers(){
		var keys = _.keys(stage.players);
		_.each(keys, function(key){
			var player = stage.players[key];
			player.currentFazt = 0;
			player.currentBlock = 0;
		});
	}

	function finalizePlayers(){
		var keys = _.keys(stage.players);
		_.each(keys, function(key){
			var player = stage.players[key];
			player.fazt += player.currentFazt;
			player.block += player.currentBlock;

			var icon = playersIcons[player.icon];
			icon.setCards(0);
		});
	}

	// test

	function generateBoards(){
		var boards = [];
		var colors = _.shuffle([
			0xbf00d8,
			0xd84100,
			0xdbaf00,
			0xa1ff00,
			0x00c8cc,
			0x0065bf
		]);
		for(var i = 0; i < stage.game.boardCount; i++){
			boards[i] = { current: _.random(0, 9), color: colors[i] };
		}
		return boards;
	}

	function setTest(){
		stage.game.boardCount = 2;
		stage.game.boards = generateBoards();
		stage.game.cardCount = 20;
		stage.players = [];
		stage.players[0] = {
			id: 0,
			name: 'Zot',
			points: 0,
			icon: 0,
			cardCount: 20,
			block: 0,
			fazt: 0,
			avatar: 'Zot',
		}
		stage.players[1] = {
			id: 1,
			name: 'Zeeps',
			points: 0,
			icon: 1,
			cardCount: 20,
			block: 0,
			fazt: 0,
			avatar: 'Zeeps',
		}

		var boardId = 0;
		var playerId = 0;
		game.input.keyboard.onPressCallback = function(key, event){
			switch(event.charCode){
				case 113:
					handleAchieve({ achievement: 'firstOfGame', player: 0, points: 10 });
					break;
				case 119:
					handleAchieve({ achievement: 'screw', player: 0, screwPlayerId: 1, points: 100 });
					break;
				default:
					if(event.charCode >= 48 && event.charCode <= 57){
						var number = event.charCode - 48;
						var playerId = _.random(0, 0);
						var player = stage.players[playerId];
						player.cardCount--;
						handleCardBoard({ card: number.toString(), fazt: _.random(0,1), boardId: _.random(0, stage.game.boardCount - 1), playerId: playerId, cardCount: player.cardCount, points: 100 });
					}
					return;
			}
		}
	}

	stageState = {

		preload: function(){
			common.flipOrientation('landscape');
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);
		},

		create: function(){

			if(config.isTest){
				setTest();
				drawGui();
				handleStart();
				return;
			}

			gameCount++;
			_gaq.push(['_trackEvent', 'speez', 'stage', 'start' + gameCount]);

			initPlayers();
			drawGui();
			
			socket.on('speed:stage:noMoves', handleNoMoves);
			socket.on('speed:stage:start', handleStart);
			socket.on('speed:stage:cardBoard', handleCardBoard);
			socket.on('speed:stage:cardOverlap', handleCardOverlap);
			socket.on('speed:stage:winner', handleWinner);
			socket.on('speed:stage:achieve', handleAchieve);
			socket.on('speed:stage:leave', handleLeave);
			socket.on('speed:stage:next', handleNext);
			socket.emit('speed:stage:loaded');
		},

		update: function(){

		},

		shutdown: function(){
			socket.off('speed:stage:noMoves', handleNoMoves);
			socket.off('speed:stage:leave', handleLeave);
			socket.off('speed:stage:achieve', handleAchieve);
			socket.off('speed:stage:start', handleStart);
			socket.off('speed:stage:cardBoard', handleCardBoard);
			socket.off('speed:stage:cardOverlap', handleCardOverlap);
			socket.off('speed:stage:winner', handleWinner);
			socket.off('speed:stage:next', handleNext);
		},

	}

})();








;// stageFinish.js
var stageFinishState = (function(){

	// gui
	var header;
	var container;
	var finishArea;
	var textWin;

	// data

	function drawGui(){
		finishArea = new com.LayoutArea(0, 0, originalWidth, originalHeight, {isDebug:false});
		container = game.add.sprite();
		finishArea.attach(container, {width: originalWidth, height: originalHeight });

		console.log(stage.game.winner);
		console.log(stage.players);
		var winner = stage.players[stage.game.winner];
		textWin = game.add.text(originalWidthCenter, originalHeightCenter, winner.name, {
			font: "200px Arial",
	        fill: "#ffffff",
	        align: "center"
		});
		textWin.alpha = 0;
		textWin.anchor.set(0.5, 0.5);
		container.addChild(textWin);

		var timeline = new TimelineLite({ onComplete: handleWinComplete });
		timeline.to(textWin, 0.25, { alpha: 1 });
		timeline.add(common.tweenStageColor(0xffffff), '+=5');
	}

	// gui handlers

	function handleWinComplete(){
		game.state.start('lobby');
	}

	// socket handle

	function handleNext(){
		drawGui();
	}

	function handleLeave(data){
		delete stage.players[data.id];
	}

	return {
		preload: function(){
			layout = new Layout({
				game: game,
	        	width: originalWidth,
	        	height: originalHeight,
	        	isDebug: false,
			});
			Layout.instance.resize(game.width, game.height);
		},

		create: function(){
			game.stage.backgroundColor = 0x000000;

			if(config.isTest){
				handleNext();
				return;
			}

			socket.on('speed:stage:next', handleNext);
			socket.on('speed:stage:leave', handleLeave);
			socket.emit('speed:stage:next');
		},

		shutdown: function(){
			socket.off('speed:stage:leave', handleLeave);
			socket.off('speed:stage:next', handleNext);
		}
	}

})();





