#!/usr/bin/env node
var nolog = require("../nolog.js");
var logfile = "../test.log";

nolog.enableDebug(true);
var mylog = nolog.watch(logfile).shoutIf("bot", /bot/i, true).on("bot", function(data){console.log("bot");}).on("!bot", function(data){ console.log("not a bot");})