#!/usr/bin/env node
var $n = require("nolog");
//var $n = require("../nolog.js");
var logfile = "../test.log";
//$n.enableDebug(true);
var log = $n(logfile, {'wholefile':true, 'follow':false}).shoutIf('uniqueip', function(line)
{
  var ips = [];
  return function(line)
  {
    var ip = line.split(' ')[0];
    if(ips.indexOf(ip)==-1)
    {
      ips.push(ip);
      return ip;
    }
    else
    {
      //return "duplicate";
      return false; //no event gets thrown
    }
  }

}()).on("uniqueip", function(data){console.log(data);});