/*
Example:
http://localhost:8081/addBlock?key=name&value=level
see:
https://bitcoin.stackexchange.com/questions/28168/what-are-the-keys-used-in-the-blockchain-leveldb-ie-what-are-the-keyvalue-pair?rq=1
https://en.bitcoin.it/wiki/Bitcoin_Core_0.11_(ch_2):_Data_Storage
*/
'use strict';

let params;

function addBlock(data, dbconnectorCallBackToRooms) {
    let connector = this.getConnector(),
        params = data.params;

    connector.put(params.key, params.value, function (err) {
        if (err) {
            return dbconnectorCallBackToRooms(null, {status: 'error', error: err});
        }

        connector.get(params.key, function (err, value) {
            if (err) return dbconnectorCallBackToRooms(null, {status: 'error', error: err});

            // Ta da!
            console.log(params.key + '=' + value);
            dbconnectorCallBackToRooms(data, {status: params.key + '=' + value});
        })
    });
}

module.exports.addBlock = addBlock;