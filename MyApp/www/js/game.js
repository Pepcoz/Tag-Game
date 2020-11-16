const { fromEvent } = rxjs;
const { map, auditTime } = rxjs.operators;

const backGroundColor = ''

const seekerColor = "red";
const hiderColor = "blue";

const gameScreen = document.getElementById('gameScreen');

let main = document.querySelector('main');

let canvas;
let ctx;



var first = 0;
var id = -1;

var player = {};

var ip = localStorage.getItem("ip");

const socket = io.connect('http://'+ip+':3000');

function init() {
    

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = 399;
    canvas.height = 399;
    ctx.fillStyle = "white";

    ctx.fillRect(0,0,canvas.width, canvas.height);
}

init();

// Socket input; from server
fromEvent(socket,'all_players').pipe(
    map(
        (x) => JSON.parse(x)
    )
  ).subscribe(function(player_array) {
        if(first === 0){
            id = player_array[player_array.length - 1].playerID;
            first = 1;
            
        }
        for(var i = 0; i < player_array.length; i++){
            if(id === player_array[i].playerID ){
                player = player_array[i];
            }
        }
        draw(player_array);
  });




const seekerPU = {
    on: true,
    position: {x: 10, y: 8},
}

const invisPU = {
    position: {x: 17, y: 3},
}

const layout = 
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,1,0,1,0,1],
        [1,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
        [1,1,1,1,0,1,1,0,0,0,0,0,0,1,0,1,1,1,1,0,1],
        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1],
        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1],
        [1,1,1,0,0,1,1,1,1,1,0,0,1,0,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,0,0,0,0,0,0,1,1,1,1,0,0,1,1,0,0,1,0,1,1],
        [1,0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,1,1,0,1,0,0,1,1,0,0,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
 
    ];

const gridSize = 19;

//console.log(layout);



function draw(player_array){
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    const size = canvas.width / gridSize;

    ctx.fillStyle = "black";
    for(let y = 0; y < layout.length; y++){
        for(let x = 0; x < layout[y].length; x++){
            if(layout[y][x] === 1){
                ctx.fillStyle = "black";
                ctx.fillRect(x*gridSize,y*gridSize,size, size);
            }
        }
    }

    if(player_array[0].seekerPU){
        ctx.fillStyle = "orange";
        ctx.fillRect(seekerPU.position.x*gridSize,seekerPU.position.y*gridSize,size, size);
    }

    if(player_array[0].invisPU){
        ctx.fillStyle = "yellow";
        ctx.fillRect(invisPU.position.x*gridSize,invisPU.position.y*gridSize,size, size);
    }

    for(var i = 0; i < player_array.length; i++){
        if(player_array[i].seeker){
            ctx.fillStyle = "blue";
        }else{
            ctx.fillStyle = "red";
        }

        if(player_array[i].playerID === id && player_array[i].invis === true){
            ctx.fillStyle = "pink";
        }
        
        if(player_array[i].alive === true){
            if(player_array[i].invis !== true || player_array[i].playerID === id){
                ctx.fillRect(player_array[i].position.x*gridSize, player_array[i].position.y*gridSize,size, size);
            }
            
        }
        if(player_array[i].alive !== true && player_array[i].playerID === id){
            ctx.fillStyle = "brown";
            ctx.fillRect(player_array[i].position.x*gridSize, player_array[i].position.y*gridSize,size, size);
        }
        
    }
    

    
    
}


function checkInvis1(){
    if(invis1.on === true){
        if(player1.position.x === invis1.position.x && player1.position.y === invis1.position.y){
            invis1.on = false;
            setTimeout(function(){
                invis1.on = true;
                draw();
            },5000)
        }
    }
}

var key;


function setUP(){
    key = "up";
}

function setLEFT(){
    key = "left";
}

function setRIGHT(){
    key = "right";
}

function setDOWN(){
    key = "down";
}

fromEvent(document,'click').pipe(
    map(() => {
        console.log(player);
        if(player.alive === true){
            if(key === "left"){
                if(layout[player.position.y][player.position.x - 1] != 1){
                    player.position.x -= 1; 
                }
            }else if(key === "right"){
                if(layout[player.position.y][player.position.x + 1] != 1){
                    player.position.x += 1; 
                }
            }else if(key === "up"){
                if(layout[player.position.y-1][player.position.x] != 1){
                    player.position.y -= 1; 
                }
            }else if(key === "down"){
                if(layout[player.position.y+1][player.position.x] != 1){
                    player.position.y += 1; 
                }
            }
        }
        return player;
    }),
    auditTime(10)
  ).subscribe(function(player) {
    socket.emit('all_players',JSON.stringify(player));
  });



