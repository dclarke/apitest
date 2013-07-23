'use strict';

function onRadioEnable() {
  report('enabled', 'ENABLED');
}

function onRadioDisable() {
  report('enabled', "DISABLED");
}

function onAntennaAvailable() {
  if (navigator.mozFMRadio.antennaAvailable) {
    report("antenna", 'ENABLED');
    navigator.mozFMRadio.enable('89.5');
  } else {
    report("antenna", 'DISABLED');
  }
}

function onFrequencyChange() {
  report('frequency', navigator.mozFMRadio.frequency);
}

function onSetFrequency(freq) {
  if(freq < navigator.mozFMRadio.frequencyUpperBound && 
    freq > navigator.mozFMRadio.frequencyLowerBound) {
    navigator.mozFMRadio.setFrequency(freq);
  }
}

function updateValues() {
  report('charging', navigator.battery.charging);
  report('chargingtime', navigator.battery.chargingTime);
  report('dischargingtime', navigator.battery.dischargingTime);
  report('level', navigator.battery.level);
}

report('upperbound', navigator.mozFMRadio.frequencyUpperBound);
report('lowerbound', navigator.mozFMRadio.frequencyLowerBound);


navigator.mozFMRadio.onenable=onRadioEnable;
navigator.mozFMRadio.ondisable=onRadioDisable;
navigator.mozFMRadio.onantennaavailablechange=onAntennaAvilable;
navigator.mozFMRadio.onfrequencychange=onFrequencyChange;

