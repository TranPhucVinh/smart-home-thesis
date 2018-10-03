const express = require('express');
const router = express.Router();
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../database/database');

router.get("/", indexGet);
function indexGet(req, res){
	if(req.session.username&&req.session.password)
	{
		res.redirect("/dashboard");
	}
	else
	{	
		res.sendFile(__dirname + "/index.html");
	}
}

router.get("/logout", logout);
function logout(req, res) {
	req.session.username = undefined;
	res.redirect("/");
}
module.exports = router;