



var colors = (function()
{
	var Colors = function(){
	
	}
	Colors.prototype.BOARD1 = 0;
	Colors.prototype.BOARD2 = 1;
	Colors.prototype.BOARD3 = 2;
	Colors.prototype.BOARD4 = 3;
	Colors.prototype.BOARD5 = 4;
	Colors.prototype.BOARD6 = 5;
	Colors.prototype.BOARD1_LIGHT = 6;
	Colors.prototype.BOARD2_LIGHT = 7;
	Colors.prototype.BOARD3_LIGHT = 8;
	Colors.prototype.BOARD4_LIGHT = 9;
	Colors.prototype.BOARD5_LIGHT = 10;
	Colors.prototype.BOARD6_LIGHT = 11;
	Colors.prototype.CARD = 12;
	Colors.prototype.CARD_LIGHT = 13;
	Colors.prototype.BLANK = 14;
	Colors.prototype.BLANK_LIGHT = 15;

    // return singleton
    return new Colors();
})();