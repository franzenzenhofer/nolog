#!/usr/bin/env node
var nolog = require("../nolog.js");
var logfile = "../test.log";

nolog.enableDebug(false);

var mylog = nolog.watch(logfile, { follow:false, wholefile:true });
/*
//the above is similar to
var mylog = nolog.watch(logfile);
mylog.follow=false;
mylog.wholefile=true;
*/
mylog.shoutIfNot("human", /bot/i, true).on("human", function(data){console.log("i am human");}).on("!human", function(data){ console.log("i am not human");});