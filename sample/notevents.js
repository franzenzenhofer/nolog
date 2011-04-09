#!/usr/bin/env node
var $n = require("../nolog.js");
var logfile = "../test.log";
//$n.enableDebug(true);
var mylog = $n(logfile).shoutIf("bot", /bot/i, true).on("bot", function(data){console.log("bot");}).on("!bot", function(data){ console.log("not a bot");})