// =========================
// GLOBAL VARIABLES
// =========================

let current = {
  id: '',
  state: 0,
  time: 0
};

let myID = '';

let last_req_id = '';

let loaded = false;

let last_time = 0;

let interval = 150;

let buffer = 50;

let threshold = 0.8;


function getUniqueID() {
  const id = Math.floor((1 + Math.random()) * 0x10000000000).toString(16).substring(1);
  console.log('Generated new ID:', id);
  return id;
}

// =========================
// WEBSOCKETS LOGIC
// =========================

const ws = new WebSocket('ws://localhost:2000');

ws.addEventListener("open", () => {
  console.log("Connected to server");
})

ws.addEventListener("close", () => {
  console.error("Disconnected from server!");
})

ws.addEventListener("message", (rawData) => {
  const data = JSON.parse(rawData.data);
  
  if (data.type == "room-state") {
    // console.log('here is ID:', data.current.id);
    
    const room_current = data.room;
    
    current = room_current;
    
    // player.seekTo(room_current.time);

    if (last_req_id == '') {

      const state = player.getPlayerState();

      if (room_current.state == 1) {
        playVideo();
      }
      
      if (room_current.state == 2 && state == 1 ) {
        pauseVideo();
      }
    }

    const time_now = player.getCurrentTime();
    
    const delta = time_now - current.time;

    if (Math.abs(delta) > threshold) {
      // player.seekTo(time_now - delta);

      const newID = getUniqueID();
      ws_send({ type: 'seek', time: time_now, req_id: newID });
      last_req_id = newID;

    }
    
    console.log(delta);   
        
  } else {
    console.log("Received the message", data);    
  }

  // if (data.type == "videoid") playVideoId(data.videoid);

  // server acknowledged last request -> clear last_req_id
  if (data.type == 'ack') {    
    last_req_id = '';
  }

  // only run if there aren't any 
  // unacklowedged requests from this client

  if (data.type == "play") {    
    playVideo();
  }

  if (data.type == "pause") {
    pauseVideo();
  }

  if (data.type == "seek") {
    player.seekTo(data.time, true);
  }



  if (data.type == "set-id") { myID = data.id }
})

function ws_send(message_obj) {
  ws.send(JSON.stringify(message_obj));
  console.log("Sent message:", message_obj);
}



// =========================
// YOUTUBE PLAYER API LOGIC
// =========================

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {

  console.log(current);

  player = new YT.Player('player', {
    height: '390',
    width: '600',
    // videoId: 'M7lc1UVf-VE',
    videoId: current.id,
    playerVars: {
      'playsinline': 1,
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  console.log('Player Ready');
  loaded = true;
}

function onPlayerStateChange(event) {

  console.log('State Changed! New State:', player.getPlayerState());

  if (event.data == YT.PlayerState.PLAYING) {
    // if (last_command_id == '') {
    
    const newID = getUniqueID();

    ws_send({ type: 'play', req_id: newID });

    last_req_id = newID;

    // } else {
      // last_command_id = '';
    // }
    // last_time = player.getCurrentTime();
  }
  if (event.data == YT.PlayerState.PAUSED) {

    // if (last_command_id == '') {

    const newID = getUniqueID();

    ws_send({ type: 'pause', req_id: newID })
    
    last_req_id = newID;

  }
}

function playVideo() {
  player.playVideo();
}

function pauseVideo() {
  player.pauseVideo();
}

function stopVideo() {
  player.stopVideo();
}

setInterval(function () {
  if (loaded) {
    // console.log(player.getCurrentTime());

    // let delta;

    // if (state == YT.PlayerState.PLAYING) {
    //   delta = ((last_time + interval / 1000) - time_now) * 1000;
    // } else {
    //   delta = ((last_time) - time_now) * 1000;
    // }

    // skipped back!
    // if (delta > buffer) {
      // console.log('skipped back!');
      // ws_send({ type: 'seek', time: time_now });
    // }
    // skipped forwards!
    // else if (delta < (buffer) * (-1)) {
      // console.log('skipped forwards!');
      // ws_send({ type: 'seek', time: time_now });
    // }
    
    // console.log(delta);

    // last_time = time_now;

     

  }
}, interval);