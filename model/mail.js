// mail.js

var mongoose = require('mongoose');
var random = require('mongoose-random');
var Schema = mongoose.Schema;

var mailSchema = new Schema({
	address: String,
	notifyDate: Date,
});

mailSchema.plugin(random, { path: 'token' });

module.exports = mongoose.model('Mail', mailSchema);
