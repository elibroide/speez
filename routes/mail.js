var _ = require('underscore');
var express = require('express');
var router = express.Router();
var Mail = require('./../model/mail');

router.get('/', function(req, res){
	if(req.query.user !== 'broidebrothers' && req.query.password !== '6732202'){
		res.json([{address: 'elibroid@gmail.com'}, {address: 'broidebrothers@gmail.com'}]);
		return;
	}
	var query = Mail.find();
	query.exec(function(err, mails){
	  	res.json(mails);
	});
});

router.post('/', function(req, res){

	// validate
	req.assert('mail', 'REQUIRED MAIL').notEmpty();
	req.assert('mail', 'INVALID MAIL').isEmail();

	var errors = req.validationErrors();
	if (errors) {
		res.send(errors, 400);
		return;
	}

	// Query the thing
	var query = Mail.findOne({ address: req.body.mail });
	query = query.select('address');
	query.exec(function(err, mail){
		if(err){
			throw err;
		}
		if(mail){
			res.json({ isRegistered: 1 });
		} else {
			Mail.create({ address: req.body.mail, notifyDate: new Date() }, function(err){
				if(err){
					throw err;
				}
				res.json({ isRegistered: 0 });
			});
		}
	});
});

module.exports = router;
