// database.js

module.exports = function(app, mongoose){
	var address;
	address = 'mongodb://elibroide:locklegion@ds063769.mongolab.com:63769/iwmmtg';
	// address = 'mongodb://localhost/iwmmtg';
	mongoose.connect(address);
	if(app.env === 'development'){

	}
};
