## Feature

* Users are able to login/logout and create new account
* Each user has several house to control. Each house has several floors, each floors has several room and each room has several devices.
* After logging, a new user is able to create, view, update and delete houses, floors, rooms and devices
* User are able to control and supervise devices in specific room.
* Devices's type: Digital, Analog, Digital - Analog and motion detect
* Having Android app support for contol and observation feature

### Devices

* **Digital**: ON/OFF
* **Analog**: Devices that are able to collect analog value from sensor. User can view current collected value and observe the chart.
* **Digital and Analog**: Both feature
* **Motion detect**: Detect people's existence and display status on webpage

## Technical

### Back-end

- Node.js
- Using ``express`` for HTTP server
- Using ``ws`` module for websocket server

### Front-end

- EJS
- Bootstrap
- Jquery for Javascript's websocket application
- Canvas for Analog's chart

### Communication protocol

* Routing webpage (logon, house, room, floor, devices's credential) with Server: HTTP 
* Digital devices control with Hardware-Firmware: Websocket

### Database

* PostgreSQL Heroku (free addon)
* Database storage:
    - Username, password
    - User's house, room, floor, devices

### Devices control and telemetry handler

* Device element on Room webpage get ID through SQL execution then form its own id on the webpage
* Firmware use this ID to interact with device on room webpage (for digital devices)
* For analog devices, firmware collects analog data and sends to devices specified by its ID. Due to websocket communication, analog telemetry data is displayed real-time and is not store on database, the same solution is applied for digital devices.

### Deployment platform

* Heroku free service
* Website: https://smarthome-thesis-bku.herokuapp.com

### Existed issues

* Duplicate information doesn't display when submit "POST".
* Can't handle with duplicate value in House, Floor, Room.
