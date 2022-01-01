// package imports
const express = require('express');
const { WebSocketServer } = require('ws');

// Express setup
const app = express();
const express_port = 5000;
app.use(express.static('../client/public/'));

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// Start Express server
app.listen(express_port, () => {
  console.log("\n[ START ]", `[ Express listening at http://localhost:${express_port}]\n`);
})



// Creating new WS server
const wss_port = 2000;
const wss = new WebSocketServer({ port: wss_port });
const interval = 50;

// Starting up server
wss.on("listening", async (ws) => {
  console.log("\n[ START ]", `[ Websockets server started on port ${wss_port}]\n`);
});


let room = {
  users: {},
  queue: [],
  public: true,
  current: {
    id: 'CEw-7cMnBDY',  // video ID
    state: 2,           // playback state
    time: 0             // measured in seconds!
  }
};

/*

Video State

2 -> paused
1 -> playing

*/

// Function that generates an unique ID
function getUniqueID() {
  const id = Math.floor((1 + Math.random()) * 0x10000000000).toString(16).substring(1);
  console.log('Generated new ID:', id);
  return id;
}

// Main Websockets Logic
wss.on("connection", async (ws, request) => {

  // generate new ID for new user, send it
  const newID = getUniqueID();
  ws.id = newID;

  ws.send(JSON.stringify(
    {
      type: 'set-id',
      id: newID
    }
  ));

  // add new user to room
  room.users[newID] = ws;

  // process messages
  ws.on("message", async (raw_data) => {
  
    try {
      
      // parse incoming data
      const data = JSON.parse(raw_data);
      console.log(Date.now(), data);
      const type = data.type;

      if (type == 'play') {
        room.current.state = 1;
        ws.send(JSON.stringify(
          { type: 'ack', req_id: data.req_id }
        ));    
      } 

      if (type == 'pause') {
        room.current.state = 2;
        ws.send(JSON.stringify(
          { type: 'ack', req_id: data.req_id }
        ));    
      } 

      if (type == 'seek') {
        room.current.time = data.time;
        ws.send(JSON.stringify(
          { type: 'ack', req_id: data.req_id }
        ));    
      } 
      
      // console.log(room.current);
  
    }

    catch (err) {
      console.error(err);
    }

  });

  // remove user from user on WS close
  ws.on('close', () => {
    delete room.users[ws.id];
  });

});






// main server loop
setInterval(() => {

  // update room state

  if (room.current.state == 1) {
    room.current.time += interval/1000;
  }

  
  // periodically broadcast room state to all users
  Object.values(room.users).forEach(user => {
    user.send(JSON.stringify(
      { type: 'room-state', room: room.current }
    ));                
  })

  console.log(room.current);

}, interval);


// setInterval(() => {
//   update_match_state();
//   processInputs();
//   send_game_state_to_clients();
// }, time_step);