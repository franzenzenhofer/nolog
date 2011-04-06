#!/usr/bin/env node
var nolog = require("./nolog.js");
var logfile = "./test.log";

var mylog = nolog.watch(logfile);
mylog.shout('googlebot', 'Googlebot');
mylog.on('googlebot', function(data){ console.log("a Googlebot"); });

mylog.shout('chrome', 'Chrome');
mylog.on('chrome', function(data){ console.log("a Chrome"); });


process.on("exit", function() {
  console.log("NologServer Main loop exit")
});
