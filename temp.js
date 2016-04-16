var ownet = require('./lib/ow').ownet;
var conn = new ownet('rpi1.local',4304);

conn.request('/',8,0);

conn.request('/3A.C64F07000000/PIO.A',3,1);
conn.request('/3A.C64F07000000/PIO.A',2);

