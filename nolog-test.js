#!/usr/bin/env node
var util = require('util');
var nolog = require("./nolog.js");
var logfile = "./test.log";

var myjob = nolog.job(logfile,'nl', function(d){console.log("NL");});
console.log(util.inspect(myjob.pids));
var myjob2 = nolog.job(logfile,'sv', function(d){console.log("sv");});
console.log(util.inspect(myjob2.pids));
process.on("exit", function() {
  console.log("NologServer Main loop exit")
});

setTimeout(function(){console.log("send kill for myjob");myjob.kill();}, 2000);
setTimeout(function(){console.log("send kill for myjob2");myjob2.kill();}, 6000);

