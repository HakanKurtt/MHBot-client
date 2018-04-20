//CNC'den gelen verileri JSON'dan packet modeline ve packet modelinden JSON'a parsing işlemleri.
var Packet = require('../models/Packet');

module.exports.decode = function decode(packet){
    //json veriyi paket nesnesine donusturme
    var veri = Packet.fromJSON(JSON.parse(packet));
    console.log("Decoded data: "+JSON.stringify(veri));

    return veri;
}

module.exports.encode = function encode(packet){
    //paket nesnesini JSON'a donusturme
    var veri = JSON.stringify(packet);

    return veri;
}

