const express = require('express');
const router = express.Router();
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../../database/database');

router.get("/", floorGet);
function floorGet(req, res) {
	var nameArr = [], idArr = [], i;
	if (req.session.userid == undefined) {
		res.redirect("/login");
	}
	else {
	pool.query('select * from room where userid=$1 and floorname=$2 and housename=$3',
		[req.session.userid, req.session.floor, req.session.house], (err, result) => {
		if (result.rows.length != 0) {
					for (i=0; i<result.rows.length; i++){
					nameArr.push(result.rows[i].name);
					idArr.push(result.rows[i].id);
				}
		}
	res.render("floor", {currentHouse: req.session.house,
		currentFloor: req.session.floor,
	nameArr: nameArr,
			idArr: idArr,
		username: req.session.username});
		});
	}
}

router.post("/add",urlencodedParser, dashboardPost);
function dashboardPost(req, res){
	var roomName = req.body.roomName;
	var duplicate = "Duplicate";
	
	pool.query('select userid, name from room where userid=$1 and name =$2 and housename=$3',
		[req.session.userid, roomName, req.session.house],
		(error,response) => {
			if (response.rowCount >=1){
				res.send(duplicate);
			}
			else{
				pool.query('insert into room (name, userid, housename, floorname) values ($1, $2, $3, $4)',
					[roomName, req.session.userid, req.session.house, req.session.floor]);
				res.redirect("/floor");
			}
		});
}

router.post("/edit", urlencodedParser, editPost);
function editPost(req, res){
	pool.query('update room set name=$1 where id=$2',
		[req.body.editname, req.body.editid]);
		res.redirect("/floor");
}

router.delete("/delete/:id", urlencodedParser, deleteFloor);
function deleteFloor(req,res){
	pool.query('delete from room where id=$1',
		[req.params.id]);
		res.sendStatus(200);
}

router.post("/room",urlencodedParser, floorPost);
function floorPost(req, res){
	req.session.room = req.body.roomArr;
	req.session.roomid = req.body.roomID;
	res.redirect("/room");
}

module.exports = router;