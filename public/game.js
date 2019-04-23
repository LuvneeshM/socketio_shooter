var socket = io();

//controlls
var player_movement = {
  up: false,
  down: false,
  left: false,
  right: false
}
player_shooting = false
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      player_movement.left = true;
      break;
    case 87: // W
      player_movement.up = true;
      break;
    case 68: // D
      player_movement.right = true;
      break;
    case 83: // S
      player_movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      player_movement.left = false;
      break;
    case 87: // W
      player_movement.up = false;
      break;
    case 68: // D
      player_movement.right = false;
      break;
    case 83: // S
      player_movement.down = false;
      break;
    case 32:
      player_shooting = true;
      break;
  }
});

//user connected, sending to server keyboard state 
socket.emit('new player');
//sending the state of movement 30 times a second
setInterval(function() {
  socket.emit('movement', player_movement);
}, 1000 / 30);
setInterval(function() {
	if(player_shooting){
		socket.emit("shoot")
		player_shooting = false
	}
}, 1000 / 30);

//get the board
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(players, bullets) {
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {
    var player = players[id];
    if(player.health != 0){
	  	//check if collision with bullet
	  	for(var i = 0; i < bullets.length; i++){
	  		var bullet = bullets[i]
	  		if (bullet.bid != player.pid){
	  			bleft = bullet.x - bullet.r
	  			bright = bullet.x + bullet.r
	  			btop = bullet.y - bullet.r
	  			bbot = bullet.y + bullet.r

	  			pleft = player.x - player.r
	  			pright = player.x + player.r
	  			ptop = player.y - player.r
	  			pbot = player.y + player.r

	  			if (bright > pleft && bright < pright && bbot > ptop && bbot < pbot){
	  				console.log("HIIIITTTT")
	  				player.health = 0
	  				socket.emit("pdeath", player.pid)
	  				socket.emit("bdeath", i)
	  			}
	  		}
	  	}
	  	context.fillStyle = player.pcolor;
	    context.beginPath();
	    context.arc(player.x, player.y, player.r, 0, 2 * Math.PI);
	    context.fill();
	}
  }
  for(var i = 0; i < bullets.length; i++){
  	var b = bullets[i]
  	context.fillStyle = "#DC143C"
  	context.beginPath();
    context.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    context.fill();
  }
});