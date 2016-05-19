/**
 * Created by grizet_j on 5/9/2016.
 */

var c;
var ctx;
var font_size = 10;
var drops = [];
var seed = "bfe08c3b77d3165259d3ea905499f4bda3c34b67a632362914b3062817950889";
var draw_interval;
var predictable;
var erase_gap = 40;

window.onload = function() {


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

    predictable = new Math.seedrandom('FollowTheWhiteRabbit');
    draw_interval = setInterval(draw, 33);
};

//drawing the characters
function draw()
{
    //Black BG for the canvas
    //translucent BG to show trail
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = "#0F0"; //green text
    ctx.font = font_size + "px matrix_code";
    //looping over drops
    for(var i = 0; i < drops.length; i++)
    {
        //a random matrix character to print
        var text = seed[Math.floor(predictable()*seed.length)];

		ctx.fillStyle = "#0F0"; //green text
        //x = i*font_size, y = value of drops[i]*font_size
        ctx.fillText(text, i*font_size, drops[i]*font_size);
		
		console.log(drops[i]);
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
