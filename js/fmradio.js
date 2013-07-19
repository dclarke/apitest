'use strict';

function onradioenable() {
  report('enabled', 'ENABLED');
}

function onradiodisable() {
  report('enabled', "DISABLED");
}

function onantennaavailable() {
  if (navigator.mozFMRadio.antennaAvailable) {
    report("antenna", 'ENABLED');
    navigator.mozFMRadio.enable('89.5');
  } else {
    report("antenna", 'DISABLED');
  }
}

function onfrequencychange() {
  report('frequency', navigator.mozFMRadio.frequency);
}

function onsetFrequency(freq) {
  if(freq < navigator.mozFMRadio.fequencyUpperBound && 
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

report('upperbound', navigator.mozFMRadio.fequencyUpperBound);
report('lowerbound', navigator.mozFMRadio.frequencyLowerBound);


navigator.mozFMRadio.onenable=onradioenable;
navigator.mozFMRadio.ondisable=onradiodisable;
navigator.mozFMRadio.onantennaavailablechange=onantennaavilable;
navigator.mozFMRadio.onfrequencychange=onfrequencychange;

