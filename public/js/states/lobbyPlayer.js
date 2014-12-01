// lobbyPlayer.js

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
		buttons.callAll('setEnable', on);
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
			socket.emit('speed:player:name', { name: name }, handleName);
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
		toggleButtons(false);
		common.tweenStageColor(isReady ? 0x36de4a : 0xe2e2e2, function(){
			socket.emit('speed:player:ready', { isReady: isReady }, handleReady);
		}, 1);
	}

	function handleExitClicked(){
		btnReady.setEnable(true);
		$('#tbxChangeName').prop('disabled', true);
		socket.emit('speed:player:leave', handleLeave);
	}

	function handleAvatarPickerChange(avatar){
		player.avatar = avatar;
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
		
		game.state.start('player');
	}

	function handleName(data){
		console.log('handleName:', data);
		btnReady.setEnable(true);
		player.name = data.name;
		toggleButtons(true);
	}

	function handleReady(data){
		console.log('handleName:', data);
		toggleButtons(true);
	}

	function handleAvatar(data){
		console.log('handleName:', data);
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

})();