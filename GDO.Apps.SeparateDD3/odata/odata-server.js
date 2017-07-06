var odata = require('node-odata');

var server = odata('mongodb://localhost/scatterplot');

server.resource('scatterplot33', {
  x: Number,
  y: Number
}); 

server.resource('scatterplot100', {
  x: Number,
  y: Number
}); 

server.resource('barData', {
  country: String,
  gdp: Number
}); 

server.resource('pieData', {
  country: String,
  gdp: Number
}); 

server.listen(35555, function(){
    console.log("# odata server is up #");
});       