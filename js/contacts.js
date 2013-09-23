'use strict';


var contactsdb = [{"name": "John Smith", 
                   "familyName": "Smith", 
                   "givenName": "John", 
                   "email": "john@google.com", 
                   "tel": [{type: ["work"], value:"19834451515", carrier: "testCarrier"}]},
                  {"name": "Tony Weston",
                   "familyName": "Weston", 
                   "givenName": "Tony", 
                   "email": "tony@google.com", 
                   "tel": [{type: ["work"], value:"19815551212", carrier: "testCarrier"}]}, 
                  {"name": "Clark Kent",
                   "familyName": "Kent", 
                   "givenName": "Clark", 
                   "email": "superman@kryptonite.com",
                   "tel":  [{type: ["work"], value: "14155551212", carrier: "testCarrier"}]}];

var contact; 
var notifications = {'update' : 0, 
                    'create' : 0,
                    'remove' : 0 };

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

function clear() {
  var request = navigator.mozContacts.clear();
  request.onsuccess = function () {
    var search = navigator.mozContacts.getAll({});
    search.onsuccess = function (evt) {
      var cursor = evt.target; 
        report('clear', 'Clear has worked', 'Clear still has objects', cursor.done);
    };
    search.onerror = function () {
      report('clear', 'Clear through an error', '', false);
    };
    
  };
  request.onerror = function () {
    report('clear', '','Clear has failed', false);
  };
  notifications = {'update' : 0,
                    'create' : 0,
                    'remove' : 0 };
} 
function addContacts (next) {
  var successes = 0;
  for (var i = 0; i < contactsdb.length ; i++) {
    contact = new mozContact();
    contact.init(contactsdb[i]);
    navigator.mozContacts.oncontactchange = function(event) {
      notifications[event.reason] += 1;     
      if (successes == contactsdb.length) {
        next();
      }
    };
    var request = navigator.mozContacts.save(contact);
    request.onsuccess = function () {
      successes++;
      if(successes == contactsdb.length) {
        report('add', 'Saved All ' + i  + ' contacts successfully', 
                       'Failed to save all contacts', successes == i);
      }
    };
    request.onerror = function (evt) {
      report('add','', 'Failed to save contacts' + JSON.stringify(request.error), false);
      successes = -100;
    };
  }
}

function getAll(next) {
  var search = navigator.mozContacts.getAll({sortBy: "familyName", sortOrder: "descending"});
  var found = 0;
  search.onsuccess = function(evt) {
    if(evt.target.result) {
      var getContact = evt.target.result;
      for(var i = 0; i < contactsdb.length ; i++) {
        if (getContact.name == contactsdb[i].name) {
          found++;
        }
      }
      search.continue();
    }
    report('getAll', 'Got all contacts', "Didn't get previously added contacts " + found, found == contactsdb.length);
    next();
  };
  search.onerror = function () {
    report('getAll', '', 'getAll threw an error', false);
  };
}

function find(next) {
  var options = {filterBy: ["tel"],
                   filterOp: "match",
                   filterValue: "14155551212"};
  var req = navigator.mozContacts.find(options);

  req.onsuccess = function () {
    report('find', 'Found Contact with filter parameters', 
                   "Didn't find contact with filter parameters", 
                   req.result.length == 1 &&
                   req.result[0].givenName == "Clark" &&
                   req.result[0].familyName == "Kent");
    if(req.result.length > 0) {
      contact = req.result[0];
      next();
    }
  };
  req.onerror = function () {
    report('find', '','Find Failed', false);
  };
}

function update(next) {
  contact.familyName = "Kal-El";
  console.log(contact.id);
  var request = navigator.mozContacts.save(contact);
  request.onsuccess = function () {
    var search = mozContacts.find({filterBy: ["familyName"] ,
                                   filterOp: ["equals"], 
                                   filterValue: "Kal-El"});
    search.onsuccess = function () {
      report('update', 'Successfully updated familyName', 'Unsuccessfully updated familyName', search.result.length == 1);
      contact = search.result[0];
      next();
    }; 
    search.onerror = function () {
      report('update', '', 'Update failed', false);
    };
  };
  request.onerror = function (e) {
    report('update', '', 'Update failed at save ' + JSON.stringify(request.error.name), false);
  };
}

function removeContact(next) {
  var request = navigator.mozContacts.remove(contact);
  request.onsuccess = function () {
    var search = navigator.mozContacts.find({filterBy: ["familyName"],
                                   filterOp: ["equals"], 
                                   filterValue: "Kal-El"});
    search.onsuccess = function () {
      report('remove', 'Successfully removed contact', "Unsuccessfully removed contact", search.result.length == 0);
      contact = search.result[0];
      next();
    };
    search.onerror = function () {
      report('remove', '', 'Search for removed failed', false);
    };
  };
  request.onerror = function () {
    report('remove', '', 'Remove failed', false);
  };
}
 
function checkNotifications() {
  console.log(JSON.stringify(notifications));

};
 
function go() {
 var steps = [ 
               addContacts,
               getAll,
               find,
               update,
               removeContact,
               checkNotifications
              ];
 runAll(steps);
}


function selfTest() {
  return navigator.mozContacts !== undefined &&
         navigator.mozContacts.save !== undefined &&
         navigator.mozContacts.getAll !== undefined &&
         navigator.mozContacts.find !== undefined &&
         navigator.mozContacts.clear !== undefined &&
         navigator.mozContacts.remove !== undefined;
}

var clickHandlers = {

  'runall': function () {
    go();
  },
  'clear': function () {
    clear();
  }
};

report('selftest', 'PASS', 'FAIL', selfTest());

document.body.addEventListener('click', function (evt) {
  if (clickHandlers[evt.target.id || evt.target.dataset.fn])
    clickHandlers[evt.target.id || evt.target.dataset.fn].call(this, evt);
});
