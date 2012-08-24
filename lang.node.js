function self(x) { return x; }

function $A(iterable) {
  if(!iterable) return [];
  if(iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, result = new Array(length);
  while(length--) result[length] = iterable[length];
  return result;
}

/**
 * Object
 */

Object.extend = function(destination) {
  var args = $A(arguments).slice(1);
  
  args.forEach(function(source) {
    for(var property in source)
      if(source.hasOwnProperty(property))
        destination[property] = source[property];
  });
  
  return destination;
};

Object.extend(Object.prototype, {
 _send: function(message) {
    var response = this[message];
    if(response instanceof Function) {
      var args = $A(arguments).slice(1);
      
      if(args.length == response.length) {
        response = response.apply(this, args);
      }
    }
    return response;
  },
  tap: function(callback) {
    callback(this);
    return this;
  }
});

Object.defineProperty(Object.prototype, '_', {
  get: function() {
    return this.toProc;
  }
});

/**
 * Enumerable
 */

var Enumerable = {
  inject: function(memo, iterator) {
    if(memo instanceof Function) {
      iterator = memo;
      memo = undefined;
    }
    
    this.forEach(function(value, index) {
      if(memo === undefined) memo = value; // Uh, it's all I can think to do.
      memo = iterator(memo, value, index);
    });
    return memo;
  },
  
  pluck: function(first) {
    var args = $A(arguments);
    return this.map(args.length > 1 ? args.toProc : first.toProc);
  },
  
  grep: function(filter, iterator) {
    iterator = iterator || self;
    var result = [];
    this.forEach(function(value) {
      if(filter.match(value)) {
        result.push(iterator.call(value));
      }
    });
    return result;
  },
  
  sortBy: function(iterator) {
    return this.map(function(value) {
      return {
        value: value,
        criteria: iterator(value)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },
  
  toArray: function() {
    return this.map();
  }
};

/**
 * Array
 */

Object.extend(Array.prototype, Enumerable, {
  clear: function clear() {
    this.length = 0;
    return this;
  }
});

Object.defineProperty(Array.prototype, 'toProc', {
  get: function() {
    var procs = this.map('toProc'.toProc);
    return function(thing) {
      return procs.map(function(proc) {
        return proc(thing);
      });
    };
  }
});

Object.defineProperty(Array.prototype, 'first', {
  get: function() {
    return this[0];
  }
});

Object.defineProperty(Array.prototype, 'last', {
  get: function() {
    return this[this.length-1];
  }
});

/**
 * Hash
 */

function Hash(object) {
  this._object = object;
}

Object.extend(Hash.prototype, Enumerable, {
  forEach: function(iterator) {
    for(var key in this._object) {
      if(this._object.hasOwnProperty(key)) {
        var value = this._object[key], pair = [key, value];
        Object.extend(pair, {key: key, value: value});
        iterator(pair);
      }
    }
  },
  
  map: function(iterator) {
    var result = [];
    iterator = iterator || self;
    
    this.forEach(function(value) {
      result.push(iterator(value));
    });
    
    return result;
  }
});

function $H(object) {
  return new Hash(object);
}

/**
 * Range
 */

function Range(start, end, exclusive) {
  this.start     = start;
  this.end       = end;
  this.exclusive = exclusive;
}

Object.extend(Range.prototype, {
  forEach: function(iterator) {
    var value = this.start;
    while(this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  },
  
  include: function(value) {
    if(value < this.start) return false;
    if(this.exclusive) return value < this.end;
    return value <= this.end;
  }
});

function $R(start, end, exclusive) {
  return new Range(start, end, exclusive);
}

/**
 * Number
 */

Object.extend(Number.prototype, {
  succ: function() {
    return this + 1;
  },
  
  times: function(iterator) {
    $R(0, this, true).forEach(iterator);
    return this;
  }
});

['abs', 'round', 'ceil', 'floor'].forEach(function(method) {
  Number.prototype[method] = function() {
    return Math[method](this);
  };
});


/**
 * String
 */

Object.extend(String.prototype, {
  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },
  
  toInt: function(radix) {
    radix = radix || 10;
    return parseInt(this, radix);
  },
  
  toFloat: function() {
    return parseFloat(this);
  }
});

Object.defineProperty(String.prototype, 'toProc', {
  get: function() {
    var messages = this.split('.');
    return function(thing) {
      return messages.inject(thing, function(obj, message) {
        return obj._send(message);
      });
    };
  }
});
