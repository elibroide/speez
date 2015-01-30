// test.js
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







