var ws;

window.onload = function() {
    var url = window.location.host;
    ws = new WebSocket('wss://' + url + '/ws');
    var ledID = document.getElementById('led-switch');

    ws.onopen = function() {
        ws.send("Message to send");
    };

    ws.onmessage = function (evt) {
        var arr = evt.data.split('&');
        if (arr[1] == "LED_OFF") {
            ledID.checked = false;
        }
        else if (arr[1] == "LED_ON") {
           ledID.checked = true;
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