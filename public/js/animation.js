// animation.js

Animation = (function(){
	
	function Animation(){
		this.groups = [];

		Animation.instance = this;
	}

	Animation.prototype.getGroup = function(groupId) {
		var group = {
			id: id,
			animations: [],
			pause: false,
		};
		this.groups.push(group);
		return group;
	};

	Animation.prototype.create = function(options, groupId) {
		var group = this.getGroup(groupId);
		var timeline = new TimelineLite(options);
		timeline.vars.paused = group.pause;
		group.push(options);
		return timeline;
	};

	return Animation;

})();