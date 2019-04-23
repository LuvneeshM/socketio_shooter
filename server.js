var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app)
var io = socketIO(server);

port = 3000

function Player(id){
    this.moveX = function(value){
        this.x += value
        this.dirX = value/(Math.abs(value))
    }
    this.moveY = function(value){
        this.y += value
        this.dirY = value/(Math.abs(value))
    }

    this.setPlayerColor = function(){
        var letters = "0123456789ABCDEF"
        var color = '#'
        for (var i = 0; i < 6; i++) 
            color += letters[(Math.floor(Math.random() * letters.length))]; 
        return color
    }

    this.pid = id
    this.x = Math.floor(Math.random() * 100+100)
    this.y = 300
    this.dirX = 1
    this.dirY = 1
    this.health = 2
    this.r = 10
    this.pcolor = this.setPlayerColor()
    console.log(this.pcolor)

}

function Bullet(x,y,dirX,dirY,id,pr){
    this.moveX = function(value){
        this.x += value
        this.dirX = value/(Math.abs(value))
    }
    this.moveY = function(value){
        this.y += value
        this.dirY = value/(Math.abs(value))
    }

    this.bid = id
    this.dirX = dirX
    this.dirY = dirY
    this.r = 5
    this.x = (x+2*pr*this.dirX)
    this.y = (y)
}

app.use(express.static(path.join(__dirname, "public")));

//routing
app.get("", function(req, res){
    res.sendFile(__dirname+'/index.html')
})

var players = {}
var bullets = []
//communcations
io.on('connection', function(socket){
    //new player
    socket.on('new player', function(){
        players[socket.id] = new Player(socket.id)
    })
    //movement
    socket.on('movement', function(data) {
        var player = players[socket.id] || {};
        if (data.left) {
          player.moveX(-5);
        }
        if (data.up) {
          player.moveY(-5);
        }
        if (data.right) {
          player.moveX(5);
        }
        if (data.down) {
          player.moveY(5);
        }
    });
    //shooting
    socket.on('shoot', function(){
        var player = players[socket.id]
        bullets.push(new Bullet(player.x, player.y, player.dirX, player.dirY, player.id, player.r))
    })
    //death
    socket.on("pdeath", function(pid){
        delete players[pid]
    })
    socket.on("bdeath", function(pos){
        bullets.splice(pos,1)
    })
    //disconnect
    socket.on('disconnect', function(){
        delete players[socket.id]
    })
})

//update the bullets and move them
setInterval(function(){
    for(var i = 0; i < bullets.length; i++){
        var b = bullets[i]
        b.moveX(b.dirX*10)
        // b.moveY(dirY*5)
    }
}, 1000 / 30)

//think of this as the draw function
setInterval(function() {
  io.sockets.emit('state', players, bullets);
}, 1000 / 60);

server.listen(port, function(){
  console.log('listening on *:'+port);
});