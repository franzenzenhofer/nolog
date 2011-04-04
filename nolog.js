#!/usr/bin/env node

var util = require('util');
var spawn = require('child_process').spawn;

var touchHolder = {};
var grepHolder = [];


var touchf = function(file)
{
  return spawn('tail', ['-f', file]);
}

var grep = function(pattern)
{
  return spawn('grep', [pattern]);
}

var job = function(file, pattern, callback, errcallback)
{
    return function(file, pattern, callback, errcallback)
    {
      var callback = callback || function(data){ console.log(data); return data; };
      var errcallback = errcallback || function(data){ console.log('stderr: '+data); return data; };
      var pattern = pattern || undefined;
      var file = file || undefined;
      var myTouchf, myGrep;
    
      if(file == undefined)
      {
        throw new Error('critical error in nolog - file must not be undefined');
      }
    //if file is not in fileA, add file to fileA
    //get touchf subprocess of the file
      if(touchHolder[file])
      {
        myTouchf=touchHolder[file];
      }
      else
      {
        myTouchf=touchf(file);
        touchHolder[file]=myTouchf;
      }
     //start the new grep
      myGrep = spawn('grep', 'pattern');
      grepHolder.push(myGrep);
      //send the data to the new grep process
      myTouchf.stdout.on('data', function(data){
        myGrep.stdin.write(data);
      });
      myTouchf.stderr.on('data', errcallback(data));
      myTouchf.on('exit', function(code) {
      if(code !== 0)
      {
        console.log('touch process exited with code '+code);
      }
        myGrep.stdin.end();
      });
    
      myGrep.stdout.on('data', callback(data));
      myGrep.stderr.on('data', errcallback(data));
    
      myGrep.on('exit', function(code) {
      if(code !== 0)
      {
        console.log('grep process exited with code '+code);
      }
      myTouchf.stdin.end();
      });
      
      var kill = function(signal)
      {
        var signal = signal || 'SIGHUP';
        myGrep.kill(signal);
        myTouchf.kill(signal);
      }
      
      var pids = {'grep':myGrep.pid, 'touch':myTouchf.pid}
      //expose to the outside
      this.kill = kill;
      this.pids = pids;
    }
} 


//if this process exits, then we exit the sub thingies, too.
process.on('exit', function () {
  grepHolder.forEach(function(g){ g.kill(); });
  for(var t in touchHolder)
  {
    touchHolder[t].kill();
  }
  console.log('Main loop exit');
});


