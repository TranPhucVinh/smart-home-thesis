const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const session = require("express-session");
const urlencodedParser = bodyparser.urlencoded({ extended: false });
const ejs = require("ejs");
const websocket = require("ws");
const http = require('http');
var clients = [];

var index = require('./routes/index');
var login = require('./routes/login');
var signup = require('./routes/signup');
var dashboard = require("./routes/user/dashboard");
var house = require("./routes/house/house");
var floor = require("./routes/floor/floor");
var room = require("./routes/room/room");
var device = require("./routes/device/device");
var application = require("./routes/app/app");

app.use(session({
  secret: 'smartfarm',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname+ '/public'));

app.set("view engine", "ejs");

app.use("/",index);
app.use("/login", login);
app.use("/sign-up", signup);
app.use("/dashboard",dashboard);
app.use("/house", house);
app.use("/floor", floor);
app.use("/room", room);
app.use("/device", device);
app.use("/app", application);

const server = http.createServer(app);

var ws = new websocket.Server({ server });

function broadcast(socket, data) {
	// console.log(clients.length); 

	for(var i=0; i<clients.length; i++) { 
		if(clients[i] != socket) { 
			clients[i].send(data); 
		}
	}
}

ws.on('connection', function(socket, req) {
	clients.push(socket);
	socket.on('message', function(message) {
		// console.log('received: %s', message);
	broadcast(socket, message);
});
 
socket.on('close', function() { 
	var index = clients.indexOf(socket); 
	clients.splice(index, 1);
	console.log('disconnected');
	});
});

server.listen(process.env.PORT || 8000);