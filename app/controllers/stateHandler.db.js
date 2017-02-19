'use strict';

function stateHandler (states = [], defaultStatePosition=0) {
  this.states = states,
  this.defaultStatePosition = defaultStatePosition,

  this.stateStringToNumber = (stateString) => {
    console.log("statesHnadler: in string to numeber");

    stateString = stateString.trim().toLowerCase();
    let stateNumber = this.states.indexOf(stateString);
    return (stateString == -1)? this.defaultStatePosition : stateNumber;
  },

  this.stateNumberToString = (stateNumber) => {
    console.log("statesHnadler: in number to string");

    if (stateNumber >= this.states.length)
      stateNumber = this.defaultStatePosition;
    return this.states[stateNumber];
  }
}

module.exports = stateHandler;
