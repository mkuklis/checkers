require('./vendor/js-oo/lib/oo');

var sys = require('sys'),
	Listener = require('./socket.io/listener').Listener;

this.listen = function(server, options){
	return new Listener(server, options);
};
