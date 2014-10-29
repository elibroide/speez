// speed.js

var express = require('express.io');
var _ = require('underscore');

function getRoutes(app){
	app.io.route('common', {
	    ping: function(req) {
	    	req.io.respond('pong');
	    },
	});
}

module.exports = {
	getRoutes: getRoutes,
}