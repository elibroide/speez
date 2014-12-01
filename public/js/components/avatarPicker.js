// AvatarPicker.js

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
















