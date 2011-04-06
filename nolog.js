#!/usr/bin/env node

var util = require("util");
var events = require('events');
var spawn = require("child_process").spawn;
var tailHolder = {};
var stumpA = [];

var isRegExp = function(obj) {
  return!!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false))
};
var tail = function(file, follow, wholefile) {
  var aA = [];
  if(follow){aA.push('-f');}
  if(wholefile) { aA.push('-c'); aA.push('+1'); }
  aA.push(file);
  //console.log("tail created with: " + file);
  //return spawn("tail", ['-c','+1',"-f", file]);
  return spawn("tail", aA)

};

var NologEventEmitter = function()
{
  events.EventEmitter.call(this);
}

NologEventEmitter.super_ = events.EventEmitterK
NologEventEmitter.prototype = Object.create(events.EventEmitter.prototype, {constructor: {value:NologEventEmitter, enumberable:false}});

NologEventEmitter.prototype.file = undefined;
NologEventEmitter.prototype.follow = true;
NologEventEmitter.prototype.wholefile = true;
NologEventEmitter.prototype.errcallback = undefined;
NologEventEmitter.prototype.exitcallback = undefined;
NologEventEmitter.prototype.shout = function(eventname, pattern)
{
  var self = this;
  var file = self.file;
  return job(file, pattern, function(data){ self.emit(eventname, data);}, self.errcallback, self.exitcallback, self.follow, self.wholefile );
}

var createEmiter = function (file)
{
  var nee = new NologEventEmitter();
  nee.file=file;
  return nee;
}

var watch = createEmiter;

var job = function(file, pattern, callback, errcallback, exitcallback, follow, startat) {
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
  var follow = follow || true;
  var wholefile = wholefile || true;
  
  var mytail;
  if(file == undefined) {
    throw new Error("critical error in nolog - file must not be undefined");
  }
  if(tailHolder[file]) {
    mytail = tailHolder[file].process;
  }else {
    mytail = tail(file, follow, wholefile);
    tailHolder[file]={};
    tailHolder[file].process = mytail;
    tailHolder[file].listenerA = [];
  }
  mytail.stdin.setEncoding("utf8");
  mytail.stdout.setEncoding("utf8");
  mytail.stderr.setEncoding("utf8");
  var listener = function(data) {
    //console.log("mytail.stdout.on data");
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
  
  mytail.stdout.on("data", listener);
  tailHolder[file].listenerA.push(listener);
  mytail.stderr.on("data", function(data) {
    errcallback(data)
  });
  mytail.on("exit", exitcallback);
  var kill = function()
  {
    mytail.stdout.removeListener('data', listener);
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
    //kills the mytail
    console.log('killAll');
    mytail.kill("SIGHUP");
  }
  var pid = {"tail":mytail.pid};
  return{"pid":pid, 'pattern':pattern, 'file':file, 'kill':kill}
};
if(!exports) {
  var exports = this;
}

exports.job = job;
exports.tailList = tailHolder;
exports.watch = watch;
process.on("exit", function() {
  for(var t in tailHolder) {
    tailHolder[t].process.kill("SIGHUP")
  }
  console.log("Nolog.js Main loop exit")
});