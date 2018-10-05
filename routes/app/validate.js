const express = require('express');
const router = express.Router();
var querystring = require('querystring');
var url = require("url");
const pool = require('./../../database/database');

var returnArray = [];

router.post("/", validation);
function validation(req, res) {
  var uriData = url.parse(req.url);	
  var queryData = querystring.parse(uriData.query);
  returnArray.push(queryData);
  res.send(returnArray);
}

module.exports = router; 