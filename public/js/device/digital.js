$(document).ready(function(){
    var url = window.location.host;
    var ws = new WebSocket('wss://' + url + '/ws');
    var ledID;
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
    
    $("input").click(function(){
        ledID = $(this).attr("id"); // get id of an on-click variable id

        var led_status = "LED_OFF";

        if ($('#'+ledID).is(':checked')) {
    // use $('#'+ledID).is(':checked') in Jquery, not like id.checked in JS         
            led_status = "LED_ON";
        }
        ws.send(led_status);
    });
});