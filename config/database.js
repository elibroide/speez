// database.js

module.exports = function(app, mongoose){
	var settings = {
		header: 'DB Settings',
		address: 'mongodb://broidebrothers:Bb6732202@ds039431.mongolab.com:39431/speez',
	}
	if(app.get('env') === 'development'){
		settings.address = 'mongodb://localhost:27017/speez'
	}
	console.log(settings)
	mongoose.connect(settings.address);
};
