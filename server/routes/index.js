let app = require('express')();

let cors = require('cors');
app.use(cors());

let http = require('http').Server(app);
let io = require('socket.io')(http);

http.listen(3000,()=>console.log('Server listening on port 3000'));

let { combineLatest, fromEvent } = require('rxjs');
let { map, startWith, auditTime } = require('rxjs/operators');

let connected_observables = [];
let main_observable = null;
var id = 0;



fromEvent(io,'connection')
  .subscribe(function(client) {
    
    // Restart the main observable if required
    if(connected_observables.length > 0){
      stopMain();
    }
    
    // Observe events from this client; start in center of screen
    let client_obs = fromEvent(client, 'all_players').pipe(
      map((x)=>JSON.parse(x)),
      startWith({
        alive:true,
        playerID: id,
        position: {x: 2, y: 1},
        seeker: false,
        seekerPU: true,
        invisPU: true,
        invis: false,
      })
    );
    // Add client observable to array
    connected_observables.push(client_obs);
    id++;

    fromEvent(client, 'disconnect').subscribe(() => { 
      // Remove disconnected observable from array
      let index = connected_observables.indexOf(client_obs);
      if (index > -1) {
        connected_observables.splice(index, 1);
      }
      
      // Restart the main observable
      stopMain();
      if(connected_observables.length > 0){
        startMain();
      }
      console.log('removed a connection');
    });

    // Start main observable
    startMain();
    console.log('added connection');

  });

var players;
var seekerIndex;
var invisIndex;
  
function startMain() {
  // Combine latest outputs from all clients; send updates at most every 100ms
  main_observable = combineLatest(connected_observables).pipe(
    auditTime(10)
  ).subscribe((x) => { 
    players = x;

    //checking seeker power up
    for(var i = 0; i < x.length; i++){
      if(players[i].position.x === 10 && players[i].position.y === 8 && players[i].seekerPU === true && players[i].invis === false){
        players[i].seeker = true;
        //players[i].color = "blue";
        seekerIndex = i;
        seekerPUTimer(players);
        for(var j = 0; j < x.length; j++){
          players[j].seekerPU = false;
        }

      }

      //checking invis power up
      if(players[i].position.x === 17 && players[i].position.y === 3 && players[i].invisPU === true && players[i].seeker === false){
        players[i].invis = true;
        invisIndex = i;
        invisPUTimer(players);
        for(var j = 0; j < x.length; j++){
          players[j].invisPU = false;
        }

      }


    }

    checkCatch();
    console.log(JSON.stringify(players));
    io.emit('all_players',JSON.stringify(players));
  });
}

function stopMain() {
  main_observable.unsubscribe();
}

function seekerPUTimer(){
  setTimeout(function(){
    for(var i = 0; i < players.length; i++){
      players[i].seekerPU = true;
    }
    players[seekerIndex].seeker = false;
    console.log("PU respawne" + JSON.stringify(players));
    io.emit('all_players',JSON.stringify(players));
    
  },10000);
}




function invisPUTimer(){
  setTimeout(function(){
    for(var i = 0; i < players.length; i++){
      players[i].invisPU = true;
    }
    players[invisIndex].invis = false;
    //console.log("PU respawne" + JSON.stringify(players));
    io.emit('all_players',JSON.stringify(players));
    
  },5000);
}


function checkCatch(){
  for(var i = 0; i < players.length; i++){
    if(players[i].seeker === true){
      for(var j = 0; j < players.length; j++){
        if(j != i){
          if(players[i].position.x === players[j].position.x && players[i].position.y === players[j].position.y){
            console.log("caught");
            //io.emit('lose',JSON.stringify(lose));
            players[j].position.x = 0;
            players[j].position.y = 0;
            players[j].alive = false;
            
            io.emit('all_players',JSON.stringify(players));
            break;
          }
        }
        
      }
    }
  }
}

