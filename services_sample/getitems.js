/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

function VO(id, name) {
    'use strict';
    this.id = id;
    this.name = name;
}

function getitems(data, dbconnectorCallBackToRooms) {
    var sqlString = "SELECT * FROM test.users WHERE name != ''";
    this.sqlCommand(sqlString,
        function (rows) {
            var vo = new VO(rows[0].id, rows[0].name);
            dbconnectorCallBackToRooms(data, vo);
        });
}

module.exports.getitems = getitems;