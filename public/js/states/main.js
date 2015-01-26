// main.js
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

})();