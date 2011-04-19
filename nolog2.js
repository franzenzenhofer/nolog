var root = this;
var util = require("util");
var events = require("events");
var spawn = require("child_process").spawn;

var debugIt = true;
var enableDebug = function(enable) { debugIt = enable || false; return this;}
var d = function(m) { if(debugIt){ 
console.log('---------------------->>>>');
console.log(m);
console.log('----------------------<<<<');
} return this; }

var NologEventEmitter = function() { d('NologEventEmitter constructor'); events.EventEmitter.call(this) };
NologEventEmitter.super_ = events.EventEmitter;
NologEventEmitter.prototype = Object.create(events.EventEmitter.prototype, {constructor:{value:NologEventEmitter, enumberable:false}});

//main NologEventEmitter attributes
//input
NologEventEmitter.prototype.input = undefined;
NologEventEmitter.prototype.readablestream = undefined;
NologEventEmitter.prototype.readablestream_encoding = 'utf8';
//file is a alias for readablestream
NologEventEmitter.prototype.file = NologEventEmitter.prototype.readablestream;
NologEventEmitter.prototype.file_encoding = NologEventEmitter.prototype.readablestream_encoding;

//only if readabelstream is a file readable stream created by nolog
NologEventEmitter.prototype.follow = true;
NologEventEmitter.prototype.wholefile = false;
NologEventEmitter.prototype.spawn = undefined;
NologEventEmitter.prototype.fileErrorCallback = function(data) { throw new Error('Nolog File Error: '+data); } 
//NologEventEmitter.prototype.fileExitCallback = function(data) { d('Nolog File Exit: '+d); } 


//jobs 
NologEventEmitter.prototype.jobs = [];

//main NologEventEmitter methods

//helper method to set the encoding of the readable stream
NologEventEmitter.prototype.setEncoding = function(enc)
{
  var self = this;
  var enc = enc || self.readablestream_encoding || 'utf8';
  if(self.readablestream&&self.readablestream.setEncoding)
  {
    self.readablestream.setEncoding(enc);
  }
  if(self.spawn&&self.spawn.stderr&&self.spawn.stderr.setEncoding)
  {
    self.spawn.stderr.setEncoding(enc);
  }
  self.readablestream_encoding=enc;
  return self;
}

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
    
  }
  else if(typeof input == 'string')
  {
    d("input is a string")
    //if it is a file
    if(true)
    {
        d('input is a path-to-file string');
        //createFile
        self.spawn = tail(input, self.follow, self.wholefile);
        //mytail.stdin.setEncoding("utf8");
        self.readablestream = self.spawn.stdout;
        self.spawn.stderr.on('data', self.fileErrorCallback );
        //set the encoding to the default value
        self.setEncoding();
    }
    else
    {
    
    }
  
  }
  else
  {
    throw new Error("input must either be a readable stream or a path-to-file string");
  }
  return self.readablestream;
}
//datalistener = the basic listener of readable stream
//loops through the jobs array
NologEventEmitter.prototype._datalistenerstarted = false;
NologEventEmitter.prototype.startDataListener = function()
{
  d('NologEventEmitter startDataListener');
  var self = this;
  //d(self.listeners('data'));
  if(!self._datalistenerstarted)
  {
    d('first time start datalistener');
    self.dataListener = self._dataListener();
    self.readablestream.on('data', self.dataListener);
    self._datalistenerstarted==true;
  }
  return self;
}
NologEventEmitter.prototype.dataListener = undefined;
NologEventEmitter.prototype._dataListener = function(data)
{
  var self = this;

 
 
  var stumpA = [];
  return function(data) {
   // d(data);
    var dataA = data.split("\n");
    var line;
    //loop throug evey line
    for(var i = 0;i < dataA.length;i++)
    {
      if(i == dataA.length - 1 && data.charCodeAt(dataA[0].lenght - 1) != 10)
      {
        //d(data[i]);
        stumpA[0] = dataA[i];
        //d(stumpA);
      }
      else 
      {
        if(i == 0 && stumpA[0]) {
          stumpA[1] = dataA[i];
          d(stumpA);
          line = stumpA.join("");
          stumpA.length = 0
        }else {
          line = dataA[i]
        }
      }
      //now loop through every jobs patternfunction
      
      for(var j = 0; j<self.jobs.length; j++)
      {
        //d(self.jobs[j].patternfunction);
        var match = self.jobs[j].patternfunction(line, self.jobs[j].pattern);
      //  d(self.jobs[j].patternfunction+' ');
        if(match)
        {
        d(match);
         self.jobs[j].callback( self.jobs[j].eventname, match);
        }
      }
    }
    return self;
  }
 
}
//si - shoufIf
NologEventEmitter.prototype.shoutIf = function(eventname, pattern, enableNotEvent)
{
d('shoutIf '+eventname+' '+pattern+' ');
 var self = this;
 var enableNotEvent = enableNotEvent || false;
 self.readablestream = self.getReadableStream(self.input);
 var newJob = createJob(self.readablestream, {
  'callback':function(eventname, data) { self.emit(eventname, data); },
  'enableNotEvent':enableNotEvent,
  'pattern':pattern,
  'eventname':eventname,
  'finalize':function(){ self.startDataListener(); }
  });
 self.jobs.push(newJob);
 //if it isn't started yet, assign an event handler to the data event of the readable stream
 
 
 
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
NologEventEmitter.prototype.kill = function(eventname)
{
  var self = this;
  //go through the jobs array
  var newjobsA = [];
  for(var i = 0; i<self.jobs.lenght; i++)
  {
    if(self.jobs[i].eventname == eventname)
    {
      self.jobs[i].kill();
    }
    else
    {
      newjobsA.push(self.jobs[i]);
    }
  }
  self.jobs = newjobsA;
  if(self.jobs.length === 0) { self.killAll(true); }
  return self;
}

//killAll - kills all jobs of this NologEventEmitter
NologEventEmitter.prototype.killAll = function(allJobsAreDead)
{
  var self = this;

  if(!allJobsAreDead && self.jobs.length>0)
  {
    for(var i = 0; i<self.jobs.length; i++)
    {
      self.jobs[i].kill();
    }
    self.jobs = [];
  }
  
  if(self.spawn&&self.spawn.kill)
  {
    self.spawn.kill('SIGHUP');
  }
  return self;
}
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
//finalize
Job.prototype.finalize = undefined;

//callback
Job.prototype.callback = function(eventname, data){ var self = this; d(eventname+': '+data); return self;}


//ifnot
Job.prototype.ifnot = false;

//notevents
Job.prototype.notevents = false;

//main job methods

//_listener - listens on the data event of the readablestram
/* Job.prototype.listener = undefined;
Job.prototype._listener = function(data)
{
  var self = this;
  var pattern = self.pattern;
  var callback = self.callback;
  var eventname = self.eventname;
  d('Job _listener');
  
  var stumpA = [];
  return function(data)
  {
     //d('######################################################');
     //d(data);
     var dataA = data.split("\n");
     var line;
     //loop throug evey line
     for(var i = 0;i < dataA.length;i++)
     {
      if(i == dataA.length - 1 && data.charCodeAt(dataA[0].lenght - 1) != 10)
      {
        //d(data[i]);
        stumpA[0] = dataA[i];
        //d(stumpA);
      }
      else 
      {
        if(i == 0 && stumpA[0]) {
          stumpA[1] = dataA[i];
          d(stumpA);
          line = stumpA.join("");
          stumpA.length = 0
        }else {
          line = dataA[i]
        }
      }
      var match = self.patternfunction(line,pattern);
      if(match)
      {
        //d(match);
        callback(eventname, match);
      }
     }
  }
}*/

//kill
Job.prototype.kill = function()
{
  var self = this;
  //not working like this
  //self.readablestream.removeListener("data", self.listener);
  return self;
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
  //d('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
  d('typeofpattern '+typeofpattern);
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
  /**
  //wrong shit ... 
  self.listener = newjob._listener();
  newjob.readablestream.on('data',  self.listener );
  **/
  //handline the end event of a file
  //newjob.readablestream.on('end',  myListenerFunction );
  if(newjob && newjob.finalize)
  {
    newjob.finalize();
  }
  return newjob;
  
}

//nolog is the a helper object for the module.exports
var nolog = { 
  'watch': createNologEventEmitter
}
nolog.watch.w = nolog.watch;
nolog.watch.watch = nolog.watch;
nolog.watch.enableDebug = enableDebug;
module.exports = nolog.watch;

//some utility methods
RegExp.escape = function(str) {
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
  return str.replace(specials, "\\$&")
};

RegExp.isRegExp = function(obj) {
  return!!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false))
};

//create a tail
var tail = function(file, follow, wholefile) {
  var aA = [];
  if(follow) {
    aA.push("-f")
  }
  if(wholefile) {
    aA.push("-c");
    aA.push("+1")
  }
  aA.push(file);
  return spawn("tail", aA)
};