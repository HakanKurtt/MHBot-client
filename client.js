var io = require('socket.io-client');
var parser = require('./utils/parser');


var crypto = require('./crypto');


//reconnect parametresi bağlantı koptuğunda tekrardan sunucuya bağlanması için
var socket = io.connect('http://127.0.0.1:8080', {reconnect: true});

var receiver_id;
var sender_id;
var thisSocket;
var processor;


socket.on('connect', function(socket){
    console.log('connected!');
    thisSocket=socket;
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
    var promise= new Promise(function(fulfill, reject){
        var paket = processor.processPacket(decodedPacket, sender_id, receiver_id);
        if(paket){
            console.log("PACKET="+paket);
            fulfill(paket);

        }else{
            reject("Bir hata oluştu.");
        }
    });

    promise.then(function(paket){
        socket.emit('data', paket);
    })



});


socket.on('disconnect', function(){
    console.log('disconnected!');
});
