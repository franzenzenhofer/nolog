#!/usr/bin/env node
var nolog = require("../nolog.js");
var logfile = "../test.log";


nolog.enableDebug(true);
var mylog = nolog.watch(logfile);

mylog.shoutIf('googlebot', /Googlebot/i).on('googlebot', function(data){ console.log("a Googlebot"); console.log(data);}).shoutIf('chrome', 'Chrome');
mylog.on('chrome', function(data){ console.log("not a Chrome"); console.log(data); });

setTimeout(function(){console.log("send kill for mylog 'googlebot'");mylog.kill('googlebot');}, 6000);
setTimeout(function(){console.log("send kill for mylog 'chrome'");mylog.kill('chrome');}, 8000);
