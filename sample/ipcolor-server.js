#!/usr/bin/env node

var http = require("http"), io = require("socket.io");
var nolog = require("../nolog.js");
var logfile = "../test.log";
var clientA = [];

var RGBtoHex = function (R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
var toHex = function(N) {
 if (N==null) return "00";
 N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 return "0123456789ABCDEF".charAt((N-N%16)/16)
      + "0123456789ABCDEF".charAt(N%16);
}

var server = http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type":"text/html"});
  res.end("<h1>Ipcolor Server</h1>")
});

var sendAll = function(msg) {

  //console.log("msg:"+msg);
  clientA.forEach(function(a) {
    if(a.connected) {
      a.send(msg);
    }else {
      clientA.splice(clientA.indexOf(a), 1)
    }
  });
 
}

server.listen(3003);
var mylog = nolog.watch(logfile).shoutIf("ip", /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/, true).on("ip", function(data){
var sO = {'row':data[1],'color':RGBtoHex(data[2],data[3],data[4])};
console.log(sO);
sendAll(sO);
});
var socket = io.listen(server);
socket.on("connection", function(client) {
  clientA.push(client);
});