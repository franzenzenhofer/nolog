var http=require('http');
var $n = require('../nolog2.js');

var options = {
  host: 'www.google.com',
  port: 80,
  path: '/robots.txt'
};

http.get(options, function(res) {
  //console.dir(res);
  //note: if you handle  a ready made readable stream to nolog, be sure that it's propably encoded
  res.setEncoding('utf8');
  $n(res).shoutIf('sitemap', /http.*\//i).on('sitemap', function(data){ console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');console.dir(data); });
  //$n(res).s('sitemap').on('sitemap', function(data){ console.log(data.input); })
  
  /*res.on('data',function(chunk)
  {
    console.log(chunk);
    console.log('------------------');
  });*/
});