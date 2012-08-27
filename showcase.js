require('./lang.node');
var rest = require("restler");

function Point(xy) {
  this.x = this[0] = xy.first;
  this.y = this[1] = xy.last;
}

rest.get("https://api.bitfloor.com/trades/1").on('complete', function(data){
  var result = $H(data.pluck('price.toFloat', 'size.toFloat'));
  result = result.map(function(point) {
    return new Point(point);
  });//.sortBy('x'._);
  
  // an array of data points; x-axis: price, y-axis: quantity
  //console.log(result);
  console.log(result.maxBy('y'._))
});
