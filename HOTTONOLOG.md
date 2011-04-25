how to nolog

nolog is a new way to 
 * parse
 * watch
 * think about 
logfiles (done in node.js)

or to put it another way

nolog matches logfile-pattern to events, in real time. so stop thinking about logfiles as a big chunk of complicated data that lies rotting somewhere on your server. logfiles are a collection of events, time to treat them as such.

nolog does
 * watch
 * shout
 * listen
to your logfiles.

getting started

      >npm install nolog
      
great, you installed nolog.

now, in you script

      var $n = require('nolog');
      
you just loaded nolog into the variable $n.

WATCH a logfile

      $n('/path/to/logfile.log');

this logfile is not under supervision. 

SHOUT

      $n('/path/to/my/logfile.log').shout('googlebot);

whenever nolog sees a 'googlebot' in your logfiles, it shouts 'googlebot'. one line after the other.

LISTEN

     $n('/path/to/my/logfile.log').shout('googlebot).on('googlebot', function(data){console.log(data);});
     
nolog listens if someone shouts 'googlebot' and does what it is told in the callback.

that is all you need to know. but if you want to know more, read along.

**s, si and sin**

lets start with `si. `si` is short of `shoutIf`

      $n('/path/to/logfile.log').shoutIf('bot',/.*bot/i).on('bot', function(data){ ... });
      //or if you do not want to write as much
      $n('/path/to/logfile.log').si('bot',/.*bot/i).on('bot', function(data){ ... });

`shoutIf(eventname, pattern)` shouts `eventname` if the pattern `pattern` is successfully encountered.



      
      





