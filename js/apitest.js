"use strict";

window.open('tests/fmradio.html','foobar');

var APITest = {
  get testList() {
    delete this.testList;
    return this.testList = document.getElementById('test-list');
  },
  get iframe() {
    delete this.iframe;
    return this.iframe = document.getElementById('test-iframe');
  },
  get backBtn() {
    delete this.backBtn;
    return this.backBtn = document.getElementById('test-panel-back');
  },
  get panelTitle() {
    delete this.panelTitle;
    return this.panelTitle = document.getElementById('test-panel-title');
  },
  init: function at_init() {
    this.testList.addEventListener('click', this);
    this.iframe.addEventListener('load', this);
    this.iframe.addEventListener('unload', this);
    document.body.addEventListener('transitionend', this);
    window.addEventListener('keyup', this);
    window.addEventListener('hashchange', this);
    this.backBtn.addEventListener('click', this);

    var name = this.getNameFromHash();
    if (name)
      this.openTest(name);
  },
  uninit: function at_uninit() {
    this.testList.removeEventListener('click', this);
    this.iframe.removeEventListener('load', this);
    this.iframe.removeEventListener('unload', this);
    document.body.removeEventListener('transitionend', this);
    window.removeEventListener('keyup', this);
    window.removeEventListener('hashchange', this);
    this.backBtn.removeEventListener('click', this);
  },
  getNameFromHash: function at_getNameFromHash() {
    return (/\btest=(.+)(&|$)/.exec(window.location.hash) || [])[1];
  },
  handleEvent: function at_handleEvent(ev) {
    switch (ev.type) {
      case 'click':
        if (ev.target != this.backBtn) {
          return;
        }
        if (window.location.hash) {
          window.location.hash = '';
        }
        break;
      case 'load':
        this.iframe.contentWindow.addEventListener('keyup', this);
        break;
      case 'unload':
        this.iframe.contentWindow.removeEventListener('keyup', this);
        break;
      case 'hashchange':
        var name = this.getNameFromHash();
        if (!name) {
          this.closeTest();
          return;
        }
        this.panelTitle.textContent = name.replace(/_/g, ' ');
        this.openTest(name);
        break;
      case 'transitionend':
        var name = this.getNameFromHash();
        if (!name)
          this.iframe.src = 'about:blank';
        break;
    }
  },
  openTest: function at_openTest(name) {
    document.body.classList.add('test');

    var self = this;
    window.setTimeout(function openTestPage() {
      self.iframe.src = './tests/' + name.toLowerCase() + '.html';
    }, 200);
},
  closeTest: function at_closeTest() {
    var isOpened = document.body.classList.contains('test');
    if (!isOpened)
      return false;
    document.body.classList.remove('test');
    return true;
  }
};

window.onload = APITest.init.bind(APITest);
