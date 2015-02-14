;(function (root) {
  var Jot = {};
  if (typeof module !== 'undefined' && module.exports) module.exports = Jot;
  else root.Jot = Jot;

  Jot.Task = Task = function (context) {
    this.context = context || {};
    this.props = {
      fn: null,
      into: null,
      outo: null
    };
    return this;
  };

  Task.prototype.into = function (el) {
    if (typeof el === 'undefined') return this.props.into;
    this.props.into = el;
    return this;
  };

  Task.prototype.outo = function (el) {
    if (typeof el === 'undefined') return this.props.outo;
    this.props.outo = el;
    return this;
  };

  Task.prototype.invade = function (el) {
    var container = getElement(el);
    if (container) {
      var inputEl = document.createElement('code');
      var outputEl = document.createElement('code');

      var inputPre = document.createElement('pre');
      var outputPre = document.createElement('pre');

      container.appendChild(inputPre).appendChild(inputEl);
      container.appendChild(outputPre).appendChild(outputEl);

      this.into(inputEl).outo(outputEl);
    }
    return this;
  };

  Task.prototype.instruct = function (fn) {
    if (typeof fn === 'undefined') return this.props.fn;
    this.props.fn = fn;
    return this;
  };

  Task.prototype.run = function (newFn) {
    if (newFn) this.instruct(newFn);
    var fn = this.instruct(),
        into = this.into(),
        outo = this.outo();

    if (fn) {
      if (into) {
        into.innerHTML = escapeTags(fn.toString());
      }
      if (outo) {
        outo.innerHTML = '';
        var output = tryCatch(fn, this.context);
        if (output instanceof Element) {
          outo.appendChild(output);
        } else {
          if (!detectTags(output)) output = JSON.stringify(output);
          outo.innerHTML = output;
        }
      }
    }
    return this;
  };

  Jot.TaskSet = TaskSet = function () {
    this.context = {};
    this.tasks = [];
    return this;
  };

  TaskSet.prototype.createTask = function (inputEl, outputEl) {
    var task = new Task(this.context);

    if (!outputEl) task.invade(inputEl);
    else task.into(inputEl).outo(outputEl);

    this.tasks.push(task);
    return task;
  };

  TaskSet.prototype.run = function () {
    this.tasks.forEach(function (task) { task.run(); });
    return this;
  };

  function getElement (query) {
    if (query instanceof Element) return query;
    if (query instanceof Array) return query[0];
    if (typeof query === 'string') return document.querySelector(query);
  }

  function detectTags (string) {
    var hasTags = false;
    if (typeof string === 'string')
      hasTags = escapeTags(string).length !== string.length;
    return hasTags;
  }

  function escapeTags (string) {
    string = string.replace(/</g, '&lt;');
    string = string.replace(/>/g, '&gt;');
    return string;
  }

  function tryCatch (fn, ctx) {
    try {
      var r = fn.call(ctx);
      return r;
    } catch (e) {
      return e;
    }
  }

  return;
})(this);
