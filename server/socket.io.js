sys.puts(__dirname);
require.paths.unshift('./vendor/js-oo/lib');
require('oo');

var sys = require('sys'),
	Listener = require('./socket.io/listener').Listener;

this.listen = function(server, options){
	return new Listener(server, options);
};
