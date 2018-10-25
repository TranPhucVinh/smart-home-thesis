const express = require('express');
const router = express.Router();
var querystring = require('querystring');
var url = require("url");
const pool = require('./../../database/database');

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
  var deviceJSON = {"name": "", "id": "","type": ""};

  var userid = queryData.userid;
  var floorName = queryData.floorname;
  var houseName = queryData.housename;
  var roomName = queryData.roomname;

  pool.query('select * from devices where housename=$1 and floorname=$2 and roomname=$3 and userid=$4',
    [houseName, floorName, roomName, userid], (err, result) => {
    if (result.rows.length != 0) {
          for (i=0; i<result.rows.length; i++){

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

module.exports = router; 