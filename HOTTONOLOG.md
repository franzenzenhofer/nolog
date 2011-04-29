How to Nolog
===

**Nolog - just listen to your logfiles.**

nolog does
 * watch
 * shout
 * listen
to your logfiles.


or to put it another way

nolog matches patterns in logfiles to events, in real time. so stop thinking about logfiles as a big chunk of complicated data that lies around rotting somewhere on your server. logfiles are collections of events, time to treat them as such.

nolog is a new way to 
 * parse
 * watch
 * think about 
logfiles (done in node.js)

**getting started**

      >npm install nolog
      
great, you installed nolog.

now, in you script

      var $n = require('nolog');
      
you just loaded nolog into the variable $n.

**WATCH** a logfile

      $n('/path/to/logfile.log');

this logfile is not under supervision. 

**SHOUT**

      $n('/path/to/my/logfile.log').shout('googlebot);

whenever nolog sees a 'googlebot' in your logfiles, it shouts 'googlebot'. one line after the other.

**LISTEN**

     $n('/path/to/my/logfile.log').shout('googlebot).on('googlebot', function(data){console.log(data);});
     
nolog listens if someone shouts 'googlebot' and does what it is told in the callback.

that is all you need to know. but if you want to know more, read along.

**s, si and sin**

lets start with `si. `si` is short of `shoutIf`

      $n('/path/to/logfile.log').shoutIf('bot',/.*bot/i).on('bot', function(data){ console.log("it's a robot"); });
      //or if you do not want to write as much
      $n('/path/to/logfile.log').si('bot',/.*bot/i).on('bot', function(data){ ... });

`shoutIf(eventname, pattern)` shouts `eventname` if the pattern `pattern` is successfully encountered.

`sin` is short for `shoutIfNot`.

      $n('/path/to/logfile.log').shoutIfNot('human',/.*bot/i).on('human', function(data){ console.log("it's a human"); });
      //or the short way
      $n('/path/to/logfile.log').sin('human',/.*bot/i).on('human', function(data){ console.log("it's a human"); });
      
`shoutIfNot(eventname, pattern)` shouts `eventname` if the pattern `pattern` is not encountered. because a lot of time, you look for one thing, but you want the complete opposite. 

so what about `s`. `s` is shot for `shout` and is a fluffy shortcut for `shoutIf`.
  
        $n('/path/to/logfile.log').shout('googlebot').on('googlebot', function(data){ console.log("it's google, again."); });
        //does the same stuff, as
        $n('/path/to/logfile.log').shoutIf('googlebot',/googlebot/i).on('googlebot', function(data){ console.log("it's google, again."); });
      
`shout(eventname)` shouts `eventname` if a case-insensitive match to `eventname` was found. because most of the time, if you are looking for a 'cat' you shout 'cat'.

**listening**

well, see http://nodejs.org/docs/v0.4.7/api/events.html#emitter.addListener

with all the above you are allready well equiped for everyday logfile listening. but there is even more.

**patterns**

patterns can be
  * regular expressions
  * strings
  * functions
  * booleans

for the regular expression stuff, see the examples above.

strings are treated as 'no fancy pancy stuff' regular expressions: "Test" matches "Test" and "(/%&/(%(&/$&%§$$%/&$&%/()%&89+++***" matches "(/%&/(%(&/$&%§$$%/&$&%/()%&89+++***" and nothing else (means: .*+?|()[]{}\ will be treated as 'normal' characters).

if you don't like RegExp you can pass functions as patterns. functions get the current line as argument, the return value gets passed to the listener callback method. see https://github.com/franzenzenhofer/nolog/blob/master/sample/uniqueip-functionpattern.js for a good example.

booleans - `true` will always match, `false` will never match.

** notevents **

ok, if you have come so far you are definitly really into this topic. 








    

      





