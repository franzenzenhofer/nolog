#!/usr/bin/env node

var http = require("http"), io = require("socket.io");
var nolog = require("../nolog.js");
var logfile = "../test.log";
var clientA = [];

var server = http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type":"text/html"});
  res.end("<h1>isBot Nolog Server</h1>")
});

var sendAll = function(msg) {

  console.log("msg:"+msg);
  clientA.forEach(function(a) {
    if(a.connected) {
      a.send(msg);
      console.log(msg+" send");
    }else {
      clientA.splice(clientA.indexOf(a), 1)
    }
  });
 
}

server.listen(3002);
var mylog = nolog.watch(logfile).shoutIf("bot", /bot/i, true).on("bot", function(data){console.log("bot");sendAll("bot");}).on("!bot", function(data){ console.log("!bot");sendAll("!bot");})
var socket = io.listen(server);
socket.on("connection", function(client) {
  clientA.push(client);
});