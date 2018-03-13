'use strict';

var cluster = require('cluster');
var turbo      = require('@hugmanrique/turbo-ws');

console.log('TRIGGER')
var wss = new turbo.default()

wss.listen(3334)

if (cluster.isWorker) {
  process.on('message', function(msg) {
    console.log('worker msg', message)
    wss.broadcast(msg);
  });
}

function echo(ws, payload) {
  console.log('got echo')
  ws.send(JSON.stringify({type: 'echo', payload: payload}));
}

function broadcast(ws, payload) {
  console.log('got broadcast')
  var msg = JSON.stringify({type: 'broadcast', payload: payload});

  if (cluster.isWorker) {
    console.log('is worker')
    process.send(msg);
  }

  wss.broadcast(msg);

  ws.send(JSON.stringify({type: 'broadcastResult', payload: payload}));
}

wss.on('connection', function connection (ws) {
  console.log('got connection')

  ws.on('text', function incoming (message) {
    console.log('got message', message)

    var msg = JSON.parse(message);
    switch (msg.type) {
      case 'echo':
        echo(ws, msg.payload);
        break;
      case 'broadcast':
        broadcast(ws, msg.payload);
        break;
      default:
        console.log('unknown message type: %s', message);
    }
  });
});
