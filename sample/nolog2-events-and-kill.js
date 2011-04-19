#!/usr/bin/env node
var $n = require("../nolog2.js");
var logfile = "../test.log";


$n.enableDebug(false);
var mylog = $n.watch(logfile);

mylog.shoutIf('googlebot', /Googlebot/i).on('googlebot', function(data){ console.log("a Googlebot"); }).shoutIf('chrome', 'Chrome');
mylog.on('chrome', function(data){ console.log("Chrome");  });

setTimeout(function(){console.log("send kill for mylog 'googlebot'");mylog.kill('googlebot');}, 6000);
setTimeout(function(){console.log("send kill for mylog 'chrome'");mylog.kill('chrome');}, 10000);
