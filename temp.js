/* example usage */
var ownet = require("./lib/ow");
var owserver = new ownet.owserver('rpi1.local', 4304);

owserver.ls('/', function(data){
    console.log(data);
});

owserver.read('/28.97CA2E020000/temperature10', function(data){
    console.log(data);
});

owserver.write('/3A.C64F07000000/PIO.A', 1, function(data){
    console.log(data);
});
