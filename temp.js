var ownet = require("./lib/ow").ownet;
var conn = new ownet('rpi1.local',4304);

var msg = conn.request('/',8,0);

//conn.request('/3A.C64F07000000/PIO.A',3,1);

//var msg = conn.request('/3A.C64F07000000/PIO.A',3,0);

console.log('msg', msg);