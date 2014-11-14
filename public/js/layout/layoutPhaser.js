// layoutPhaser.js
(function(){

	var LayoutArea = com.LayoutArea;
	var Layout = com.Layout;

	// Layout

	Layout.prototype = _.extend(Object.create(Phaser.Group.prototype), Layout.prototype);
	Layout.prototype.constructor = com.LayoutArea;

	Layout.prototype.init = function() {
		Phaser.Group.call(this, this.options.game);

	    this.options.game.add.existing(this);


	    this.graphics = this.options.game.add.graphics();
	    this.graphics.beginFill(0xcc0000);
	    this.graphics.drawRect(0, 0, this.options.width, this.options.height);
	    var graphWidth = this.originalWidth;
		var graphHeight = this.originalHeight;
		var size = graphWidth > graphHeight ? graphHeight * 0.2 : graphWidth * 0.2;
		this.graphics.drawRect(0, 0, graphWidth, graphHeight);
		this.graphics.beginFill(0x0000aa);
		this.graphics.drawRect(0, 0, size, size);
		this.graphics.drawRect(graphWidth - size, 0, size, size);
		this.graphics.drawRect(0, graphHeight - size, size, size);
		this.graphics.drawRect(graphWidth - size, graphHeight - size, size, size);
		this.graphics.visible = this.options.isDebug;
		this.add(this.graphics);
	}

	Layout.prototype.scaling = function(scaleX, scaleY) {
		this.scale.set(scaleX, scaleY);
	}

	Layout.prototype.pinAdded = function(obj, pin) {
		if(!obj.events || !obj.events.onDestroy){
			return;
		}
		obj.layoutDestroy = function(){
			layout.unpin(obj);
		};
		obj.events.onDestroy.add(obj.layoutDestroy);
	};

	Layout.prototype.pinRemoved = function(obj) {
		if(!obj.events || !obj.events.onDestroy){
			return;
		};
		obj.events.onDestroy.remove(obj.layoutDestroy);
	};

	// LayoutArea

	LayoutArea.prototype = _.extend(Object.create(Phaser.Sprite.prototype), LayoutArea.prototype);
	LayoutArea.prototype.constructor = com.LayoutArea;

	LayoutArea.prototype.init = function(){
	    this.game = this.layout.game;
	    Phaser.Sprite.call(this, this.game);

	    this.layout.add(this);

	    this.graphics = this.game.add.graphics();
	    this.graphics.beginFill(0x00cc00);
	    this.graphics.drawRect(0, 0, this.options.width, this.options.height);
	    this.debugBox = this.graphics.graphicsData[0];
		var graphWidth = this.options.width;
		var graphHeight = this.options.height;
		var size = graphWidth > graphHeight ? graphHeight * 0.2 : graphWidth * 0.2;
		this.graphics.drawRect(0, 0, graphWidth, graphHeight);
		this.graphics.beginFill(0x0000aa);
		this.graphics.drawRect(0, 0, size, size);
		this.graphics.drawRect(graphWidth - size, 0, size, size);
		this.graphics.drawRect(0, graphHeight - size, size, size);
		this.graphics.drawRect(graphWidth - size, graphHeight - size, size, size);
	    this.addChild(this.graphics);
	    this.graphics.visible = this.options.isDebug;

	    this.changesArray = [];
	    this.postUpdate = this.performChanges; 
	}

	LayoutArea.prototype.onAttached = function(obj) {
		if(!obj.events || !obj.events.onDestroy){
			return;
		}
		obj.layoutAreaDestroy = function(){
			this.unattach(obj);
		}.bind(this);
		obj.events.onDestroy.add(obj.layoutAreaDestroy);
	};

	LayoutArea.prototype.onUnattached = function(obj) {
		if(!obj.events || !obj.events.onDestroy){
			return;
		};
		obj.events.onDestroy.remove(obj.layoutAreaDestroy);
	};

	LayoutArea.prototype.performChanges = function(){
    	if(this.isUpdate > 0){
	    	this.isUpdate--;
    		return;
    	}
    	if(this.isUpdate !== 0){
    		return;
    	}
    	_.each(this.changesArray, this.performChangeAttach.bind(this));
    	this.changesArray = [];
    	this.isUpdate = -1;
	}

	LayoutArea.prototype.performChangeAttach = function(item){

		// Check if still valid
		var found = this.getAttached(item.obj);
		if(!found) {
			return;
		}
		item.obj.x = item.data.x;
		item.obj.y = item.data.y;
		if(item.obj.parent !== game.world){
			item.obj.x -= item.obj.parent.x;
			item.obj.y -= item.obj.parent.y;
		}
		item.obj.scale.set(
			item.data.scaleX ? item.data.scaleX : item.obj.scale.x, 
			item.data.scaleY ? item.data.scaleY : item.obj.scale.y
		);
	}

	LayoutArea.prototype.setScale = function(item, data){
		if(item.state === Layout.STATE_UPDATE){
			this.isUpdate = 0;
		} else {
			this.isUpdate = 0
		}
		this.changesArray.push({ obj: item.obj, data: data });
	}

	LayoutArea.prototype.onResize = function(scale){
		if(!this.scale){
			return;
		}
		this.scale.set(scale);
	}

})()