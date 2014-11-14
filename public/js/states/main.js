// main.js

var mainState = (function(){
	
	// data
	var isReady;

	// menu
	var menuArea;
	var buttons;
	var textStatus;
	var btnJoinStage;
	var btnBecomeStage;
	var btnTestPlayer;
	var btnTestStage;
	var btnReady;
	var btnChangeName;

	// header
	var header;

	// debug
	var textLatency;

	function drawGui(){
		menuArea = new com.LayoutArea(0, 0, originalWidth, originalHeight);
		container = game.add.sprite();
		menuArea.attach(container, {width: originalWidth, height: originalHeight });
		game.stage.backgroundColor = 0x000000;

		textStatus = game.add.text(originalWidthCenter, 30, "Speez", {
		        font: "65px Arial",
		        fill: "#ffffff",
		        align: "center"
		    });
	    textStatus.anchor.set(0.5, 0);
	    container.addChild(textStatus);

	    var centerVertical = originalHeightCenter;
		btnJoinStage = new MenuButton(0, -100, 300, 60, 'Join', handleJoinStageClicked, { anchorX: 0.5, anchorY: 0.5 });
		btnBecomeStage = new MenuButton(0, 0, 300, 60, 'Create', handleBecomeStageClicked, { anchorX: 0.5, anchorY: 0.5 });
		btnTestPlayer = new MenuButton(0, 100, 300, 60, 'Test Player', handleTestingPlayerClicked, { anchorX: 0.5, anchorY: 0.5 });
		btnTestStage = new MenuButton(0, 200, 300, 60, 'Test Stage', handleTestingStageClicked, { anchorX: 0.5, anchorY: 0.5 });

		btnChangeName = new MenuButton(0, -100, 300, 60, 'Change Name', handleChangeName, { anchorX: 0.5, anchorY: 0.5 })
		btnReady = new MenuButton(0, 0, 300, 60, 'Ready', handleReadyClicked, { anchorX: 0.5, anchorY: 0.5 })
		btnLeave = new MenuButton(0, 100, 300, 60, 'Leave', null, { anchorX: 0.5, anchorY: 0.5 })
		toggleLobby(false);

		// Group buttons
		buttons = game.add.group();
		buttons.add(btnJoinStage);
		buttons.add(btnBecomeStage);
		buttons.add(btnTestPlayer);
		buttons.add(btnTestStage);
		buttons.add(btnChangeName);
		buttons.add(btnReady);
		buttons.add(btnLeave);

		buttons.x = originalWidthCenter;
		buttons.y = originalHeightCenter;

    	container.addChild(buttons);

    	// Header
	}

	function toggleButtons(on){
		if(on) {
			buttons.callAll('revive');
		}
		else {
			buttons.callAll('kill');
		}
	}

	function toggleLobby(on) {
		if(on){
			btnChangeName.revive();
			btnReady.revive();
			btnLeave.revive();
		} else {
			btnChangeName.kill();
			btnReady.kill();
			btnLeave.kill();
		}
	}

	// gui handlers

	function handleBecomeStageClicked(){
		toggleButtons(false);
		common.tweenStageColor(0xffffff, function(){
			setTimeout(function(){ game.state.start('lobby'); }, 500);
		});
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
					{ color: colors[3] },
				],
				cardCount: 6,
			}
		}
		player.game.hand.push(1);
		player.game.hand.push(_.random(0,9));
		player.game.hand.push(_.random(0,9));
		player.game.hand.push(_.random(0,9));
		player.game.hand.push(1);
		player.game.hand.push(_.random(0,9));
		// set test
		textStatus.setText('Testing player');
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
			}
		}
		for(var i = 0; i < stage.game.boardCount; i++){
			stage.game.boards[i] = {
				current: _.random(0, 9),
				previous: [],
			}
		}
		config.isTest = true;
		textStatus.setText('Testing stage');
		setTimeout(function(){
			game.state.start('stage');
		}, 1000)
	}

	function handleJoinStageClicked(){
		var id = parseInt(prompt("Enter a Value"));
		if(id){
			toggleButtons(false);
			socket.emit('speed:join', { id: id }, handleJoin);
		}
		else {
			textStatus.setText('Select stage first');
		}
	}

	function handleReadyClicked(){		
		isReady = !isReady;
		socket.emit('speed:player:ready', { isReady: isReady });
		btnReady.setText(isReady ? 'Not Ready' : 'Ready');
	}

	function handleChangeName(){
		var name = prompt('Enter Name');
		socket.emit('speed:player:name', { name: name }, handleName);
	}

	function handleLeaveClicked(){
		socket.emit('speed:player:leave', handleLeave);
		toggleLobby(false);
	}

	// socket handlers

	function handleJoin(data){
		console.log('handleJoin:', data);
		if(!data.confirm){
			textStatus.setText(data.reason);
			toggleButtons(true);
			toggleLobby(false);
			return;
		}
		textStatus.setText(data.name);
		player = {
			id: data.id,
			name: data.name,
		}
		socket.on('speed:player:leave', handleLeave);
		btnLeave.events.onInputDown.addOnce(handleLeaveClicked);
		isReady = false;
		toggleLobby(true);
	}

	function handleLeave(data){
		console.log('handleLeave:', data);
		socket.off('speed:player:leave', handleLoad);
		textStatus.setText('Declined: ' + data.reason);
		toggleButtons(true);
		toggleLobby(false);
	}

	function handleLoad(data){
		console.log('handleLoad:', data);
		player.game = data;
		toggleLobby(false);
		common.tweenStageColor(0xffffff, function(){
			setTimeout(function(){ game.state.start('player'); }, 500);
		});
	}

	function handleName(data){
		console.log('handleName:', data);
		player.name = data.name;
		textStatus.setText(data.name);
	}

	// debug 

	function debugLatency(){
		// textLatency = game.add.text(20, game.world.height - 100, version + ' : none', {
	 //        font: "40px Arial",
	 //        fill: "#00ff44",
	 //        align: "center"
	 //    });
		// ping();
	}

	function ping(){
		var time = Date.now();
		socket.emit('common:ping', null, function(){
			if(game.state.current != 'main'){
				return;
			}
			var delta = (Date.now() - time);
			textLatency.setText(version + ' : ' + delta);
			setTimeout(ping, 1000);
		});
	}

	return {

		preload: function() {
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

			socket.on('speed:player:load', handleLoad);

			debugLatency();

	  		Layout.instance.resize(game.width, game.height);
		},

		update: function(){
		},

		render: function(){
			// game.debug.cameraInfo(game.camera, 32, 32);
            // game.debug.inputInfo(32, 130);

		},

		shutdown: function(){
			socket.off('speed:player:leave', handleLeave);
			socket.off('speed:player:load', handleLoad);
		},

		resize: function (width, height) {
	        //  This could be handy if you need to do any extra processing if the game resizes.
	        //  A resize could happen if for example swapping orientation on a device.
	        console.log('gameResized');

    	},

	}

})();