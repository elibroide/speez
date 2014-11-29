// lobbyPlayer.js

var lobbyPlayerState = (function(){
	var graphics;
	// data
	var isReady;

	// menu
	var blockNumber;
	var lobbyArea;
	var buttons;
	var btnReady;
	var headerText;
	var textAreYou;
	var textName;

	// header
	var header;

	// debug
	var textLatency;

	function drawGui(){

		lobbyArea = new com.LayoutArea(0, 0, originalWidth, originalHeight);
		container = game.add.sprite();
		lobbyArea.attach(container, {width: originalWidth, height: originalHeight, onResize: onAreaResized, });
		game.stage.backgroundColor = 0xe2e2e2;

		blockNumber = new com.speez.components.BlockNumber(originalWidthCenter - 470 / 2, 145, 470, 125, player.stageId);
		game.add.existing(blockNumber);
		container.addChild(blockNumber);

		var headerTextFormat = {
			font: "27px Montserrat",
	        fill: "#000000",
	        align: "center"
		}
		headerText = game.add.text(originalWidthCenter, 115, 'GAME NUMBER', headerTextFormat);
		headerText.anchor.set(0.5);
		container.addChild(headerText);

	    var buttonOptions = {
	    	color: 0x36de4a,
	    	textColor: 0x000000,
	    	colorOver: 0x269e34,
	    	textColorOver: 0x000000,
	    	colorDown: 0x36de4a,
			format: {
		        font: "bold 44px Montserrat",
		        fill: "#ffffff",
		        align: "center"
		    },
			borderWidth: 5,
			borderColor: 0x000000,
			radius: 10,
	    }
		btnReady = new MenuButton(0, 535, 476, 154, _.extend({ callback: handleReadyClicked, text: "READY" }, buttonOptions));

		// texts
		var textsFormat = {
			font: "27px Montserrat",
	        fill: "#000000",
	        align: "center"
		};
		textAreYou = game.add.text(0, 430, 'ARE YOU?', textsFormat);
		textAreYou.anchor.set(0.5);
		textName = game.add.text(0, 650, 'YOU ARE', textsFormat);
		textName.anchor.set(0.5);

		// Group buttons
		buttons = game.add.group();
		buttons.add(btnReady);
		buttons.add(textAreYou);
		buttons.add(textName);

		buttons.x = originalWidthCenter;
		buttons.y = 0;

    	container.addChild(buttons);

    	// input
    	$('<input id="tbxChangeName" type="text">')
    		.appendTo('body')
    		.addClass('tbxChangeName')
    		.css({
				'font-family': 'Montserrat, FontAwesome'
    		})
    		.attr('placeholder', 'ENTER NAME')
    		.focusout(onJoinTextFocusOut)
    		.focusin(onJoinTextFocusIn)
    		.change(onJoinTextChange)
    		.val(player.name);

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
		var y = container.y + 741 * Layout.instance.minScale - height * 0.5;
		$('#tbxChangeName').css({ 
			left: x + 'px',
			top: y + 'px',
			width: width + 'px',
			height: height + 'px',
			'border-width': (5 * Layout.instance.minScale) + 'px',
			'font-size': (60 * Layout.instance.minScale) + 'px', 
		});
	}

	function toggleButtons(on){
		$('#tbxChangeName').prop('disabled', !on);
		buttons.callAll('setEnable', on);
	}

	// gui handlers

	function onJoinTextFocusOut(event){
		var val = $('#tbxChangeName').val();
		if(!val){
			btnReady.setEnable(true);
			$('#tbxChangeName').val(player.name);
		}
	}

	function onJoinTextFocusIn(event){
		btnReady.setEnable(true);
		$('#tbxChangeName')
			.val('');
	}

	function onJoinTextChange(event){
		var name = $('#tbxChangeName').val();
		socket.emit('speed:player:name', { name: name }, handleName);
	}

	function handleReadyClicked(){		
		isReady = !isReady;
		$('#tbxChangeName').prop('disabled', isReady);
		socket.emit('speed:player:ready', { isReady: isReady });
		btnReady.setText(isReady ? 'I\'M READY' : 'READY');
	}

	function handleExitClicked(){
		btnReady.setEnable(true);
		$('#tbxChangeName').prop('disabled', true);
		socket.emit('speed:player:leave', handleLeave);
	}

	// socket handlers

	function handleLeave(data){
		console.log('handleLeave:', data);
		$('#tbxChangeName').remove();
		game.state.start('main');
	}

	function handleLoad(data){
		console.log('handleLoad:', data);
		player.game = data;
		player.game.cardTotal = player.game.cardCount;
		
		$('#tbxChangeName').remove();
		game.state.start('player');
	}

	function handleName(data){
		console.log('handleName:', data);
		btnReady.setEnable(true);
		player.name = data.name;
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
			common.addLogo('logo', lobbyArea);
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
			// socket.off('speed:player:ready', handleReady);
		},

	}

})();