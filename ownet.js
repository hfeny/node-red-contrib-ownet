// ownet nodes
//
module.exports = function(RED) {
    "use strict";
    var x;
    var ownet = require('./lib/ow');
    var shost = {};
    var sport = {};

// Start owserver config Node
    function owserverConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.port = n.port;
        this.path = n.path;
    }
    RED.nodes.registerType('owserver',owserverConfigNode);
// End owserver config Node
//
// Start ownet device read Node
    function ownetReadNode(n) {
        RED.nodes.createNode(this, n);
        this.server = RED.nodes.getNode(n.owserver);
        if(this.server){
            this.host = this.server.host;
            this.port = this.server.port;

            shost[this.host] = n.id;

            this.status({fill:"green",shape:"ring",text:this.host + ':' + this.port});
        } else {
            this.status({fill:"red",shape:"ring",text:"not configured"});
        }
        this.req = "/" + n.deviceID + "/" + n.deviceProp;

        shost.hasOwnProperty(this.host);



        var a = this.host;
        var b = this.port;
        var c = this.req;

        var node = this;


        if(shost[node.host] === node.id ){
            console.log('node id ' + node.id + ' host ' + node.host);
        }
        else {
            console.log('no think ');
        }

        RED.httpAdmin.get('/ownet/tt',function(req, res){
            var owServer = new ownet.owserver(a, b);
            owServer.ls("/", function(r){
                console.log('r' + r);
                x = r.slice();
            });
            res.send({ 'x': x });
            console.log('x'+ x);
            //res.json(p2);
        });

        RED.httpAdmin.get('/ownet/ls',function(req, res){
            if(!req.query.path) { req.query.path=""; }

            var owServer = new ownet.owserver(node.host, node.port);
            owServer.ls("/" + req.query.path, function(result) {
                node.warn(RED._('node id: ' + node.id)); // for debug
                res.send({ 'devices': result.sort() });
            });

        });


        node.on('input', function (msg) {
            var owserver = new ownet.owserver(node.host, node.port);
            owserver.read(node.req, function(res) {
                msg.topic = n.deviceID;
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
