$(document).ready(function(){
            $.ajax({url: "dashboard/login",
                type:"POST",
                async: true, 
                success: function(result){
            $("#username").html(result);
            }
        }); 
    //  $("form").submit((event) => {
    //    $.ajax({url: "dashboard/add",
    //             type:"POST",
    //             async: true,
    //             success: function(result){
    //         $("#duplicateName").html(result);
    //         }
    //     }); 
    // });
     $(".delete-house").click(function(){
        var id = $(this).attr("data-id");
        var url = "dashboard/delete/"+id;
        if(confirm("Delete house ? ")){
            $.ajax({
                url: url,
                type: "DELETE",
                success: function(result){
                    window.location.href="/dashboard";
                }
            });
        }
    });
    $(".edit-house").click(function(){
        $("#editid").val($(this).attr("data-id"));
        $("#editname").val($(this).attr("data-name"));
    });
});