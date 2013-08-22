'use strict';


function runAll(steps) {
  // Clone the array so we don't modify the original.
  steps = steps.concat();

  function next() {
    if (steps.length) {
      steps.shift()(next);
    } else {
    }
  }
  next();

}

function logresult(testname, result, msg) {
  
  var span = document.getElementById(testname);
  var my_results = document.getElementById("results");
  if(!span) {
    var test = document.createElement("br");
    span = document.createElement("span");
    span.classList.add("result");
    span.id = testname;
    span.appendChild(document.createTextNode(msg));
    var my_results = document.getElementById("results");
    my_results.appendChild(test);
    my_results.appendChild(span);
  } 
  report(testname, msg, msg, result);
}

function selfTest() {
  return navigator.getDeviceStorage("kilimanjaro") == undefined &&
         navigator.getDeviceStorage("pictures") !== undefined &&
         navigator.getDeviceStorage("music") !== undefined &&
         navigator.getDeviceStorage("videos") !== undefined;
}

function getRandomBuffer() {
  var size = 1024;
  var buffer = new ArrayBuffer(size);
  var view = new Uint8Array(buffer);
  for (var i = 0; i < size; i++) {
    view[i] = parseInt(Math.random() * 255);
  }
  return buffer;
}

function createRandomBlob(mime) {
  var blob = null;
  return blob = new Blob([getRandomBuffer()], {type: mime});
}

function addfiles(next) {
  var success = 0; 
  for (var i=0;i < activefiles.length; i++)  {
    var request = gStorage.addNamed(createRandomBlob(blobTypes[i]), activefiles[i]);
    request.onsuccess = function () {
      success +=1;
      if (success == activefiles.length) {
        logresult("add", true, success + " files successfully added of " + activefiles.length);
        next();
      }
    };
    request.onerror = function () {
      logresult("add", false, "error adding file: " + activefiles[i]);
    };
  }
}

function setup (next) {
  var setupSteps = [ deletefiles, 
                     freespace,
                     usedspace, 
                     available,
                     addChangeListener,
                     addfiles,
                     next ];
  console.log("in setup " +gStorageType);              
  var index = storageTypes.indexOf(gStorageType);
  activefiles = files[index];
  console.log(setupSteps.length);
  runAll(setupSteps);
}


function freespace(next) {
  var request = gStorage.freeSpace();
  request.onsuccess = function () {
    if(!free) {
      free = this.result;
      console.log(free);
    } else {
      console.log(free);
      var space = free - this.result;
      var msg = "Lost space = " + (space / 1000).toFixed(2);
      logresult('freespace', space > 1000, msg);
      free = null;
    }
    next();
  };
}

function usedspace(next) {
  console.log("in usedspace");
  var request = gStorage.usedSpace();
  request.onsuccess = function () {
    if (used == null) {
      used = this.result;
    } else {
      
      var space = this.result - used;
      var msg = "Used space differential = " + (space / 1000).toFixed(2);
      logresult('usedspace', space > 1000, msg);
      used = null; 
    }
    next();
  }
}

function available(next) {
  var request = gStorage.available();
  request.onsuccess = function () {
    if(avail == null) {
      avail = this.result;
    } else { 
      var space = avail - this.result;
      console.log("space = " + space);
      var msg = "Available space differential = " + (space / 1000).toFixed(2);
      logresult('available', space > 1000, msg);
      avail = null;
    }
    next();
  }
}

function get(next) {
  var index = storageTypes.indexOf(gStorageType);
  var file = activefiles[0];
  console.log('get file = ' + file);
  var request = gStorage.get(file);
  request.onsuccess = function ()  {
    logresult('get', this.result.name, "Get: successfully verified: " + this.result.name);
                     //this.result.size && 
                     //this.result.type &&
                     //this.result.lastModifiedDate
                     //, "Get: successfully verified: " + this.result.name); 
    next();
  }
}

function enumerate(next) {
  var cursor = gStorage.enumerate();
  var enumeratedfiles = [];
  var pass = true;
  console.log("entered enumerate");
  cursor.onsuccess = function () {
     if (cursor.result !== null) {
       enumeratedfiles.push(cursor.result.name);
       cursor.continue(); 
     } else {
       for each (var file in activefiles) {
         if(enumeratedfiles.indexOf(file) < 0) {
           pass = false;
         }
       }
       console.log(enumeratedfiles.toString());
       logresult("enumerate", pass, "found : " + enumeratedfiles.toString());
       next();
     }
  }
}

function enumerateeditable(next) {
  var cursor = gStorage.enumerateEditable(); 
  var enumeratedfiles = [];
  var pass = true;
  cursor.onsuccess = function () {
    if (cursor.result !== null) { 
      enumeratedfiles.push(cursor.result.name);
      cursor.continue();
    } else {
      for each (var file in activefiles) {
         if(enumeratedfiles.indexOf(file) < 0) {
           pass = false;
         }
      }
      logresult("enumerateeditable", pass, "found : " + enumeratedfiles.toString());
      next();
    }
  }
}

function onChange(change) {
  console.log("got change event: " +change.reason );
  changeevents[change.reason]+=1;
}
function addChangeListener(next) {
  
  gStorage.addEventListener("change", onChange);
  var func = function() { next(); console.log("called next"); };
  console.log('added event listener');
  window.setTimeout(func, 500);
}

function changed() {
  gStorage.removeEventListener("change", onChange);
  logresult("createdevents", changeevents["created"] == 1 ? true : false, 
            "Logged created events: " +  changeevents["created"]);
  logresult("modifiedevents", changeevents["modified"] == 1 ? true : false, 
            "Logged modified events: " +  changeevents["modified"]);
  logresult("deletedevents", changeevents["deleted"] == 1 ? true : false,
            "Logged deleted events: " +  changeevents["deleted"]);
  changeevents['created'] = 0;
  changeevents['modified'] = 0;
  changeevents['deleted'] = 0;
}

function deletefiles(next) {
  var success = 0;
  if (typeof activefiles === "string") {
    activefiles = [activefiles];
  }
  console.log(activefiles[0]);
  for (var i=0;i < activefiles.length; i++)  {
    var request = gStorage.delete(activefiles[i]);
    request.onsuccess = function () {
      success +=1;
      if (success == activefiles.length) {
        logresult("delete", true, success + " files successfully deleted of " + activefiles.length);
        next();
      }
    };
    request.onerror = function () {
      logresult("delete", false, "failure deleting file " + activefiles[i]);
    };
  }
}

report('selftest', 'PASS', 'FAIL', selfTest());

var storageTypes = ["pictures", "videos", "music", "sdcard"];
var blobTypes = ["image/png", "video/ogv", "audio/mp3", "text/plain"];
var files = [["a.png", "b.png", "c.png"], 
             ["a.ogv", "b.ogv"],
             ["a.mp3", "b.mp3", "c.mp3"], 
             ["plain.txt"]];

var activefiles = null;
var gStorage = navigator.getDeviceStorage("sdcard");

var gStorageType = "sdcard";
var avail = null;
var used = null;
var free = null;

var changeevents = new Array();
changeevents['created'] = 0; 
changeevents['modified'] = 0; 
changeevents['deleted'] = 0; 

var orders = [
  setup,
  freespace,
  usedspace, 
  available,
  enumerate,
  enumerateeditable,
  get,
  deletefiles,
  changed,
];

var clickHandlers = {
  'ds_select': function (evt) {
    console.log("ds_select hit: " + evt.target.value);
    gStorage = navigator.getDeviceStorage(evt.target.value);
    gStorageType = evt.target.value;
     
    runAll(orders);
    console.log("runAll happened");
  }
};

document.body.addEventListener('change', function (evt) {
                               if (clickHandlers[evt.target.id || evt.target.dataset.fn])
                               clickHandlers[evt.target.id || evt.target.dataset.fn].call(this, evt);
                               });

window.onload = function () {
  var dstorages_txt  = "";

  for (var types in storageTypes) {
    var dstorages = navigator.getDeviceStorages(types); 
    for (var i = 0; i < dstorages.length; i++) {
      dstorages_txt = dstorages_txt.concat(dstorages[i].storageName, ", ");
    }
  }

  console.log("onload processing " + dstorages_txt );
  logresult("dstorages", true, "storages available : " + dstorages_txt);
  runAll(orders);
}
