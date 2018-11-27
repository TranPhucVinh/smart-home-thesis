var ws;
var ledID;

window.onload = function() {
    var url = window.location.host;
    ws = new WebSocket('wss://' + url + '/ws');
    ledID = document.getElementById('led-switch');

    ws.onopen = function() {
        ws.send("Websocket is open");
    };

    ws.onmessage = function (evt) {
        var arr = evt.data.split('&');
        if (arr[1] == "LED_OFF") {
            ledID.checked = false;
            ws.send(arr[0]+"&received");
        }
        else if (arr[1] == "LED_ON") {
           ledID.checked = true;
            ws.send(arr[0]+"&received");
        }
    };
}

function led() {
    var led_status = "LED_OFF";
        if (ledID.checked)
            {
                led_status = "LED_ON";
             }
    ws.send(led_status);   
}    