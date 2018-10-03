const express = require('express');
const router = express.Router();
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../database/database');

router.get("/", signUpGet);
function signUpGet(req, res){
	res.render("createAccount");
}

router.post("/", urlencodedParser, signUpPost);
function signUpPost(req, res){
  var username = req.body.username,
  password = req.body.password, 
  reEnter = req.body.reEnter,
  email = req.body.email;

  if(password == reEnter){
  	pool.query('insert into userinfo (username, password, email) values ($1, $2, $3)',
  		[username, password, email], (err, res) => {
	  console.log(err, res);
		});
  	res.redirect("/");
	}
	else {
		var refuseString = "The password and re-entered password must be the same";
		res.render("createAccount", {password: refuseString,
			reEnter: refuseString
		});
	}
}
module.exports = router;