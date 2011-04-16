var root = this;
var util = require("util");
var events = require("events");
var spawn = require("child_process").spawn;
var debugIt = false;
var tailHolder = {};
RegExp.escape = function(str) {
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
  return str.replace(specials, "\\$&")
};
RegExp.isRegExp = function(obj) {
  return!!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false))
};
var debugconsole = function(s) {
  if(debugIt === true) {
    console.log(s)
  }
};
var d = debugconsole;
var NologEventEmitter = function() {
  events.EventEmitter.call(this)
};
NologEventEmitter.super_ = events.EventEmitter;
NologEventEmitter.prototype = Object.create(events.EventEmitter.prototype, {constructor:{value:NologEventEmitter, enumberable:false}});
NologEventEmitter.prototype.file = null;
NologEventEmitter.prototype.follow = true;
NologEventEmitter.prototype.wholefile = false;
NologEventEmitter.prototype.errcallback = null;
NologEventEmitter.prototype.exitcallback = null;
NologEventEmitter.prototype.jobs = [];
NologEventEmitter.prototype.shoutIf = function(eventname, pattern, enableNotEvent) {
  var self = this;
  d(self);
  var file = self.file;
  var notevent = notevent || false;
  self.jobs.push(job.call(self, file, pattern, eventname, function(eventname, data) {
    self.emit(eventname, data)
  }, self.errcallback, self.exitcallback, self.follow, self.wholefile, false, enableNotEvent));
  return self
};
NologEventEmitter.prototype.si = NologEventEmitter.prototype.shoutIf;
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
NologEventEmitter.prototype.shoutIfNot = function(eventname, pattern, enableNotEvent) {
  var self = this;
  var file = self.file;
  self.jobs.push(job.call(self, file, pattern, eventname, function(eventname, data) {
    self.emit(eventname, data)
  }, self.errcallback, self.exitcallback, self.follow, self.wholefile, true, enableNotEvent));
  return self
};
NologEventEmitter.prototype.sin = NologEventEmitter.prototype.shoutIfNot;
NologEventEmitter.prototype.kill = function(eventname) {
  d("debugIt" + debugIt);
  d("kill " + eventname);
  var self = this;
  self.jobs.forEach(function(e) {
    if(e.eventname == eventname) {
      return e.kill()
    }
  });
  return self
};
NologEventEmitter.prototype.killAll = function(jobsAllreadyGone) {
  var self = this;
  var jobsAllreadyGone = jobsAllreadyGone || false;
  if(jobsAllreadyGone === false) {
    self.jobs.forEach(function(e) {
      e.kill()
    })
  }
  tailHolder[self.file].process.kill("SIGHUP");
  delete tailHolder[self.file];
  return self
};
NologEventEmitter.prototype.unwatch = NologEventEmitter.prototype.killAll;
var stumpA = [];
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
var createEmiter = function(file, o) {
  var nee = new NologEventEmitter;
  nee.file = file;
  for(var n in o) {
    nee[n] = o[n]
  }
  return nee
};
var watch = createEmiter;
var job = function(file, pattern, eventname, callback, errcallback, exitcallback, follow, wholefile, ifnot, notevent) {
  var self = this;
  var callback = callback || function(data) {
    return data
  };
  var errcallback = errcallback || function(data) {
    d("stderr: " + data);
    throw new Error(data);
  };
  var exitcallback = function(code) {
    d("tail process exited with code " + code)
  };
  var temppat = pattern;
  if(pattern != undefined && !RegExp.isRegExp(pattern) && typeof pattern == "string") {
    temppat = new RegExp(RegExp.escape(pattern))
  }else {
    if(pattern != undefined && RegExp.isRegExp(pattern)) {
      temppat = pattern
    }else {
      if(pattern != undefined && typeof pattern == "boolean") {
        temppat = !!pattern
      }else {
        if(pattern != undefined && typeof pattern == "function") {
          temppat = pattern
        }else {
          throw new Error("pattern must be a regular expression, true/false or a function");
        }
      }
    }
  }
  var pattern = temppat;
  delete temppat;
  var eventname = eventname || "nologId" + function() {
    var id = 0;
    return function() {
      if(arguments[0] == 0) {
        id = 1;
        return 0
      }else {
        return id++
      }
    }
  }();
  var file = file || undefined;
  var follow = !!follow;
  var wholefile = !!wholefile;
  var ifnot = !!ifnot;
  var notevent = !!notevent;
  var mytail;
  var myDataStream;
  if(!file) {
    throw new Error("critical error in nolog - file must not be undefined");
  }
  if(typeof file === 'string')
  {
    console.log('is File');
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
    myDataStream = mytail.stdout; 
  }
  else if(typeof file == 'object' && file.readable === true &&  file.pause && file.destroy && file.resume)
  {
      d('is ReadableStream Object');
      file.setEncoding("utf8");
      myDataStream = file;
  }
  else
  {
    throw new Error('file must either be a path/to/file/string or a ReadableStream');
  }
  
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
        var getNoMatchReturnA = function(line, pseudomatch) {
          var rA = [];
          if(!!pseudomatch) {
            rA[0] = line
          }else {
            rA[0] = null
          }
          rA.index = null;
          rA.input = line;
          return rA
        };
        var match;
        if(RegExp.isRegExp(pattern)) {
          match = line.match(pattern)
        }else {
          if(typeof pattern == "function") {
            match = pattern(line)
          }else {
            pattern = !!pattern;
            if(pattern === true && !ifnot) {
              match = getNoMatchReturnA(line, true)
            }else {
              if(pattern === true && ifnot) {
                match = false
              }else {
                if(pattern === false && !ifnot) {
                  match = false
                }else {  
                  if(pattern === false && ifnot) {
                    match = getNoMatchReturnA(line, true)
                  }
                }
              }
            }
          }
        }
        if(!!match && !ifnot || !!match && ifnot && notevent) {
          if(!!match && ifnot && notevent) {
            callback("!" + eventname, match)
          }else {
            callback(eventname, match)
          }
        }else {
          if(!match && ifnot || !match && notevent && !ifnot) {
            var rA = getNoMatchReturnA(line);
            var neweventname = eventname;
            if(!match && notevent && !ifnot) {
              callback("!" + eventname, rA)
            }else {
              callback(neweventname, rA)
            }
          }
        }
      }
    }
  };
  myDataStream.on("data", listener);
  
  
    var kill = function() {
    myDataStream.removeListener("data", listener);
    if(tailHolder && tailHolder[file] && tailHolder[file].listenerA) {
      var li = tailHolder[file].listenerA.indexOf(listener);
      if(li !== -1) {
        tailHolder[file].listenerA.splice(li, 1);
        d(tailHolder[file].listenerA)
      }
      if(!tailHolder[file].listenerA.length) {
        d("no more jobs running on " + file + " going to unwatch it");
        self.killAll(true)
      }
    }else {
      //throw new Error("Can't kill what is allready dead!");
    }
  };
  var killAll = function() {
    self.killAll()
  };
  
  if(typeof file === 'string' && mytail)
  {
    tailHolder[file].listenerA.push(listener);
    mytail.stderr.on("data", function(data) {
    errcallback(data)
   });
    mytail.on("exit", exitcallback);
    var pid = {"tail":mytail.pid};
  }
  else
  {
    var pid = undefined;
  }
  
  var jobO = {"file_pid":pid, "eventname":eventname, "pattern":pattern, "file":file, "kill":kill, "killAll":killAll};
  return jobO
};
var nolog = new function() {
  var main = this;
  main.watch = watch;
  main.watch.enableDebug = function(val) {
    debugIt = val;
    return this
  };
  main.watch.w = main.watch;
  main.watch.watch = main.watch;
  main.watch.tailList = tailHolder
};
module.exports = nolog.watch;