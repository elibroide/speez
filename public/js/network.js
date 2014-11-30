// network.js

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
	}

	function onDisconnect(){
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
})();