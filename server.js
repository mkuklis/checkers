var http = require('http'), 
    io = require('./server/socket.io'),

server = http.createServer(function(req, res){
    // your normal server code
    res.writeHeader(200, {'Content-Type': 'text/html'});
    res.writeBody('<h1>Hello world</h1>');
    res.finish();
});

// socket.io, I choose you
io.listen(server);
