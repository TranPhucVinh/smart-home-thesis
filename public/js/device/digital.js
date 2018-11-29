var ws;
var arr;

$(document).ready(function(){
    var url = window.location.host;
    ws = new WebSocket('wss://' + url + '/ws');
    // ledID = document.getElementById('led-switch');

    ws.onopen = function() {
        ws.send("Digital is open");
    };

    ws.onmessage = function (evt) {
        arr = evt.data.split('&');
        if (arr[1] == "LED_OFF") {
            $('#'+arr[0]).attr('checked', false);
            ws.send(arr[0]+"&received");
        }
        else if (arr[1] == "LED_ON") {
           $('#'+arr[0]).attr('checked', true);            
            ws.send(arr[0]+"&received");
        }
    };

    $("input").click(function(){
        ledID = arr[0]; // get id of an on-click variable id

        var led_status = "LED_OFF";

        if ($('#'+ledID).is(':checked')) {
    // use $('#'+ledID).is(':checked') in Jquery, not like id.checked in JS 
            led_status = "LED_ON";
        }
        ws.send(ledID+"&"+led_status);
    });

});