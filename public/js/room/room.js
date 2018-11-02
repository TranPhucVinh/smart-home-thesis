var ledID;
var ws;
var i, duplicate = 0;
var arrayStatus = [];
var returnArray = [];
 //create 2 array to store ID of each device and current status of LED
var arrayID = [];
var arrMessage = [];

$(document).ready(function(){
	var url = window.location.host;
    	ws = new WebSocket('wss://' + url + '/ws');

	ws.onopen = function() {
        ws.send("Websocket is open");
    }

    ws.onmessage = function (evt) {
        // console.log(evt);
        // console.log("Data type: " + typeof(evt));

        var arr = evt.data.split('&');
        // console.log("Array " + arr[0]);        

        if (arr[1] == "LED_OFF") {
            $('#'+arr[0]).attr('checked', false);
            if (arrayID.length == 0) {
                arrayID.push(arr[0]);
                arrayStatus.push(false);
            }
            for (i=0;i<arrayID[arrayID.length];i++){
                if (arr[0] != arrayID[i])
                    duplicate = 1;
            }
            if (arr[0] != arrayID[arrayID.length - 1]){
                arrayID.push(arr[0]);
                arrayStatus.push(false);    
            }
            ws.send(arr[0]+"&received");
        }
        else if (arr[1] == "LED_ON") {
        	$('#'+arr[0]).attr('checked', true);

            if (arrayID.length == 0) {
                arrayID.push(arr[0]);
                arrayStatus.push(true);
            }
            if (arr[0] != arrayID[arrayID.length - 1]){
                arrayID.push(arr[0]);
                arrayStatus.push(true);    
            }
            ws.send(arr[0]+"&received");
        }
        if (evt.data == "App websocket is opened"){
            console.log(evt);
            for(i=0; i<arrayID.length ; i++){
                var deviceJSON = {"id": "", "status": ""};
                deviceJSON.id = arrayID[i];
                deviceJSON.status = arrayStatus[i];
                returnArray.push(deviceJSON);
            }
                console.log(returnArray);
                ws.send(returnArray);
        }
        console.log(arrayID);
        console.log(arrayStatus);
    }
     $("input").click(function(){
        ledID = $(this).attr("id"); // get id of an on-click variable id

		var led_status = "LED_OFF";

		if ($('#'+ledID).is(':checked')) {
	// use $('#'+ledID).is(':checked') in Jquery, not like id.checked in JS			
			led_status = "LED_ON";
		}
		ws.send(ledID+"&"+led_status);
	});
        $(".delete-device").click(function(){
        var id = $(this).attr("data-id");
        var url = "room/delete/"+id;
        if(confirm("Delete device ? ")){
            $.ajax({
                url: url,
                type: "DELETE",
                success: function(result){
                    window.location.href="/room";
                }
            });
        }
    });
    $(".edit-device").click(function(){
        $("#editid").val($(this).attr("data-id"));
        $("#editname").val($(this).attr("data-name"));
    });
});