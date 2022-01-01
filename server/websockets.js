// Creating new WS server
let portNumber = 2000;
const wss = new WebSocket.Server({ port: portNumber });

// Starting up server
wss.on("listening", async (ws) => {
  console.log("\n[ START ]", `[ Websockets server started on port ${portNumber}]\n`);
});

// Main Websockets Logic
wss.on("connection", async (ws, request) => {

  ws.on("message", async (data) => {
    console.log('Got message!');
  });
});