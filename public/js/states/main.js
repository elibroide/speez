// main.js
var board;
var mainState = (function(){
	var graphics;

	// menu
	var menuArea;
	var buttons;
	var logo;
	var bbLogo;
	var btnJoinStage;
	var btnBecomeStage;
	var btnTestPlayer;
	var btnTestStage;
	var btnReady;
	var btnChangeName;

	var textJoin;
	var textOr;

	// header
	var header;

	// debug
	var textLatency;

	function drawGui(){
		menuArea = new com.LayoutArea(0, 0, originalWidth, originalHeight);
		container = game.add.sprite();
		menuArea.attach(container, {width: originalWidth, height: originalHeight, onResize: onAreaResized, });
		game.stage.backgroundColor = 0xe2e2e2;

		// logo

		logo = game.add.sprite(originalWidthCenter + 20, 180, 'logo');
		logo.anchor.set(0.5);
		logo.width = 461;
		logo.height = 174;

		container.addChild(logo);

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
		textJoin = game.add.text(0, 420, 'JOIN THE GAME', textsFormat);
		textJoin.anchor.set(0.5);
		textOr = game.add.text(0, 650, 'OR', textsFormat);
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
    	$('<button type="submit">')
    		.css({
    			position: 'absolute',
    			margin: -1000,
    		})
    		.click(function(event){
    			event.preventDefault();
    		})
    		.appendTo('form');
    	$('<input id="tbxJoin" type="text">')
    		.appendTo('form')
    		.addClass('tbxJoin')
    		.css({
				position: 'absolute',
				'background-color': '#FFD646',
				'text-align': 'center',
				'font-family': 'Montserrat, FontAwesome'
    		})
    		.attr('placeholder', '\uf0e7')
    		.focusout(onJoinTextFocusOut)
    		.focusin(onJoinTextFocusIn)
    		.keydown(onJoinTextKeyDown)
    		.keyup(onJoinTextChange)
    		.change(onJoinTextChange);
		$('#tbxJoin').on('touchstart', function() {
	  		$(this).attr('type', 'number');
		});
		$('#tbxJoin').on('keydown blur', function() {
	  		$(this).attr('type', 'text');
		});

		// header
		var headerHeight = 100;
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
	    headerButton.events.onInputDown.add(onQuestionClicked);
		header.addLeft(headerButton);

		if(config.isLocal){
			drawTest();
		}
	}

	function drawTest(){
		btnTestPlayer = new MenuButton(logo.x, logo.y, 300, 60, _.extend({ callback: handleTestingPlayerClicked, text: "T.P" }));
		btnTestStage = new MenuButton(logo.x, logo.y + 60, 300, 60, _.extend({ callback: handleTestingStageClicked, text: "T.S" }));
		game.add.existing(btnTestPlayer);
		game.add.existing(btnTestStage);
	}

	function onJoinTextFocusOut(event){
		$('#tbxJoin')
			.removeClass('focus')
			.attr('placeholder', '\uf0e7');
	}

	function onJoinTextFocusIn(event){
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
			width: width * (detector.mobile() ? 0.9 : 1) +'px',
			height: height * (detector.mobile() ? 0.9 : 1) + 'px',
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

	function handleTestingPlayerClicked(){
		// mockup
		var colors = [0xbf00d8, 0xd84100, 0xdbaf00, 0xa1ff00, 0x00c8cc, 0x0065bf];
		colors = _.shuffle(colors);
		player = {
			winner: true,
			name: 'Cow',
			game: {
				boardCount: 2,
				hand: [],
				boards: [
					{ color: colors[0] },
					{ color: colors[1] },
					{ color: colors[2] },
					// { color: colors[3] },
				],
				cardCount: 6,
				cardTotal: 6,
			}
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
		}
		$('#tbxJoin').remove();
		game.state.start('lobbyPlayer');
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

			// Draw things
			drawGui();
			common.addLogo('logo', menuArea);
			common.addLogo('beta', menuArea);

	  		Layout.instance.resize(game.width, game.height);
		},

		shutdown: function(){
			removeDom();
		},

		resize: function (width, height) {
	        //  This could be handy if you need to do any extra processing if the game resizes.
	        //  A resize could happen if for example swapping orientation on a device.
	        console.log('gameResized');

    	},

	}

})();