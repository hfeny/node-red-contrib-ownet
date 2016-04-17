"use strict";
var owserver = require("./lib/ow");

module.exports = function(RED) {
    function owserverConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.port = n.port;
    }
    RED.nodes.registerType('owserver config',owserverConfigNode);

// End owserver config Node

    function ownetReadNode(n) {
        RED.nodes.createNode(this,n);
        // node-specific code goes here

    }
    RED.nodes.registerType('ownet read',ownetReadNode);

// End ownet device read Node

    function ownetWriteNode(n) {
        RED.nodes.createNode(this,n);
        // node-specific code goes here

    }
    RED.nodes.registerType('ownet write',ownetWriteNode);

// End ownet device write Node

    RED.httpAdmin.get("/ownet/ls",function(req,res) {
        if (!req.query.host) { return res.status(400).send( {'error': "'Host' parameter in query string required !"}); }
        else if (!req.query.port) { return res.status(400).send( {'error': "'Port' parameter in query string required !"}); }
        else if(!req.query.device) { req.query.device=""; }
        var owserver = new owserver.ownet('rpi1.local', 4304);
        var node = this;
        owserver.ls("/" + req.query.device, function(err, result) {
            if(err) {
                return res.send(err);
            }
            res.send({ 'devices': result.sort() });
        });
    });

};
