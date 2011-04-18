var http=require('http');
var $n = require('../nolog2.js');

var options = {
  host: 'www.google.com',
  port: 80,
  path: '/robots.txt'
};

http.get(options, function(res) {
  //console.dir(res);
  res.setEncoding('utf8');
  $n(res).shoutIf('sitemap', /sitemap/i);
  //$n(res).s('sitemap').on('sitemap', function(data){ console.log(data.input); })
  
  /*res.on('data',function(chunk)
  {
    console.log(chunk);
    console.log('------------------');
  });*/
});