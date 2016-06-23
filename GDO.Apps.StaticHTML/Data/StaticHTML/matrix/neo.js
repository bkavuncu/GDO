/**
 * Created by grizet_j on 5/9/2016.
 */

var c;
var ctx;
var font_size = 10;
var drops = [];
var seed = "bfe08c3b77d3165259d3165d31d3ea905499f4bda3c34b67a632362914b3062817950889d3165259d3ea905499f";
var random_seed = "FollowTheWhiteRabbit"
var draw_interval;
var predictable;
var erase_gap = 40;
var color =  "#0F0"; //green text

var query_string = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();

window.onload = function() {

	if ("seed" in query_string)
		random_seed = query_string["seed"];
	if ("color" in query_string)
		color = query_string["color"];
	if ("font_size" in query_string)
		font_size = parseInt(query_string["font_size"]);

    c = document.getElementById("screen");
    ctx = c.getContext("2d");
    c.height = window.innerHeight;
    c.width = window.innerWidth;
	erase_gap = c.height / font_size / 2;


    var columns = c.width/font_size; //number of columns for the rain

    //x below is the x coordinate
    //1 = y co-ordinate of the drop(same for every drop initially)
    for(var x = 0; x < columns; x++)
        drops[x] = 1;

    predictable = new Math.seedrandom(random_seed);
    draw_interval = setInterval(draw, 33);
};

//drawing the characters
function draw()
{
    //Black BG for the canvas
    //translucent BG to show trail
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.font = font_size + "px matrix_code";
    //looping over drops
    for(var i = 0; i < drops.length; i++)
    {
        //a random matrix character to print
        var text = seed[Math.floor(predictable()*seed.length)];

		ctx.fillStyle = color; //green text
        //x = i*font_size, y = value of drops[i]*font_size
        ctx.fillText(text, i*font_size, drops[i]*font_size);
		
		//Erase the drop at y - 10
		if (drops[i]  - erase_gap >= 0) {
			ctx.fillStyle = "#000"; //Black eraser
			ctx.fillText(String.fromCharCode(9608), i*font_size, (drops[i] - erase_gap)*font_size);
		}
        //sending the drop back to the top randomly after it has crossed the screen
        //adding a randomness to the reset to make the drops scattered on the Y axis
        if(drops[i]*font_size > c.height && predictable() > 0.99)
            drops[i] = 0;

        //incrementing Y coordinate
        drops[i]++;
    }
}
