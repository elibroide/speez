// ParticleFactory.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.ParticleFactory = (function(){

	function ParticleFactory(){
		this.classes = [];
		ParticleFactory.instance = this;
	}

	ParticleFactory.prototype.create = function(options) {
		options = _.extend({
			size: 24,
			color: 0xff0000,
			name: 'rectangleParticles',
			makeFunction: this.defaultMakeParticles,
		}, options);

		options.makeFunction(options);

		if(this.classes[name]){
			return this.classes[name];
		}

		var ParticleClass = function(game, x, y){
	    	Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData(options.name));
	    }
		ParticleClass.prototype = Object.create(Phaser.Particle.prototype);
	    ParticleClass.prototype.constructor = ParticleClass;

	    return ParticleClass;
	};

	ParticleFactory.prototype.defaultMakeParticles = function(options) {
		var bmd = game.add.bitmapData(options.size, options.size);
	    bmd.context.fillStyle = common.toRgb(options.color);
	    bmd.context.fillRect(0, 0, options.size, options.size);
	    game.cache.addBitmapData(options.name, bmd);
	};


    return ParticleFactory;
})();
new com.speez.components.ParticleFactory();
var ParticleFactory = com.speez.components.ParticleFactory;