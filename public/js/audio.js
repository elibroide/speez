// audio.js

Audio = (function(){
	
	function Audio(){
		this.groups = [];

		Audio.instance = this;
	}

	Audio.prototype.addGroup = function(id) {
		var group = {
			id: id,
			sounds: [],
			volume: 1,
			mute: false,
		};
		this.groups.push(group);
		return group;
	};

	Audio.prototype.getGroup = function(groupId) {
		var group = _.findWhere(this.groups, { id: groupId });
		if(!group){
			group = this.addGroup(groupId);
		}
		return group;
	};

	function handleSoundStopped(){
		var group = this.group;
		var soundIndex = group.sounds.indexOf(this);
		if(soundIndex === -1){
			return;
		}
		group.sounds.splice(soundIndex, 1);
		this.destroy();
	}

	Audio.prototype.play = function(groupId, key, volume, loop) {
		var group = this.getGroup(groupId);
		if(volume === undefined){
			volume = group.mute ? 0 : group.volume;
		}
		var sound = game.sound.play(key, volume, loop);
		group.sounds.push(sound);
		sound.group = group;
		sound.onStop.addOnce(handleSoundStopped.bind(sound));
	};

	Audio.prototype.stop = function(groupId) {
		var group = this.getGroup(groupId);
		_.each(group.sounds.slice(0), function(sound){
			sound.stop();
		});
	};

	Audio.prototype.volume = function(groupId, volume) {
		var group = this.getGroup(groupId);
		group.volume = volume;
		_.each(group.sounds, function(sound){
			sound.volume = volume;
		});
	};

	Audio.prototype.mute = function(groupId, mute) {
		var group = this.getGroup(groupId);
		group.mute = mute;
		_.each(group.sounds, function(sound){
			sound.volume = group.mute ? 0 : group.volume;
		});
	};

	return Audio;

})();