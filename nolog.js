#!/usr/bin/env node

var util = require("util");
var spawn = require("child_process").spawn;
var tailHolder = {};
var stumpA = [];
var isRegExp = function(obj) {
  return!!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false))
};
var tailf = function(file) {
  //console.log("tail created with: " + file);
  return spawn("tail", ["-f", file])
};
var job = function(file, pattern, callback, errcallback, exitcallback) {
  //console.log("ajob");
  var that = this;
  var callback = callback || function(data) {
    //console.log(data);
    return data
  };
  var errcallback = errcallback || function(data) {
    console.log("stderr: " + data);
    throw new Error("data");return data
  };
  
  var exitcallback = function(code) {
    console.log("tail process exited with code " + code)
  }
  var pattern = pattern || undefined;
  if(pattern && !isRegExp(pattern)) {
    pattern = new RegExp(pattern.replace("\\", "\\\\"))
  }
  var file = file || undefined;
  var mytailf;
  if(file == undefined) {
    throw new Error("critical error in nolog - file must not be undefined");
  }
  if(tailHolder[file]) {
    mytailf = tailHolder[file].process;
  }else {
    mytailf = tailf(file);
    tailHolder[file]={};
    tailHolder[file].process = mytailf;
    tailHolder[file].listenerA = [];
  }
  mytailf.stdin.setEncoding("utf8");
  mytailf.stdout.setEncoding("utf8");
  mytailf.stderr.setEncoding("utf8");
  var listener = function(data) {
    //console.log("mytailf.stdout.on data");
    var dataA = data.split("\n");
    for(var i = 0;i < dataA.length;i++) {
      //is last line complete (end with \n)
      if(i == dataA.length - 1 && data.charCodeAt(dataA[0].lenght - 1) != 10) {
        stumpA[0] = dataA[i]
      }else {
        var line;
        if(i == 0 && stumpA[0]) {
          stumpA[1] = dataA[i];
          line = stumpA.join("");
          stumpA.length = 0
        }else {
          line = dataA[i]
        }
        var match = line.match(pattern);
        if(match) {
          callback(match)
        }
      }
    }
  };
  
  mytailf.stdout.on("data", listener);
  tailHolder[file].listenerA.push(listener);
  mytailf.stderr.on("data", function(data) {
    errcallback(data)
  });
  mytailf.on("exit", exitcallback);
  var kill = function()
  {
    mytailf.stdout.removeListener('data', listener);
    var li = tailHolder[file].listenerA.indexOf(listener)
    tailHolder[file].listenerA[li]=undefined;
    var tempA = [];
    tailHolder[file].listenerA.forEach(function(element){ if(element){tempA.push(element);} });
    tailHolder[file].listenerA=tempA;
    if(!tailHolder[file].listenerA.length)
    {
      killAll();
    }
  }
  
  var killAll = function()
  {
    //kills the mytailf
    console.log('killAll');
    mytailf.kill("SIGHUP");
  }
  var pid = {"tail":mytailf.pid};
  return{"pid":pid, 'pattern':pattern, 'file':file, 'kill':kill}
};
if(!exports) {
  var exports = this;
}
exports.job = job;
exports.tailList = tailHolder;
process.on("exit", function() {
  for(var t in tailHolder) {
    tailHolder[t].process.kill("SIGHUP")
  }
  console.log("Nolog.js Main loop exit")
});