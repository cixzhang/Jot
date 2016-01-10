var Jot = require('../jot.js');
var chai = require('chai');
var expect = chai.expect;

var jsdom = require('jsdom').jsdom();
var window = jsdom.defaultView;
var document = window.document;

describe('a task', function () {
  var task;

  beforeEach(function () {
    task = new Jot.Task();
  });

  it('initializes with a context', function () {
    expect(task.context).to.exist;

    var newContext = {};
    task = new Jot.Task(newContext);
    expect(task.context).to.equal(newContext);
  });

  it('can get or set an input function', function () {
    var input = function () { return 1 + 2; };
    task.i(input);
    expect(task.i()).to.equal(input);
  });

  it('can retrieve the input as a string', function () {
    var input = function () { return 1 + 2; };
    task.i(input);
    expect(task.iString()).to.equal('return 1 + 2;');
  });

  it('accepts a string as an input', function () {
    var stringFn = '1 + 2';
    task.i(stringFn);
    expect(task.iString()).to.equal(stringFn);
    expect(task.i()()).to.equal(3);
  });

  it('can get or set the output', function () {
    var output = 'abc';
    task.o(output);
    expect(task.o()).to.equal(output);
  });

  it('can get or set an element for rendering input', function () {
    var el = document.createElement('div');
    task.into(el);
    expect(task.into()).to.equal(el);
  });

  it('can get or set an element for rendering output', function () {
    var el = document.createElement('div');
    task.outo(el);
    expect(task.outo()).to.equal(el);
  });
});
