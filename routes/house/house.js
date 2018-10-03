const express = require('express');
const router = express.Router();
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../../database/database');

router.get("/", houseGet);
function houseGet(req, res) {
	var nameArr = [], idArr = [], i;
	if (req.session.userid == undefined) {
		res.redirect("/login");
	}
	else {
	pool.query('select * from floor where userid=$1 and housename=$2',
		[req.session.userid, req.session.house], (err, result) => {
		if (result.rows.length != 0) {
					for (i=0; i<result.rows.length; i++){
					nameArr.push(result.rows[i].name);
					idArr.push(result.rows[i].id);
				}
		}
	res.render("house", {currentHouse: req.session.house,
	nameArr: nameArr,
			idArr: idArr,
		username: req.session.username});
		});
	}
}
router.post("/add",urlencodedParser, dashboardPost);
function dashboardPost(req, res){
	var floorName = req.body.floorName;
	var duplicate = "Duplicate";
	
	pool.query('select userid, name from floor where userid=$1 and name =$2 and housename=$3',
		[req.session.userid, floorName, req.session.house],
		(error,response) => {
			if (response.rowCount >=1){
				res.send(duplicate);
			}
			else{
				pool.query('insert into floor (name, userid, housename) values ($1, $2, $3)',
					[floorName, req.session.userid, req.session.house]);
				res.redirect("/house");
			}
		});
}

router.post("/edit", urlencodedParser, editPost);
function editPost(req, res){
	pool.query('update floor set name=$1 where id=$2',
		[req.body.editname, req.body.editid]);
		res.redirect("/house");
}

router.delete("/delete/:id", urlencodedParser, deleteFloor);
function deleteFloor(req,res){
	pool.query('delete from floor where id=$1',
		[req.params.id]);
		res.sendStatus(200);
}

router.post("/floor",urlencodedParser, floorPost);
function floorPost(req, res){
	req.session.floor = req.body.floorArr;
	req.session.floorid = req.body.floorID;
	res.redirect("/floor");
}

module.exports = router;