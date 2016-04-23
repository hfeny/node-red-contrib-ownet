// ownet nodes
//
module.exports = function(RED) {
    "use strict";
    var ownet = require('./lib/ow');

    var shost = {};

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
            this.devpath = n.devpath;
            this.subpath = n.subpath;
            this.fullpath = this.devpath + this.subpath;
            this.status({fill:"green",shape:"ring",text:this.host + ':' + this.port});
        } else {
            this.status({fill:"red",shape:"ring",text:"not configured"});
        }
        var node = this;
        node.on('input', function (msg) {
            var owserver = new ownet.owserver(node.host, node.port);
            owserver.read(node.fullpath, function(res) {
                msg.topic = node.fullpath;
                msg.payload = res;
                node.send(msg);
            })
        });
    }
    RED.nodes.registerType('ownet read',ownetReadNode);
// End ownet device read Node

    function ownetWriteNode(n) {
        RED.nodes.createNode(this,n);
        // node-specific code goes here

    }
    RED.nodes.registerType('ownet write',ownetWriteNode);

// End ownet device write Node

    RED.httpAdmin.get('/ownet/ls',function(req, res){
        if(!req.query.path) { req.query.path="/"; }

        console.log(RED._('xxx: ')); // for debug

        var owServer = new ownet.owserver(req.query.host, req.query.port);
        owServer.ls(req.query.path, function(list) {
            res.json(list);
        });
    });



    RED.httpAdmin.get('/ownet/:id',function(req,res) {
        res.send('id' + req.query.id);
    });


    //node.log(RED._('info:') + node.host + ':' + node.port);
    //node.warn(RED._(node.host + ' ' + node.port + ' ' + node.req)); // for debug

    /*
    RED.httpAdmin.get('/ownet/ls',function(req,res) {
        if (!req.query.host) { return res.status(400).send( {'error': "'Host' parameter in query string required !"}); }
        else if (!req.query.port) { return res.status(400).send( {'error': "'Port' parameter in query string required !"}); }
        else if(!req.query.device) { req.query.device=""; }
        var owserver = new ownet.owserver(req.query.host, req.query.port);
        //var node = this;
        owserver.ls("/" + req.query.device, function(result) {
        //owserver.ls('/', function(result) {
            res.send({ 'devices': result.sort() });
        });
    });
    */



};
