#!/usr/bin/env node
var $n = require("../nolog.js");
var logfile = "../test.log";


$n.enableDebug(true);
var mylog = $n.watch(logfile);

mylog.shoutIf('googlebot', /Googlebot/i).on('googlebot', function(data){ console.log("a Googlebot"); console.log(data);}).shoutIf('chrome', 'Chrome');
mylog.on('chrome', function(data){ console.log("Chrome"); console.log(data); });

setTimeout(function(){console.log("send kill for mylog 'googlebot'");mylog.kill('googlebot');}, 6000);
setTimeout(function(){console.log("send kill for mylog 'chrome'");mylog.kill('chrome');}, 8000);
