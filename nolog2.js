var root = this;
var util = require("util");
var events = require("events");
var spawn = require("child_process").spawn;

var debugIt = true;
var enableDebug = function(enable) { debugIt = enableDebug || false; return this;}
var d = function(m) { if(debugIt){ console.log(m); } return this; }

var NologEventEmitter = function() { d('NologEventEmitter constructor'); events.EventEmitter.call(this) };
NologEventEmitter.super_ = events.EventEmitter;
NologEventEmitter.prototype = Object.create(events.EventEmitter.prototype, {constructor:{value:NologEventEmitter, enumberable:false}});

//main NologEventEmitter attributes
//input
NologEventEmitter.prototype.input = undefined;
NologEventEmitter.prototype.readablestream = undefined;
//jobs 
NologEventEmitter.prototype.jobs = [];

//main NologEventEmitter methods

//gets an input, returns a readableStream
NologEventEmitter.prototype.getReadableStream = function (input)
{
  d('NologEventEmitter getReadableStram '+input);
  var self = this;
  if(self.readablestream)
  {
    return self.readablestream;
  }
  else if(typeof input == 'object' && input.readable === true &&  input.pause && input.destroy && input.resume)
  {
    //input is readable stream
    d("input is a readable stream");
    self.readablestream = input;
    return self.readablestream;
  }
  else if(typeof input == 'string')
  {
    d("input is a string")
    //if it is a file
    if(true)
    {
        d('input is a path-to-file string');
        //createFile
    }
    else
    {
    
    }
  
  }
  else
  {
    throw new Error("input must either be a readable stream or a path-to-file string");
  }
}
//si - shoufIf
NologEventEmitter.prototype.shoutIf = function(eventname, pattern, enableNotEvent)
{
d('shoutIf '+eventname+' '+pattern+' ');
 var self = this;
 var enableNotEvent = enableNotEvent || false;
 var newJob = createJob(self.getReadableStream(self.input), {
  'callback':function(eventname, data) { self.emit(eventname, data) },
  'enableNotEvent':enableNotEvent, 'pattern':pattern});
 self.jobs.push(newJob);
 return self;
}
NologEventEmitter.prototype.si = NologEventEmitter.prototype.shoutIf;

//sin - shoutIfNot
NologEventEmitter.prototype.shoutIfNot = function(eventname, pattern, enableNotEvent)
{
 var self = this;
 var newJob = createJob(self.getReadableStream(self.input));
 jobs.push(newJob);
 return self;
}
NologEventEmitter.prototype.sin = NologEventEmitter.prototype.shoutIfNot;

//s - shout - a shoutIf shortcut
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

//kill - kills the job with the name

//killAll - kills all jobs of this NologEventEmitter

//create a brand new NologEventEmitter
var createNologEventEmitter = function(input, params)
{ 
  d('createNologEventEmitter '+ input + ' ' + params);
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

/** JOB **/
var Job = function () { }
//main job attributes
//readablestream
Job.prototype.readablestream = undefined;
//eventname
Job.prototype.eventname = "nologEventWithId" + function() {
    var id = 0;
    return function() {return id++}();
  }();
//pattern
Job.prototype.pattern = undefined;
Job.prototype.patternfunction = undefined;

//callback
Job.prototype.callback = function(eventname, data){ var self = this; d(eventname+': '+data); return self;}

//ifnot
Job.prototype.ifnot = false;

//notevents
Job.prototype.notevents = false;

//main job methods

//_listener - listens on the data event of the readablestram
Job.prototype._listener = function(data)
{
  var self = this;
  var pattern = self.pattern;
  var callback = self.callback;
  d('Job _listener');
  
  var stumpA = [];
  return function(data)
  {
     d('######################################################');
     d(data);
     var dataA = data.split("\n");
     var line;
     //loop throug evey line
     for(var i = 0;i < dataA.length;i++)
     {
      if(i == dataA.length - 1 && data.charCodeAt(dataA[0].lenght - 1) != 10)
      {
        stumpA[0] = dataA[i]
      }
      else 
      {
        if(i == 0 && stumpA[0]) {
          stumpA[1] = dataA[i];
          line = stumpA.join("");
          stumpA.length = 0
        }else {
          line = dataA[i]
        }
      }
      self.patternfunction(line,pattern);
     }
  }
}

//kill
Job.prototype.kill = function()
{
  var self = this;
  //self.readablestream.removeListener("data", self.listener);
}


var createJob = function(readablestream, params)
{
  d('createJob');
  d(params);
  var self = this;
  d('createJob '+ readablestream + ' ' + params);
  var newjob = new Job;
  newjob.readablestream = readablestream;
  for(var n in params) {
    newjob[n] = params[n]
  }
  d(newjob.pattern);
  //newjob._listener() creates a closure at runtime
  
  //pattern preprocessor
  //if pattern is a string, make it a regexp
  if(newjob.pattern != undefined && typeof newjob.pattern === 'string' )
  {
      newjob.pattern = new RegExp(RegExp.escape(newjob.pattern))
  }
  var typeofpattern = typeof newjob.pattern;
  d('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
  d(typeofpattern);
  if(typeofpattern === 'function')
  {
    if(RegExp.isRegExp(newjob.pattern))
    {
      d('pattern is regular expression');
      newjob.patternfunction = function(line,pattern){ return line.match(pattern); };
    }
    else
    {
      d('pattern is function');
      newjob.patternfunction = function(line,pattern){ return pattern(line); }
    }
  }
  else if (typeofpattern === 'boolean')
  {
    d('pattern is boolean');
    if(pattern === true)
    {
      d('pattern is true');
      newjob.patternfunction = function(line,pattern){ return true; }
    }
    else
    {
      d('pattern is false');
      newjob.patternfunction = function(line,pattern){ return false; }
    }
  }
  else
  {
    throw new Error ('pattern '+newjob.pattern+' is not supported');
  }
  newjob.readablestream.on('data',  newjob._listener() );
  return newjob;
  
}

//nolog is the a helper object for the module.exports
var nolog = { 
  'watch': createNologEventEmitter
}
module.exports = nolog.watch;

//some utility methods
RegExp.escape = function(str) {
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
  return str.replace(specials, "\\$&")
};

RegExp.isRegExp = function(obj) {
  return!!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false))
};