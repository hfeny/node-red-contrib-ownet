// Library for talk with owserver
// Usage:
// var ownet = require('./lib/ow').ownet;
// var owserver = new ownet('owserver.host',owserver.port);
// owserver.ls('/', function(data){ console.log(data) });
// owserver.read('/28.97CA2E020000/temperature10', function(data){ console.log(data) });
// owserver.write('/3A.C64F07000000/PIO.A', 0, function(data){ console.log(data) });
//

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
var owserver_header_struct, owserver_header_lenght;
owserver_header_struct = ['version', 'payload', 'type', 'control_flag', 'size', 'offset'];
owserver_header_lenght = 24;

exports.owserver = function (server, port){
    server = server != null ? server : 'localhost';
    port = port != null ? port : 4304;

    this.request = function(path, type, value, callback){
        var message = [];
        var socket = new net.Socket({ type: 'tcp4'});
        
        socket.on('error', function(error){
            console.log(error.toString('utf8'));
        });

        socket.on('end', function(){
            if (callback && typeof(callback) === "function"){
                callback(message);
            }
        });

        socket.on('data', function(data) {
            var header, payload, i;
            header = {};
            for(i = 0; i < owserver_header_struct.length; i++ ){
                header[owserver_header_struct[i]] = ntohl(data.slice(i * 4), 0);
            }
            payload = data.slice(owserver_header_lenght).toString('utf8');
            message.push({
                header: header,
                payload: payload
            });
        });

        socket.connect(port, server, function(){
            path += '\x00';
            value = (type == OW_WRITE) ? value.toString() + '\x00' : '';
            var buffer = new Buffer(path.length + value.length + owserver_header_lenght);
            htonl(buffer, 0, 0);
            htonl(buffer, 4, path.length + value.length);
            htonl(buffer, 8, type);
            htonl(buffer, 12, 0x00000020);
            htonl(buffer, 16, value.length ? value.length : 8192);
            htonl(buffer, 20, 0);
            buffer.write(path + value, owserver_header_lenght);
            return socket.end(buffer);
        });
    };

    this.ls = function(path, callback){
        this.request(path, OW_DIRALL, 0, function(data){
            data = (data[data.length - 1].payload.replace(new RegExp("[\u0000-\u001F]", "g"), "").split(","));
            callback(data);
         });
     };

    this.read = function(path, callback){
        this.request(path, OW_READ, 0, function(data){
            data = (data[data.length - 1].payload.replace(new RegExp("[\u0000-\u001F]", "g"), "").replace(new RegExp(" ", "g"), ""));
            callback(data);
        });
    };

    this.write = function(path, value, callback){
        this.request(path, OW_WRITE, value, function(data){
            data = (data[data.length - 1].header.type);
            callback(data);
        });
    };

};
