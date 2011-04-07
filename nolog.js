var util = require("util");
var events = require("events");
var spawn = require("child_process").spawn;
var tailHolder = {};
var stumpA = [];
var debugIt=false;
var debugconsole = function(s) { if(debugIt===true){ console.log(s); } };
var d = debugconsole;
var isRegExp = function(obj) {
  return!!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false))
};
RegExp.escape = function(str)
{
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
  return str.replace(specials, "\\$&");
}
var debugSwitch = function(val){ debugIt = val; };
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
var NologEventEmitter = function() {
  events.EventEmitter.call(this)
};
NologEventEmitter.super_ = events.EventEmitter;
NologEventEmitter.prototype = Object.create(events.EventEmitter.prototype, {constructor:{value:NologEventEmitter, enumberable:false}});
NologEventEmitter.prototype.file = null;
NologEventEmitter.prototype.follow = true;
NologEventEmitter.prototype.wholefile = true;
NologEventEmitter.prototype.errcallback = null;
NologEventEmitter.prototype.exitcallback = null;
NologEventEmitter.prototype.jobs = [];
NologEventEmitter.prototype.shoutIf = function(eventname, pattern) {
  var self = this;
  var file = self.file;
  self.jobs.push(job.call(self, file, pattern, eventname, function(data) {
    self.emit(eventname, data)
  }, self.errcallback, self.exitcallback, self.follow, self.wholefile, false));
  return self;
};
NologEventEmitter.prototype.shout = NologEventEmitter.prototype.shoutIf;
NologEventEmitter.prototype.shoutIfNot = function(eventname, pattern) {
  var self = this;
  var file = self.file;
  self.jobs.push(job.call(self, file, pattern, eventname, function(data) {
    self.emit(eventname, data)
  }, self.errcallback, self.exitcallback, self.follow, self.wholefile, true));
  return self;
};

NologEventEmitter.prototype.kill = function (eventname)
{
  console.log('debugIt'+debugIt);
  d('kill '+eventname)
  var self = this;
  self.jobs.forEach(function(e){
    if(e.eventname == eventname)
    {
      return e.kill();
    }
  });
  return self;
}

NologEventEmitter.prototype.killAll = function(jobsAllreadyGone)
{
  var self = this;
  var jobsAllreadyGone = jobsAllreadyGone || false;
  if(jobsAllreadyGone===false)
  {
    self.jobs.forEach(function(e){
      e.kill();
    });
  }
  tailHolder[self.file].process.kill("SIGHUP");
  delete tailHolder[self.file];
  return self;
}

NologEventEmitter.prototype.unwatch = NologEventEmitter.prototype.killAll;

var createEmiter = function(file, o) {
  var nee = new NologEventEmitter;
  nee.file = file;
  for(var n in o)
  {
    //console.log(n);
    nee[n]=o[n];
  }
  return nee
};
var watch = createEmiter;
var job = function(file, pattern, eventname, callback, errcallback, exitcallback, follow, startat, ifnot) {
  var self = this;
  var callback = callback || function(data) {
    return data
  };
  var errcallback = errcallback || function(data) {
    d("stderr: " + data);
    throw new Error(data);return data
  };
  var exitcallback = function(code) {
    d("tail process exited with code " + code)
  };
  var pattern = pattern || undefined;
  if(pattern && !isRegExp(pattern)) {
    pattern = new RegExp(RegExp.escape(pattern))
  }
  var eventname = eventname || 'nologId'+(function() {var id=0;return function() {if (arguments[0]==0) {id=1;return 0;} else return id++;}})();
  var file = file || undefined;
  var follow = follow || true;
  var wholefile = wholefile || false;
  var ifnot = ifnot || false;
  var mytail;
  if(!file) {
    throw new Error("critical error in nolog - file must not be undefined");
  }
  if(tailHolder[file]) {
    mytail = tailHolder[file].process
  }else {
    mytail = tail(file, follow, wholefile);
    tailHolder[file] = {};
    tailHolder[file].process = mytail;
    tailHolder[file].listenerA = []
  }
  mytail.stdin.setEncoding("utf8");
  mytail.stdout.setEncoding("utf8");
  mytail.stderr.setEncoding("utf8");
  var listener = function(data) {
    var dataA = data.split("\n");
    for(var i = 0;i < dataA.length;i++) {
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
        if(!!match && !ifnot) {
          callback(match)
        }
        else if(!match && ifnot) {
          var rA=[];
          rA[0]=null;
          rA.index=null;
          rA.input=line;
          callback(rA);
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
  var kill = function() {
    mytail.stdout.removeListener("data", listener);
    if(tailHolder[file]&&tailHolder[file].listenerA)
    {
      var li = tailHolder[file].listenerA.indexOf(listener);
      if(li !== -1)
      {
        //console.log('making the array shorter '+li);
        //tailHolder[file].listenerA[li] = undefined;
        //console.log(tailHolder[file].listenerA);
        tailHolder[file].listenerA.splice(li,1);
        console.log(tailHolder[file].listenerA);
      }
      if(!tailHolder[file].listenerA.length) {
        d("no more jobs running on "+file+" going to unwatch it");
      self.killAll(true)
      }
    }
    else
    {
      throw new Error("Can't kill what is allready dead!");
    }
    
    
  };
  var killAll = function() {
    self.killAll();
  };
  var pid = {"tail":mytail.pid};
  var jobO = {"file_pid":pid, "eventname":eventname, "pattern":pattern,  "file":file, "kill":kill, "killAll":killAll};
  return jobO;
};
if(!exports) {
  var exports = this
}
//exports.job = job;
exports.debugSwitch = debugSwitch;
exports.tailList = tailHolder;
exports.watch = watch;
process.on("exit", function() {
  for(var t in tailHolder) {
    tailHolder[t].process.kill("SIGHUP")
  }
  d("Nolog.js Main loop exit")
});