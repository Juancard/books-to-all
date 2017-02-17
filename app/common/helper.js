'use strict';

var helper = {
  shake: function shake(div, interval=100, distance=10, times=4) {
    $(div).css('position','relative');

    for(let iter=0;iter<(times+1);iter++){
        $(div).animate({
            left:((iter%2==0 ? distance : distance*-1))
            },interval);
    }

    $(div).animate({ left: 0},interval);
  }
}
