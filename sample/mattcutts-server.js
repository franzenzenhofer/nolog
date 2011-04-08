#!/usr/bin/env node

var http = require("http"), io = require("socket.io");
var nolog = require("../nolog.js");
var logfile = "../test.log";
var clientA = [];

var server = http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type":"text/html"});
  res.end("<h1>Sample Nolog Server</h1>")
});
server.listen(3001);
var mylog = nolog.watch(logfile).shout("googlebot", "Googlebot").on("googlebot", function(data) {
  clientA.forEach(function(a) {
    if(a.connected) {
      a.send("Googlebot")
    }else {
      clientA.splice(clientA.indexOf(a), 1)
    }
  })
});
var socket = io.listen(server);
socket.on("connection", function(client) {
  clientA.push(client)
});