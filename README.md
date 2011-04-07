# nolog.js ... a node.js based real time event driven log file watcher 

nolog lets you watch (log)files in real time and matches regular expressions to events.

usage

      var nolog = require("/path/to/nolog/nolog.js");
      
watch a file

      //returns a NologEventEmitter
      var mylog = nolog.watch("/path/to/the/logfile.log");

note: to test the included examples localy you might want to funnel your webservers logfiles to a local test.log

    cd /path/to/nolog/
    ssh server.example.com -p2345 sudo tail -f /var/log/nginx/example.com_access.log > test.log

shout (throw an event) if a single logfile line matches an reguar expression

      //NologEventEmitter.watch(eventname, pattern)
      mylog.shoutIf('googlebot', /Googlebot/i );
      mylog.shoutIf('googlebot', "Chrome" );

the `pattern` argument can either be a regular expression or a simple string ( means .*+?|()[]{}\ will be treated as 'normal' characters)

`shoutIfNot` is the same (but opposite) of `shoutIf` - `shoutIfNot` throws an event if the pattern did not lead to a successfull match.

      //NologEventEmitter.shoutIfNot(eventname, pattern)
      mylog.shoutIfNot('allNotGetRequests', "GET" );
      
`shoutIf` and `shotIfNot` start (background) shout-jobs. 
      
`on` assigns an event handler
      
      //NologEventEmitter.on(eventname, callback)
      mylog.on('googlebot', function(data){ console.log("a Googlebot");});
      
`on` assigns an event handler to the `NologEventEmitter` listening for the `eventname`.

`shoutIf` and `shoutIfNot` assigned events return an RegExp return array <https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp/exec#Description> that's an array with a special `index` and `input` value.

as there was nothing found at `shouldIfNot` the `index` value is null, the first value of the array is also `null`. `input` is the parsed log line.

for other standard methods of NologEventEmitter see EventEmitter in the offical Node.js documentation <http://nodejs.org/docs/v0.4.5/api/events.html#events.EventEmitter>

kill a `shoutIf` or `shoutIfNot` job
      
      //NologEventEmitter.kill(eventname)
      mylog.kill('googlebot');

no more `googlebot` events will be thrown. the shout-job with the name `eventname` gets killed.

`unwatch` a file

      //NologEventEmitter.unwatch()
      mylog.unwatch();
      
`unwatch` kills all shout-jobs (no more events get thrown) and stops the background task watching the specific file.

`killAll` is a synonym for `unwatch`

if you `kill` the last last shout-job of a watched file, the file is automatically `unwatch`ed. said that, the `NologEventEmitter` object is still valid, if you add a new shout-job, the file is automatically re-`watch`ed. (think: magic)

usefull stuff

 - `NologEventEmitter.file` holds the watched `file` string, default `null`
 - `NologEventEmitter.follow` enables real time updates, default `true`
 - `NologEventEmitter.wholeFile` parses the whole file from the beginning, default `true` (note: handle with care, can fire millions of events at once, not suitable for browser clients applications)
 - `NologEventEmitter.jobs` array that holds all current shout-jobs assigned ot the currently watched file 











