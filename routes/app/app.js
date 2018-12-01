const express = require('express');
const router = express.Router();
var querystring = require('querystring');
var url = require("url");
const nodemailer = require('nodemailer');
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../../database/database');
const jsonParser = bodyparser.json();

var constMailData;

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jaynekaylaellis@gmail.com',
    pass: 'user_admin_user_@'
  }
});

router.post("/app.validate", validation);
function validation(req, res) {
 var returnArray = [];
  var uriData = url.parse(req.url);	
  var queryData = querystring.parse(uriData.query);
  var jsonArray = {"message": "", "id":""};

  var username = queryData.username;
  var password = queryData.password;

 pool.query("SELECT * from userinfo where username=$1 and \
    password=$2",[username, password], (error, response) => {
      if (response.rowCount >=1){
       jsonArray.message = "Login sucessfully";
       jsonArray.id =  response.rows[0].id;
        returnArray.push(jsonArray);
        res.send(returnArray); 
      }
      else {
        res.send("Try again");
      }
    });
}

router.post("/app.dashboard", dashboard);
function dashboard(req, res){
  var uriData = url.parse(req.url); 
  var queryData = querystring.parse(uriData.query);

  var returnArray = [];
  var jsonArray = {"house": ""};
  var houseArray = [], i;

  var userid = queryData.userid;
  pool.query('select * from house where userid=$1',[userid], (err, result) => {
    if (result.rows.length != 0) {
        for (i=0; i<result.rows.length; i++){
          houseArray.push(result.rows[i].name);
          jsonArray.house = houseArray;
        }
        returnArray.push(jsonArray);
        res.send(returnArray);
    }
    else {
        res.send("Try again");
      }
});
}

router.post("/app.house", house);
function house(req, res){
  var uriData = url.parse(req.url); 
  var queryData = querystring.parse(uriData.query);

  var returnArray = [];
  var jsonArray = {"floor": ""};
  var floorArray = [], i;

  var userid = queryData.userid;
  var houseName = queryData.housename;

  pool.query('select * from floor where userid=$1 and housename=$2',[userid, houseName], (err, result) => {
    if (result.rows.length != 0) {
      for (i=0; i<result.rows.length; i++){
        floorArray.push(result.rows[i].name);
      }
       jsonArray.floor = floorArray;
       returnArray.push(jsonArray);
       res.send(returnArray);
  }
  else {
        res.send("Try again");
      }
});
}

router.post("/app.floor", floor);
function floor(req, res){
  var uriData = url.parse(req.url); 
  var queryData = querystring.parse(uriData.query);

  var returnArray = [];
  var jsonArray = {"room": ""};
  var roomArray = [], i;

  var userid = queryData.userid;
  var floorName = queryData.floorname;
  var houseName = queryData.housename;

  pool.query('select * from room where userid=$1 and floorname=$2 and housename=$3',
    [userid, floorName, houseName], (err, result) => {
    if (result.rows.length != 0) {
          for (i=0; i<result.rows.length; i++){
            roomArray.push(result.rows[i].name);
        }
        jsonArray.room = roomArray;
        returnArray.push(jsonArray);
        res.send(returnArray);
    }
    else {
      res.send("Try again");
    }
  });
}

router.post("/app.room", room);
function room(req, res){
  var uriData = url.parse(req.url); 
  var queryData = querystring.parse(uriData.query);

  var returnArray = [], i;
  var jsonArray = {"room": []};

  var userid = queryData.userid;
  var floorName = queryData.floorname;
  var houseName = queryData.housename;
  var roomName = queryData.roomname;

  pool.query('select * from devices where housename=$1 and floorname=$2 and roomname=$3 and userid=$4',
    [houseName, floorName, roomName, userid], (err, result) => {
    if (result.rows.length != 0) {
          for (i=0; i<result.rows.length; i++){
          var deviceJSON = {"name": "", "id": "","type": ""};	
          deviceJSON.name = result.rows[i].name;
          deviceJSON.id = result.rows[i].id;
          deviceJSON.type = result.rows[i].type;
          jsonArray.room.push(deviceJSON);
        }
        returnArray.push(jsonArray);
        res.send(returnArray);
  }
  		else res.send("unknown");
	});
}

//only handle when you access the same house-floor-room in website and app
router.post("/room.onload", roomOnload);
function roomOnload(req, res){
  var userid = req.session.userid;
  var floorName = req.session.floor;
  var houseName = req.session.house;
  var roomName = req.session.room;

  var returnArray = [], i;

  pool.query('select * from devices where housename=$1 and floorname=$2 and roomname=$3 and userid=$4',
    [houseName, floorName, roomName, userid], (err, result) => {
    if (result.rows.length != 0) {
          for (i=0; i<result.rows.length; i++){
          var deviceJSON = {"name": "", "id": "", "type":""};
          deviceJSON.name = result.rows[i].name;
          deviceJSON.id = result.rows[i].id;
          deviceJSON.type = result.rows[i].type;
           returnArray.push(deviceJSON);
        }
        res.send(returnArray);
      }
    });         
}
  
var deviceStatus;

router.post("/app.device", jsonParser, device);
function device(req, res){
  deviceStatus = req.body.sendArray;
  res.send(deviceStatus); // must end with res.send() or res.sendStatus();
}

router.post("/app.return", returnStatus);
function returnStatus(req, res){
  res.send(deviceStatus);
}

router.post("/app.email", jsonParser, emailSent);
function emailSent(req, res) {
  var receiveData = req.body.mailData;

  var mailOptions = {
  from: 'jaynekaylaellis@gmail.com',
  to: 'tranphucvinh471776@gmail.com',
  subject: 'Temperature alert',
  text: 'Alert !!! Temperature is higher than 32°C, temperature now'+receiveData
};

if (constMailData != receiveData) {
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    });
    constMailData = receiveData;
  }
}

module.exports = router; 