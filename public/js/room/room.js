var ledID;
var ws;
var i;
var deviceArray = [], idArray = [];
var statusArray = [];

$(document).ready(function(){
	var url = window.location.host;
    ws = new WebSocket('wss://' + url + '/ws');

     $.ajax({url: "app/room.onload", type:"POST",
    async: true, 
    success: function(result){
            for(i=0;i<result.length;i++){
                deviceArray.push(result[i].name);
                idArray.push("id_"+result[i].id);
            }
            console.log(idArray);
          }
    });

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

            ws.send(arr[0]+"&received");
        }
        else if (arr[1] == "LED_ON") {
        	$('#'+arr[0]).attr('checked', true);            
            ws.send(arr[0]+"&received");
        }
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

    setTimeout(function() {
        for (i=0; i<idArray.length; i++){
         var deviceStatus = {"id": "", "status":""};
         deviceStatus.id = idArray[i];
         if ($('#'+idArray[i]).is(':checked')) {
            deviceStatus.status = "ON";
         } else {
            deviceStatus.status = "OFF";
         }
         statusArray.push(deviceStatus);
    }
    }, 1000);

    $.ajax({url: "app/app.device", type:"POST",
    async: true, 
    data: {statusArray: statusArray},
    success: function(result){
        console.log(result);
    }
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