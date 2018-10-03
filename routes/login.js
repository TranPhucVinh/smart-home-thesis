const express = require('express');
const router = express.Router();
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../database/database');

router.get("/", loginFormGet);
function loginFormGet(req, res){
	res.render("login");
}

router.post("/", urlencodedParser, loginFormPost);
function loginFormPost(req, res){
	var username = req.body.username;
	var password = req.body.password;
	
	pool.query('select id, username, password from userinfo where username=$1 and password=$2',
		[username, password], (error, response) =>{
		if (response.rowCount >=1)
		{	
			req.session.userid = response.rows[0].id;
			req.session.username = username;
			req.session.password = password;

			res.redirect("/dashboard"); // put behind req.session
		}	
		else {
			var incorrect = "Incorrect username or password.";
			res.render("login", { incorrect: incorrect
			});
		}
	});
}

module.exports = router;