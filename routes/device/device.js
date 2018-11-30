const express = require('express');
const router = express.Router();
const bodyparser = require("body-parser");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const pool = require('./../../database/database');

router.get("/", deviceGet);
function deviceGet(req, res) {
	if (req.session.username == undefined) {
		res.redirect("/login");
	}
	else if (req.session.deviceType == "digital")
	res.render("digital", {username: req.session.username, 
		tempID: req.session.tempID});
	else if (req.session.deviceType == "analog")
	res.render("analog", {username: req.session.username,
	tempID: req.session.tempID});
	else res.redirect("/room");
}

module.exports = router;