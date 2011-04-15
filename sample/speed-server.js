//66.249.72.117 - - [15/Apr/2011:17:41:07 +0200] "GET /de/lawrence-kansas/holiday-inn-lawrence HTTP/1.1" 200 "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "0.620" "0.620" "-"

var $n = require("nolog");
var http = require("http"), io = require("socket.io");
var logfile = "../test.log";
var clientA = [];

var server = http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type":"text/html"});
  res.end("<h1>Ipcolor Server</h1>")
});

var sendAll = function(msg) {
  clientA.forEach(function(a) {
    if(a.connected) {
      a.send(msg);
    }else {
      clientA.splice(clientA.indexOf(a), 1)
    }
  });
 
}
server.listen(3004);
var log = $n(logfile).si('speed',function(line){
//console.log(line);
var lA = line.split('"');
var nr = parseFloat(lA[5]);
//console.log(lA[5]+" "+nr+" "+typeof nr);
var slug = lA[1].split(" ")[1];
  if(typeof nr === 'number' &&  nr !== NaN  )
  {
    return { 'speed':nr,
              'slug': slug
            };
  }
  else
  {
    return false;
  }
}).on('speed', function(sO){

console.log(sO);
sendAll(sO);

});

var socket = io.listen(server);
socket.on("connection", function(client) {
  clientA.push(client);
});

