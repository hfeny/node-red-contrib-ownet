var net, ntohl, htonl;
net = require('net');
ntohl = require('network-byte-order').ntohl;
htonl = require('network-byte-order').htonl;

// owserver message types
var OW_READ, OW_WRITE, OW_DIR, OW_DIRALL, OW_GET;
OW_READ = 2;
OW_WRITE = 3;
OW_DIR = 4;
OW_DIRALL = 7;
OW_GET = 8;

// owserver header structure
var server_header, client_header;
server_header = ['version', 'payload', 'type', 'control_flag', 'size', 'offset'];
client_header = ['version', 'payload', 'ret', 'control_flag', 'size', 'offset'];

exports.ownet = function (server, port) {
    server = server != null ? server : 'localhost';
    port = port != null ? port : 4304;

    this.request = function(path, type, value){
        var message = [];
        var socket = new net.Socket({ type: 'tcp4'});
        
        socket.on('error', function(error){
            console.log(error.toString('utf8'));
        });

        socket.on('end', function() {
            console.log('End request.');
            console.log('response\n', message);
        });

        socket.on('data', function(data) {
            var header, payload, i;
            header = {};
            for(i = 0; i < server_header.length; i++ ){
                header[server_header[i]] = ntohl(data.slice(i * 4), 0);
            }
            payload = data.slice(24).toString('utf8');
            message.push({
                header: header,
                payload: payload
            });
        });

        //return socket.connect(port, server, function(){
        socket.connect(port, server, function(){
            path += '\x00';
            value = (type == OW_WRITE) ? value.toString() + '\x00' : '';
            var buffer = new Buffer(path.length + value.length + 24);
            htonl(buffer, 0, 0);
            htonl(buffer, 4, path.length + value.length);
            htonl(buffer, 8, type);
            htonl(buffer, 12, 0x00000020);
            htonl(buffer, 16, value.length ? value.length : 8192);
            htonl(buffer, 20, 0);
            buffer.write(path + value, 24);
            return socket.end(buffer);
        });
    // end ownet.request function
    };
};

