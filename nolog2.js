var root = this;
var util = require("util");
var events = require("events");
var spawn = require("child_process").spawn;

var debugIt = false;
var enableDebug = function(enable) { debugIt = enableDebug || false; return this;}
var d = function(m) { if(debugIt){ console.log(m); } return this; }

var NologEventEmitter = function() { events.EventEmitter.call(this) };
NologEventEmitter.super_ = events.EventEmitter;
NologEventEmitter.prototype = Object.create(events.EventEmitter.prototype, {constructor:{value:NologEventEmitter, enumberable:false}});

//main NologEventEmitter attributes
//input
NologEventEmitter.prototype.input = undefined;
//jobs 
NologEventEmitter.prototype.jobs = [];

//main NologEventEmitter methods
//si - shoufIf
NologEventEmitter.prototype.shoutIf = function(eventname, pattern, enableNotEvent)
{
 var self = this;
 var newJob = createJob();
 self.jobs.push(newJob);
 return self;
}
NologEventEmitter.prototype.si = NologEventEmitter.prototype.shoutIf;
//sin - shoutIfNot
NologEventEmitter.prototype.shoutIfNot = function(eventname, pattern, enableNotEvent)
{
 var self = this;
 var newJob = createJob();
 jobs.push(newJob);
 return self;
}
NologEventEmitter.prototype.sin = NologEventEmitter.prototype.shoutIfNot;
//s - a shoutIf shortcut
NologEventEmitter.prototype.shout = function(nameandpattern, enableNotEvents) {
  var self = this;
  if(typeof nameandpattern == "string") {
    self.shoutIf(nameandpattern, new RegExp(nameandpattern, "i"), enableNotEvents)
  }else {
    throw new Error("shout needs a simple string");
  }
  return self
};
NologEventEmitter.prototype.s = NologEventEmitter.prototype.shout;

//kill

//killAll

//create a brand new NologEventEmitter
var createNologEventEmitter = function(input, params)
{ 
  var nee = new NologEventEmitter;
  nee.input = input;
  for(var n in params) {
    nee[n] = params[n]
  }
  return nee
}

var File = function () { }
//main File attributes
//wholefile
//follow
//encoding

//main File methods
//tail - start a tail spawn
File.prototype.tail = function () { }

//watch - create a readabel stream
File.prototype.watch = function () { }

//stop the spawn sub process
File.prototype.unwatch = function () { }

//errcallback
File.prototype.errcallback = function () { }

//exitcallback
File.prototype.exitcallback = function () { }

//setEncoding
File.prototype.setEncoding = function (encoding) { this.encoding = encoding||'utf8'; }

var createFile  = function(pathtofile, params)
{

}

var Job = function () { }

var createJob = function(aReadableStream, params)
{
  
}

//nolog is the a helper object for the module.exports
var nolog = 
{ 

}


//some utility methods
RegExp.escape = function(str) {
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
  return str.replace(specials, "\\$&")
};

RegExp.isRegExp = function(obj) {
  return!!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false))
};