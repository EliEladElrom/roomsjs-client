/*
Example:
http://localhost:8081/addBlock?key=name
*/
'use strict';

let params;

function getBlock(data, dbconnectorCallBackToRooms) {
    let connector = this.getConnector(),
        params = data.params;

    connector.get(params.key, function (err, value) {
        if (err) return dbconnectorCallBackToRooms(null, {status: 'error', error: err});

        // Ta da!
        console.log(params.key + '=' + value);
        dbconnectorCallBackToRooms(data, {status: params.key + '=' + value});
    })
}

module.exports.getBlock = getBlock;