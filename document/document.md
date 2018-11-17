### Database ``smarthome``

Create table userinfo

```sql
create table userinfo (id serial primary key, username varchar not null, password varchar(30), email varchar(30));
```

Create table house

```sql
create table house (id serial primary key, name varchar not null, userid integer);
```

Create table floor

```sql
create table floor (id serial primary key, name varchar not null, userid integer, housename varchar);
```

Create table room

```sql
create table room (id serial primary key, name varchar not null, userid integer, floorname varchar, housename varchar);
```

Create table devices

```sql
create table devices (id serial primary key, name varchar not null, type varchar, floorname varchar, housename varchar, userid integer, roomname varchar);
```

### Interaction between server, esp8266 (client), android app (client)

ESP8266 send current status of GPIO to server, server replied with received status message.

When android app is opened, it sends request in okhttp websocket onOpen function to server. Android app requires the current status (ON/OFF, temperature value) in server. Server handle that in onMessage function in JS code then send back to android app. If successful, android app display the current status of device in layout.

Android app control device directly by sending control message directly to device through websocket protocol, not to server (it works by that way with OKHTTP library). So there are no sync between app and website then user turn on/off the switch in the app (the status of the corresspond switch in server doesn't sync).
server

Disadvantages: Mobile app can't handle when website is turn off (turn off websocket). It is required to have database to solve this problem.

### External port

In a heroku application, port 80 is designated port for external access.

Reference: [Heroku port number for a given application](https://stackoverflow.com/questions/46356690/heroku-port-number-for-a-given-application)
