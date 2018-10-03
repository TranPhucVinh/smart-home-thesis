const express = require('express');
const router = express.Router();
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../../database/database');

router.get("/", devicesGet);
function devicesGet(req, res) {
	var nameArr = [], idArr = [], deviceType = [], i;
	if (req.session.userid == undefined) {
		res.redirect("/login");
	}
	else {
	pool.query('select * from devices where housename=$1 and floorname=$2 and roomname=$3 and userid=$4',
		[req.session.house, req.session.floor, req.session.room, req.session.userid], (err, result) => {
		if (result.rows.length != 0) {
					for (i=0; i<result.rows.length; i++){
					nameArr.push(result.rows[i].name);
					idArr.push(result.rows[i].id);
					deviceType.push(result.rows[i].type);
				}
	}
	res.render("room", {currentHouse: req.session.house,
		currentFloor: req.session.floor,
		currentRoom: req.session.room,
		nameArr: nameArr,
		idArr: idArr,
		deviceType: deviceType,
		username: req.session.username});
		});	
	}
}

router.post("/add", urlencodedParser, addPost);
function addPost(req, res){
	var deviceName = req.body.deviceName;
	var deviceType = req.body.deviceType;
	var duplicate = "Duplicate";
	
	pool.query('select * from devices where housename=$1 and floorname=$2 and roomname=$3 and userid=$4 and name=$5',
		[req.session.house, req.session.floor, req.session.room, req.session.userid, deviceName],
		(error,response) => {
			if (response.rowCount >=1){
				res.send(duplicate);
			}
			else{
				pool.query('insert into devices (name, type, housename, floorname, roomname, userid) values ($1, $2, $3, $4, $5, $6)',
					[deviceName, deviceType, req.session.house, req.session.floor, req.session.room, req.session.userid]);
				res.redirect("/room");
			}
		});
}

router.post("/device", urlencodedParser, devicePost);
function devicePost(req, res) {
	req.session.deviceType = req.body.deviceType;
	res.redirect("/device");
}
module.exports = router;