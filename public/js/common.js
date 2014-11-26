// common.js
// Eliezer Broide

var common = {

	flipOrientation: function(targetOrientation){
		console.log('try to flip ' + orientation + ' to ' + targetOrientation);
		if(orientation === targetOrientation){
			return;
		}
		console.log('Flipping ' + orientation + ' to ' + targetOrientation);
		orientation = targetOrientation;
		var temp = originalWidth;
		originalWidth = originalHeight;
		originalHeight = temp;
		originalWidthCenter = originalWidth * 0.5;
		originalHeightCenter = originalHeight * 0.5;
	},

	createBlankBackground: function(color){
		if(color === undefined){
			color = 0xffffff;
		}
		var background = game.add.sprite(0, 0, 'background');
        background.fixedToCamera = true;
        background.scale.setTo(width, height);
        background.inputEnabled = true;
        background.input.priorityID = 0;
        return background;
	},

	generateNames: function(prefix, from, to, suffix, digits, jump){
		if(suffix === undefined){
			suffix = '';
		}
		if(digits === undefined){
			digits = 1;
		}
		if(jump === undefined){
			jump = 1;
		}
		var arr = [];
		for(var i = from; i <= to; i += jump){
			var numberText = i.toString();
			while(numberText.length < digits){
				numberText = '0' + numberText;
			}
			arr.push(prefix + numberText + suffix);
		}
		return arr;
	},

	drawButton: function(text, x, y, callback, isOnce){
		var button = game.add.sprite(x, y, 'button', 5);
		button.anchor.set(0.5, 0.5);
		button.text = game.add.text(0, 0, text, {
	        font: "40px Arial",
	        fill: "#00ff44",
	        align: "center"
	    });
	    button.text.anchor.set(0.5, 0.5);
	    button.inputEnabled = true;
	    button.addChild(button.text);
	    
	    if(callback) {
	    	button.events.onInputOut.add(function(){
	    		button.frame = 5;
		    });
		    button.events.onInputOver.add(function(){
		    	button.frame = 1;
		    });
		    if(isOnce) {
		    	button.events.onInputDown.addOnce(callback);
		    }
		    else{
		    	button.events.onInputDown.add(callback);
		    }
	    }

	    return button;
	},

	tweenTint: function(obj, startColor, endColor, time) {
	    // create an object to tween with our step value at 0
	    var colorBlend = {step: 0};

	    // create the tween on this object and tween its step property to 100
	    var colorTween = game.add.tween(colorBlend).to({step: 1}, time);
	    
	    // run the interpolateColor function every time the tween updates, feeding it the
	    // updated value of our tween each time, and set the result as our tint
	    var setColor = function(tween, progress) {
	    	var color = Phaser.Color.interpolateColor(startColor, endColor, 1, colorBlend.step, 0);
	    	if(typeof obj === 'function'){
	    		obj(color);
	    		return;
	    	}
	    };

	    colorTween.onUpdateCallback(setColor);
	    setColor(colorTween, 0);
	    
	    // start the tween
	    colorTween.start();

	    return colorTween;
	},

	tweenStageColor: function(color, complete, time){
		if(time === undefined){
			time = 0.5;
		}
		var stageChanger = {
			stageColor: function(color){
				if(color !== undefined){
					game.stage.backgroundColor = common.getRgb(color);
				}
				return game.stage.backgroundColor;
			}
		}
		return TweenLite.to(stageChanger, time, { colorProps: { stageColor: color }, onComplete: complete });
	},

	tweenSpin: function(obj, time, options){
		options = _.extend({
			isClockwise: true,
			isEase: true,
		}, options);
		var tweens = [];
		tweens[0] = game.add.tween(obj).to({ 
			angle: options.isClockwise ? 180 : -180 }, 
			time * 500, 
			options.isEase ? Phaser.Easing.Back.In : false,
			true
		);
		tweens[1] = game.add.tween(obj).to({ 
			angle: options.isClockwise ? 359 : -360 }, 
			time * 500, 
			options.isEase ? Phaser.Easing.Back.Out : false,
			false
		);
		tweens[0].chain(tweens[1]);
		tweens[1].onComplete.add(function(){
			obj.angle = 0;
		});
		return tweens;
	},

	getRgb: function(color){
		return eval('common.'+color);
	},

	rgb: function(r,g,b){
		return (r << 16) + (g << 8) + b;
	},

	rgba: function(r, g, b, a){
		return (a << 24) + (r << 16) + (g << 8) + (b);
	},

	toRgb: function(color){
		return 'rgb(' + [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff].join(',') + ')';
	},

	toRgba: function(color, alpha){
		if(alpha === undefined){
			alpha = 0;
		}
		alpha += (color & 0xff000000) >> 20;
		return 'rgba(' + [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff].join(',') + ', ' + alpha + ')';
	},

	toRgbHex: function(color, prefix){
		if(prefix === undefined){
			prefix = '';
		}
		var r = ((color & 0xff0000) >> 16).toString(16);
		var g = ((color & 0x00ff00) >> 8).toString(16);
		var b = (color & 0x0000ff).toString(16);
		r += r.length === 1 ? '0' : '';
		g += g.length === 1 ? '0' : '';
		b += b.length === 1 ? '0' : '';
		return prefix + r + g + b;
	},

	addHsl: function(color, h, s, l){
		var rgb = Phaser.Color.getRGB(color);
		var hsl = common.rgbToHsl(rgb.r, rgb.g, rgb.b);

		if(h === undefined){
			h = 0;
		}
		if(s === undefined){
			s = 0;
		}
		if(l === undefined){
			l = 0;
		}
		h = Math.min(Math.max(hsl.h + h, 0), 1);
		s = Math.min(Math.max(hsl.s + s, 0), 1);
		l = Math.min(Math.max(hsl.l + l, 0), 1);

		var hue = common.hslToRgb(h, s, l);
		return common.rgb(hue.r, hue.g, hue.b);
	},

	textColorChange: function(){
		return function(color){
			if(color !== undefined){
				this.fill = '#' + common.getRgb(color).toString(16);
			}
			return this.fill;
		}
	},

	graphicsColorChange: function(i, property){
		if(property === undefined){
			property = 'fillColor';
		}
		return function(color){
			if(color !== undefined){
				this.color = common.getRgb(color);
				this.graphicsData[i][property] = this.color;
			}
			return this.graphicsData[i].fillColor;
		}
	},

	propertyColorChange: function(property) {
		return function(color){
			if(color !== undefined){
				this[property] = common.getRgb(color);
			}
			return this[property];
		}
	},

	brightness: function(color, diff) {
		var rgb = Phaser.Color.getRGB(color);
		rgb.r = Math.max(0, Math.min(255, rgb.r + diff));
		rgb.g = Math.max(0, Math.min(255, rgb.g + diff));
		rgb.b = Math.max(0, Math.min(255, rgb.b + diff));
		return common.rgb(rgb.r, rgb.g, rgb.b);
	},

	rgbToHsl: function(r, g, b){
	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return {h: h, s: s, l: l};
	},

	hslToRgb: function(h, s, l){
	    var r, g, b;

	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }

	    return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
	},
}












