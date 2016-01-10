;(function (root) {
  var Jot = {};
  if (typeof module !== 'undefined' && module.exports) module.exports = Jot;
  else root.Jot = Jot;

  var Task = Jot.Task = function (context) {
    this.context = context || {};
    this.props = this.props || {
      i: undefined,
      o: undefined,
      into: null,
      outo: null,
      iString: null
    };
    return this;
  };

  Task.prototype.i = function (fn) {
    if (typeof fn === 'undefined') return this.props.i;
    if (typeof fn === 'function') {
      this.props.i = fn;
      this.props.iString = cleanInput(fn);
    } else if (typeof fn === 'string') {
      var contextualEval = this.eval;
      this.props.iString = fn;
      this.props.i = function () {
        return contextualEval(fn);
      };
    }
    return this;
  };

  Task.prototype.iString = function () {
    return this.props.iString;
  };

  Task.prototype.o = function (o) {
    if (typeof o === 'undefined') return this.props.o;
    this.props.o = o;
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

  Task.prototype.eval = function (str) {
    return eval(str);
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

  Task.prototype.render = function () {
    var iString = this.iString(),
        o = this.o(),
        into = this.into(),
        outo = this.outo();

    if (outo) outo.innerHTML = '';

    if (typeof iString !== 'undefined' && into) into.innerHTML = iString;

    if (typeof o !== 'undefined' && outo) {
      if (o instanceof Element) {
        outo.appendChild(o);
      } else {
        if (o instanceof Error) o = o.toString();
        else if (!detectTags(o)) o = JSON.stringify(o);
        outo.innerHTML = o;
      }
    }

    return this;
  };

  Task.prototype.run = function (newFn) {
    if (newFn) this.i(newFn);
    var i = this.i();

    if (i) {
      var out = tryCatch(i, this.context);
      if (out && (out instanceof Promise || out.then)) {
        return out.then(this.o.bind(this))
                  .then(this.render.bind(this));
      }
      this.o(out);
    }

    this.render();
    return this;
  };

  Task.prototype.reset = function () {
    this.props.o = undefined;
    return this;
  };

  var TaskSet = Jot.TaskSet = function () {
    this.context = {};
    this.tasks = [];
    return this;
  };

  TaskSet.prototype.addTask = function (task) {
    Jot.Task.call(task, this.context);
    this.tasks.push(task);

    return this;
  };

  TaskSet.prototype.createTask = function (inputEl, outputEl) {
    var task = new Task(this.context);

    if (!outputEl) task.invade(inputEl);
    else task.into(inputEl).outo(outputEl);

    this.tasks.push(task);
    return task;
  };

  TaskSet.prototype.render = function () {
    this.tasks.forEach(function (task) { task.render(); });
    return this;
  };

  TaskSet.prototype.run = function () {
    this.tasks.forEach(function (task) { task.run(); });
    return this;
  };

  TaskSet.prototype.reset = function () {
    this.tasks.forEach(function (task) { task.reset(); });
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

  function cleanInput (input) {
    var start = /^function[A-z\s]*\([\s]*\)[\s]*\{\n*/, // Matches the beginning of a function "function xyz () {".
        end = /[\n\s]*\}$/, // Matches the end of a function " }".
        indent = /^[\s]+/, // Matches the first indentation.
        cleaned = escapeTags(input.toString());

    cleaned = cleaned.replace(start, '');
    cleaned = cleaned.replace(end, '');

    var indents = cleaned.match(indent);
    if (indents) {
      // If we find an indent, clean it from each line.
      var baseIndent = new RegExp('^' + indents[0], 'gm');
      cleaned = cleaned.replace(baseIndent, '');
    }
    return cleaned;
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
