#!/usr/bin/env node
var $n = require("../nolog.js");
$n("../test.log").s('googlebot').on("googlebot", function(data){ console.log("a Googlebot");})