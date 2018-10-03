const express = require('express');
const router = express.Router();
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../../database/database');

router.get("/", dashboardGet);
function dashboardGet(req, res){
	var nameArr = [], idArr = [], i;
	if (req.session.userid == undefined) {
		res.redirect("/login");
	}
	else {
	pool.query('select * from house where userid=$1',[req.session.userid], (err, result) => {
		if (result.rows.length != 0) {
					for (i=0; i<result.rows.length; i++){
					nameArr.push(result.rows[i].name);
					idArr.push(result.rows[i].id);
				}
		}
		res.render("dashboard", {nameArr: nameArr,
			idArr: idArr,
			username: req.session.username});
		});
	}
}

router.post("/add",urlencodedParser, dashboardPost);
function dashboardPost(req, res){
	var houseName = req.body.houseName;
	var duplicate = "Duplicate";
	
	pool.query('select userid, name from house where userid=$1 and name =$2',
		[req.session.userid, houseName],
		(error,response) => {
			if (response.rowCount >=1){
				res.send(duplicate);
			}
			else{
				pool.query('insert into house (name, userid) values ($1, $2)',
					[houseName, req.session.userid]);
				res.redirect("/dashboard");
			}
		});
}

router.post("/edit", urlencodedParser, editPost);
function editPost(req, res){
	pool.query('update house set name=$1 where id=$2',
		[req.body.editname, req.body.editid]);
		res.redirect("/dashboard");
}

router.delete("/delete/:id", urlencodedParser, deleteHouse)
function deleteHouse(req,res){
	pool.query('delete from house where id=$1',
		[req.params.id]);
		res.sendStatus(200);
}

// router.post("/login", loginSend);
// function loginSend(req, res){
// 	res.send(req.session.username);
// }	

router.post("/house",urlencodedParser, houseGet);
function houseGet(req, res){
	req.session.house = req.body.houseArr;
	req.session.houseid = req.body.houseID;
	res.redirect("/house");
}

module.exports = router;