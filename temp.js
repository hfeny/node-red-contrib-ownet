var ownet = require('./lib/ow').ownet;
var owserver = new ownet('rpi1.local',4304);

owserver.ls('/', function(data){
    console.log(data);
});

owserver.read('/28.97CA2E020000/temperature10', function(data){
    console.log(data);
});

owserver.write('/3A.C64F07000000/PIO.A', 0, function(data){
    console.log(data);
});

