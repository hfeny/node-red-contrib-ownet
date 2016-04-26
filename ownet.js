// ownet nodes
//
module.exports = function(RED) {
    "use strict";
    var ownet = require('./lib/ow');
//
// Start owserver config Node
    function owserverConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.port = n.port;
    }
    RED.nodes.registerType('owserver',owserverConfigNode);
// End owserver config Node
//
// Start ownet device read Node
    function ownetReadNode(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.owserver);
        if(this.config){
            this.host = this.config.host;
            this.port = this.config.port;
            this.path = n.path;
            this.subpath = n.subpath;
            this.status({fill:"green",shape:"dot",text:this.host + ':' + this.port + this.path + this.subpath});
        } else {
            this.status({fill:"red",shape:"dot",text:"owserver not set"});
        }
        var node = this;
        node.on('input', function (msg) {
            var owserver = new ownet.owserver(node.host, node.port);
            owserver.read(node.path + node.subpath, function(res) {
                msg.topic = node.path + node.subpath;
                msg.payload = res;
                node.send(msg);
            })
        });
    }
    RED.nodes.registerType('ownet-read',ownetReadNode);
// End ownet device read Node
// Start ownet device write Node
    function ownetWriteNode(n) {
        RED.nodes.createNode(this,n);
        this.config = RED.nodes.getNode(n.owserver);
        if(this.config){
            this.host = this.config.host;
            this.port = this.config.port;
            this.path = n.path;
            this.subpath = n.subpath;
            this.status({fill:"green",shape:"dot",text:this.host + ':' + this.port + this.path + this.subpath});
        } else {
            this.status({fill:"red",shape:"dot",text:"owserver not set"});
        }
        var node = this;
        node.on('input', function (msg) {
            var owserver = new ownet.owserver(node.host, node.port);
            var value = msg.payload;
            owserver.write(node.path + node.subpath, value, function(res) {
                msg.topic = node.path + node.subpath;
                msg.payload = res;
                node.send(msg);
            })
        });
    }
    RED.nodes.registerType('ownet-write',ownetWriteNode);
// End ownet device write Node

    RED.httpAdmin.get('/ownet/ls/:host/:port/*',function(req,res) {
        var server = new ownet.owserver(req.params.host, req.params.port);
        if(!req.params[0]){ req.params[0] = '/'; };
        server.ls(req.params[0], function(data){
            var list = [];
            data = data.sort().slice();
            var excluded_paths = new RegExp("/(?:address|crc8|errata|family|id|locator|scratchpad|r_[a-z]+)$");
            for( var i = 0; i < data.length; i++ ){
                if(data[i].length > 16){
                    if(!data[i].slice(16).match(excluded_paths)){
                        list.push(data[i].slice(16));
                    }
                }
                else {
                    list.push(data[i]);
                }
            }
            res.json(list);
        });
    });
};

