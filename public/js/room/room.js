var ledID;
var ws;

window.onload = function(){
	var url = window.location.host;
    	ws = new WebSocket('wss://' + url + '/ws');

	ws.onopen = function() {
        ws.send("Message to send");
    };   

    ws.onmessage = function (evt) {
        // console.log(evt);
        // console.log("Data type: " + typeof(evt));
        var arr = evt.data.split('&');
        // console.log("Array " + arr[0]);
        if (arr[1] == "LED_OFF") {
            $('#'+arr[0]).attr('checked', false);
        }
        else if (arr[1] == "LED_ON") {
        	$('#'+arr[0]).attr('checked', true);
        }
    };
}

    $("input").click(function(){
        ledID = $(this).attr("id"); // get id of an on-click variable id

		var led_status = "LED_OFF";

		if ($('#'+ledID).is(':checked')) {
	// use $('#'+ledID).is(':checked') in Jquery, not like id.checked in JS			
			led_status = "LED_ON";
		}
		ws.send(led_status);
	});

