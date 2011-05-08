var $n = require('../nolog.js');
$n.enableDebug(true);
var log = $n("../test.log");
//var log = $n("./ciao.log");

log.shoutIfNot('allNotPostRequests', "POST" );
log.on('allNotPostRequests', function(data){ console.log(data);});

