/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

function getnames(data, dbconnectorCallBackToRooms) {
    'use strict';
    var vo = ['Liam', 'Samuel', 'Noah'];
    dbconnectorCallBackToRooms(data, vo);
}

module.exports.getnames = getnames;