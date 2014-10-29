var express = require('express.io');
var router = express.Router();
var _ = require('underscore');

/* GET home page. */
module.exports = function(req, res) {
	res.render('index');
};

module.exports.partials = function(req, res){
  var name = req.params.name;
  if(!name) return;  // might want to change this
  res.render("partials/" + name );
};
