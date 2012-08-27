require('should');
require('../lang.node.js');

describe('Object', function() {
  describe('#extend()', function() {
    it("should extend an object with theproperties of another", function() {
      var object = Object.extend({a: true}, {b: 1});
      object.should.have.property('a', true);
      object.should.have.property('b', 1);
    });
  });
  
  describe('#_send()', function() {
    it("should call the function passed in by name and return the result", function() {
      var result = [1,2]._send('toString');
      result.should.eql('1,2');
    });
    
    it("should return the value of the property passed in by name", function() {
      var result = [1,2]._send('length');
      result.should.eql(2);
    });
  });
  
  describe('#tap()', function() {
    it("should allow you to call things and chain and stuff...", function() {
      var obj = {};
      obj.tap(function(self) {
        self.awesome = true;
      });
    });
  });
});

describe('Array', function() {
  var array;
  
  beforeEach(function() {
    array = ['1','2','3'];
  });
  
  describe('#clear()', function() {
    it("should empty out the array", function() {
      array.clear();
      array.should.be.empty;
    });
  });
  
  describe('#first', function() {
    it("should return the first element of the array", function() {
      var result = array.first;
      result.should.equal('1');
    });
  });
  
  describe('#last', function() {
    it("should return the last element of the array", function() {
      var result = array.last;
      result.should.equal('3');
    });
  });
  
  describe('#inject()', function() {
    it("should return something...", function() {
      var result = array.inject(0, function(memo, n) {
        return memo + n.toInt();
      });
      result.should.equal(6);
    });
  });
  
  describe('#pluck()', function() {
    it("should return something also...", function() {
      var result = array.pluck('length');
      result.should.be.an.instanceof(Array);
      result.should.eql([1,1,1]);
    });
  });
});
